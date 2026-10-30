package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/model"
)

type syncCenterWork struct {
	member  BrandProfileMember
	product map[string]any
}
type syncCenterResult struct {
	products, skus int
	err            error
}

// Start snapshots all stores in a profile; concurrent starts reuse the same durable run.
func (center *SyncCenter) Start(ctx context.Context, profileID string) (SyncCenterRun, error) {
	if _, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, profileID); err != nil {
		return SyncCenterRun{}, err
	} else if len(members) == 0 {
		return SyncCenterRun{}, errors.New("聚合品牌没有门店，不能同步")
	}
	lease, err := center.lockRegistry(ctx, profileID, syncRegistryStarting, true)
	if err != nil {
		return SyncCenterRun{}, err
	}
	defer lease.close()
	run, err := center.startRegistered(lease.ctx, profileID)
	if err == nil {
		err = center.updateRegistryRun(lease.ctx, run)
	}
	return run, err
}

func (center *SyncCenter) startRegistered(ctx context.Context, profileID string) (SyncCenterRun, error) {
	profile, members, err := center.source.inventoryRepository.GetBrandProfile(ctx, profileID)
	if err != nil {
		return SyncCenterRun{}, err
	}
	if len(members) == 0 {
		return SyncCenterRun{}, errors.New("聚合品牌没有门店，不能同步")
	}
	if reused, ok, reuseErr := center.resumeRun(ctx, profile, members); ok || reuseErr != nil {
		return reused, reuseErr
	}
	run := SyncCenterRun{Members: members, ID: uuid.NewString(), ProfileID: profileID, ProfileName: profile.Name, Status: SyncCenterRunning, Stage: SyncCenterStageLists, StartedAt: time.Now(), UpdatedAt: time.Now()}
	if _, err = center.runs.InsertOne(ctx, run); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			err = center.runs.FindOne(ctx, bson.M{"profileId": profileID, "status": SyncCenterRunning}).Decode(&run)
		}
		return run, err
	}
	go center.execute(run, members)
	return run, nil
}

func (center *SyncCenter) execute(run SyncCenterRun, members []BrandProfileMember) {
	ctx, cancel := context.WithDeadline(context.Background(), run.StartedAt.Add(syncRunMaxLifetime))
	defer cancel()
	err := center.buildGeneration(ctx, &run, members)
	now := time.Now()
	run.FinishedAt = &now
	if err != nil {
		run.Status = SyncCenterFailed
		run.Error = err.Error()
	} else {
		run.Status = SyncCenterComplete
		center.recordCompletedStability(&run)
	}
	saveCtx, saveCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer saveCancel()
	if saveErr := center.saveRun(saveCtx, &run); saveErr != nil {
		fmt.Printf("sync center persist final state: %v\n", saveErr)
	}
}

func (center *SyncCenter) buildGeneration(ctx context.Context, run *SyncCenterRun, members []BrandProfileMember) error {
	work, err := center.listWork(ctx, members)
	if err != nil {
		return err
	}
	encoded, _ := json.Marshal(workFingerprintRows(work))
	fingerprint := hashID(string(encoded))
	if err = center.ensureStagingWritable(ctx, *run); err != nil {
		return err
	}
	if err = center.reconcileStagingIdentities(ctx, *run, work); err != nil {
		return err
	}

	run.WorkFingerprint = fingerprint
	run.Processed = 0
	run.ProductCount = 0
	run.SKUCount = 0
	run.Total = len(work)
	run.Stage = SyncCenterStageDetails
	if err = center.saveRun(ctx, run); err != nil {
		return err
	}
	if err = center.readDetails(ctx, run, work); err != nil {
		return err
	}
	// Refuse to publish a snapshot of a membership configuration that changed mid-run.
	_, current, err := center.source.inventoryRepository.GetBrandProfile(ctx, run.ProfileID)
	if err != nil {
		return err
	}
	if !sameSyncMembers(members, current) {
		return errors.New("同步期间聚合品牌门店发生变化，请重新同步")
	}
	run.Stage = SyncCenterStageActivate
	if err = center.saveRun(ctx, run); err != nil {
		return err
	}
	head := SyncCenterSnapshot{ProfileID: run.ProfileID, Generation: run.ID, SyncedAt: time.Now(), Members: members, ProductCount: run.ProductCount, SKUCount: run.SKUCount}
	if err = center.stageMetadata(ctx, head, run.ProfileName); err != nil {
		return err
	}
	_, latestMembers, metadataErr := center.source.inventoryRepository.GetBrandProfile(ctx, run.ProfileID)
	if metadataErr != nil {
		return metadataErr
	}
	if !sameSyncMembers(members, latestMembers) {
		return errors.New("元数据同步期间品牌门店发生变化，拒绝激活")
	}
	_, err = center.heads.ReplaceOne(ctx, bson.M{"_id": run.ProfileID}, head, options.Replace().SetUpsert(true))
	return err
}

func (center *SyncCenter) listWork(ctx context.Context, members []BrandProfileMember) ([]syncCenterWork, error) {
	work := []syncCenterWork{}
	for _, member := range members {
		products, err := center.source.ListLiveBrandOffers(ctx, member.RegionID, member.DistributorID, nil)
		if err != nil {
			return nil, fmt.Errorf("门店 %s/%s 列表读取失败: %w", member.RegionID, member.DistributorID, err)
		}
		seen := map[string]bool{}
		for _, product := range products {
			id := syncSourceID(product)
			if id == "" || seen[id] {
				return nil, fmt.Errorf("门店 %s 列表商品ID为空或分页重复，拒绝覆盖完整版本", member.DistributorID)
			}
			seen[id] = true
			work = append(work, syncCenterWork{member: member, product: product})
		}
	}
	return work, nil
}

func (center *SyncCenter) readDetails(ctx context.Context, run *SyncCenterRun, work []syncCenterWork) error {
	workCtx, cancel := context.WithCancelCause(ctx)
	defer cancel(nil)
	jobs := make(chan syncCenterWork)
	results := make(chan syncCenterResult, 4)
	identity := *run
	var workers sync.WaitGroup
	for i := 0; i < 4; i++ {
		workers.Add(1)
		go func() { defer workers.Done(); center.syncDetailsWorker(workCtx, cancel, identity, jobs, results) }()
	}
	go scheduleSyncCenterWork(workCtx, jobs, work)
	go func() { workers.Wait(); close(results) }()
	// Drain every in-flight worker, keeping successful product checkpoints and the original failure.
	for result := range results {
		run.Processed++
		run.ProductCount += result.products
		run.SKUCount += result.skus
		cause := context.Cause(workCtx)
		firstFailure := cause != nil && run.Error == ""
		if firstFailure {
			run.Error = cause.Error()
		}
		if firstFailure || run.Processed%10 == 0 || run.Processed == run.Total {
			if err := center.persistSyncProgress(run); err != nil {
				cancel(err)
			}
		}
	}
	cause := context.Cause(workCtx)
	if cause != nil {
		run.Error = cause.Error()
	}
	if err := center.persistSyncProgress(run); err != nil && cause == nil {
		return err
	}
	return cause
}

func (center *SyncCenter) syncDetailsWorker(ctx context.Context, cancel context.CancelCauseFunc, run SyncCenterRun, jobs <-chan syncCenterWork, results chan<- syncCenterResult) {
	for {
		select {
		case <-ctx.Done():
			return
		case item, open := <-jobs:
			if !open || ctx.Err() != nil {
				return
			}
			result := center.syncOne(ctx, run, item)
			if result.err != nil {
				cancel(result.err)
			}
			// The collector always drains results, even after cancellation.
			results <- result
		}
	}
}

func scheduleSyncCenterWork(ctx context.Context, jobs chan<- syncCenterWork, work []syncCenterWork) {
	defer close(jobs)
	for _, item := range work {
		if ctx.Err() != nil {
			return
		}
		select {
		case <-ctx.Done():
			return
		case jobs <- item:
		}
	}
}

func (center *SyncCenter) persistSyncProgress(run *SyncCenterRun) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	return center.saveRun(ctx, run)
}

func (center *SyncCenter) syncOne(ctx context.Context, run SyncCenterRun, work syncCenterWork) syncCenterResult {
	existing, found, lookupErr := center.stagedProduct(ctx, run, work)
	if lookupErr != nil {
		return syncCenterResult{err: lookupErr}
	}
	if found {
		return existing
	}
	detail, err := center.fetchDetail(ctx, work)
	if err != nil {
		return syncCenterResult{err: fmt.Errorf("商详 %s/%s: %w", work.member.RegionID, syncSourceID(work.product), err)}
	}
	if detail == nil {
		return syncCenterResult{}
	}
	product, skus, err := buildSyncCenterRows(run, work, detail)
	if err != nil {
		return syncCenterResult{err: err}
	}
	// A failed SKU bulk write can leave partial rows without its product checkpoint.
	// Replace that staging product's SKU set; never clear an activated generation.
	if err = center.ensureStagingWritable(ctx, run); err != nil {
		return syncCenterResult{err: err}
	}
	if _, err = center.skus.DeleteMany(ctx, bson.M{"generation": run.ID, "productId": product.ID}); err != nil {
		return syncCenterResult{err: err}
	}
	if len(skus) > 0 {
		writes := make([]mongo.WriteModel, len(skus))
		for i, sku := range skus {
			writes[i] = mongo.NewReplaceOneModel().SetFilter(bson.M{"_id": sku.ID}).SetReplacement(sku).SetUpsert(true)
		}
		if _, err = center.skus.BulkWrite(ctx, writes); err != nil {
			return syncCenterResult{err: err}
		}
	}
	if _, err = center.products.ReplaceOne(ctx, bson.M{"_id": product.ID}, product, options.Replace().SetUpsert(true)); err != nil {
		return syncCenterResult{err: err}
	}

	return syncCenterResult{products: 1, skus: len(skus)}
}

func (center *SyncCenter) fetchDetail(ctx context.Context, work syncCenterWork) (map[string]any, error) {
	var err error
	for attempt := 0; attempt < 3; attempt++ {
		var detail map[string]any
		detail, err = center.fetchStrictDetail(ctx, work)
		if err == nil {
			return detail, nil
		}
		var missing syncCenterMissingError
		if errors.As(err, &missing) {
			return map[string]any{"item_id": syncSourceID(work.product), "item_no": mapString(work.product, "item_no"), "store": int64(0), "item_total_store": int64(0), "approve_status": "instock", "_sync_tombstone": true, "_sync_missing_reason": err.Error()}, nil
		}
		if attempt == 2 {
			return nil, err
		}
		timer := time.NewTimer(time.Duration(attempt+1) * time.Second)
		select {
		case <-ctx.Done():
			timer.Stop()
			return nil, ctx.Err()
		case <-timer.C:
		}
	}
	return nil, err
}

func syncSourceID(product map[string]any) string {
	return firstNonEmpty(mapString(product, "default_item_id"), mapString(product, "item_id"), mapString(product, "goods_id"))
}

func buildSyncCenterRows(run SyncCenterRun, work syncCenterWork, detail map[string]any) (SyncCenterProduct, []SyncCenterSKU, error) {
	product, err := buildSyncCenterProduct(run, work, detail)
	if err != nil {
		return product, nil, err
	}
	rawSKUs, err := syncCenterSpecs(detail)
	if err != nil {
		return product, nil, err
	}
	rows := make([]SyncCenterSKU, 0, len(rawSKUs))
	seen := map[string]bool{}
	for _, raw := range rawSKUs {
		row, rowErr := buildSyncCenterSKU(run, product, detail, anyMap(raw))
		if rowErr != nil {
			return product, nil, rowErr
		}
		if seen[row.SourceSKUID] {
			return product, nil, fmt.Errorf("商详 %s 规格为空或重复", product.ItemID)
		}
		seen[row.SourceSKUID] = true
		rows = append(rows, row)
	}
	projectSyncCenterProduct(&product, rows)
	return product, rows, nil
}

func buildSyncCenterProduct(run SyncCenterRun, work syncCenterWork, detail map[string]any) (SyncCenterProduct, error) {
	originalNo := strings.TrimSpace(mapString(work.product, "item_no"))
	detailNo := strings.TrimSpace(mapString(detail, "item_no"))
	if detailNo == "" {
		return SyncCenterProduct{}, errors.New("商详缺少货号，无法确认商品身份")
	}
	if originalNo != "" && model.ItemNoKey(originalNo) != model.ItemNoKey(detailNo) {
		return SyncCenterProduct{}, fmt.Errorf("商详货号不一致 %s/%s", originalNo, detailNo)
	}
	itemID := syncSourceID(work.product)
	product := SyncCenterProduct{ItemNoKey: model.ItemNoKey(detailNo), ID: hashID(run.ID, work.member.RegionID, work.member.DistributorID, itemID), ProfileID: run.ProfileID, Generation: run.ID, RegionID: work.member.RegionID, DistributorID: work.member.DistributorID, ItemID: itemID, ItemNo: firstNonEmpty(detailNo, originalNo), Name: firstNonEmpty(mapString(detail, "item_name"), mapString(detail, "title"), mapString(detail, "name")), Data: detail, SyncedAt: time.Now()}
	product.CategoryIDs = syncCategoryIDs(detail)
	return product, nil
}

func syncCenterSpecs(detail map[string]any) ([]any, error) {
	if raw, present := detail["spec_items"]; present && raw != nil {
		switch raw.(type) {
		case []any, bson.A:
		default:
			return nil, errors.New("商详规格结构错误，库存未知")
		}
	}
	rawSKUs := anySlice(detail["spec_items"])
	if len(rawSKUs) == 0 {
		if _, ok := detail["store"]; !ok {
			if _, ok = detail["item_total_store"]; !ok {
				return nil, errors.New("商详缺少规格和库存，拒绝作为完整数据")
			}
		}
		rawSKUs = []any{detail}
	}
	return rawSKUs, nil
}

func buildSyncCenterSKU(run SyncCenterRun, product SyncCenterProduct, detail, sku map[string]any) (SyncCenterSKU, error) {
	itemID := product.ItemID
	stock, stockErr := strictSyncStock(sku)
	if stockErr != nil {
		return SyncCenterSKU{}, stockErr
	}
	skuID := firstNonEmpty(mapString(sku, "item_id"), mapString(sku, "erp_sku_code"), mapString(sku, "custom_spec_id"), itemID)
	price := firstPositive(mapInt64(sku, "activity_price"), mapInt64(sku, "act_price"), mapInt64(sku, "price"), mapInt64(detail, "activity_price"), mapInt64(detail, "act_price"), mapInt64(detail, "price"))
	saleStatus := firstNonEmpty(mapString(sku, "approve_status"), mapString(detail, "approve_status"))
	available := stock
	if !syncSaleableStatus(saleStatus) || !syncSaleableStatus(mapString(detail, "approve_status")) {
		available = 0
	}
	return SyncCenterSKU{ProfileName: run.ProfileName, Name: product.Name, SourceItemID: itemID, SKUCode: mapString(sku, "erp_sku_code"), ActivityPriceCents: firstPositive(mapInt64(sku, "activity_price"), mapInt64(sku, "act_price"), mapInt64(detail, "activity_price"), mapInt64(detail, "act_price")), SaleStatus: saleStatus, AvailableStock: available, CategoryIDs: syncCategoryIDs(detail), ObservedAt: product.SyncedAt, ID: hashID(product.ID, skuID), ProfileID: run.ProfileID, Generation: run.ID, ProductID: product.ID, RegionID: product.RegionID, DistributorID: product.DistributorID, ItemNo: product.ItemNo, SourceSKUID: skuID, Label: firstNonEmpty(mapString(sku, "custom_spec_name"), variantLabel(sku)), Stock: stock, PriceCents: price, MarketCents: firstPositive(mapInt64(sku, "market_price"), mapInt64(detail, "market_price")), Raw: sku, SyncedAt: product.SyncedAt}, nil
}

func projectSyncCenterProduct(product *SyncCenterProduct, rows []SyncCenterSKU) {
	product.DiscountRate = 101
	for _, row := range rows {
		product.Stock += row.AvailableStock
		if row.AvailableStock <= 0 || row.PriceCents <= 0 {
			continue
		}
		if product.PriceCents == 0 || row.PriceCents < product.PriceCents {
			product.PriceCents = row.PriceCents
			product.DiscountRate = 101
			if row.MarketCents > 0 {
				product.DiscountRate = float64(row.PriceCents) / float64(row.MarketCents) * 100
			}
		}
	}

}

func syncCategoryIDs(detail map[string]any) []string {
	ids := []string{}
	seen := map[string]bool{}
	for _, key := range []string{"item_category_main", "item_category_info"} {
		for _, category := range categoryMaps(detail[key]) {
			appendSyncCategoryTree(category, seen, &ids)
		}
	}
	return ids
}

func appendSyncCategoryTree(category map[string]any, seen map[string]bool, ids *[]string) {
	appendSyncCategoryID(firstNonEmpty(mapString(category, "category_id"), mapString(category, "id")), seen, ids)
	for _, id := range strings.Split(mapString(category, "path"), ",") {
		appendSyncCategoryID(strings.TrimSpace(id), seen, ids)
	}
	for _, child := range categoryMaps(category["children"]) {
		appendSyncCategoryTree(child, seen, ids)
	}
}

func appendSyncCategoryID(id string, seen map[string]bool, ids *[]string) {
	if id != "" && !seen[id] {
		seen[id] = true
		*ids = append(*ids, id)
	}
}

// Prices and stock fluctuate during a run; only stable source identity belongs in this digest.
func workFingerprintRows(work []syncCenterWork) []string {
	rows := make([]string, len(work))
	for i, item := range work {
		encoded, _ := json.Marshal([]string{item.member.RegionID, item.member.DistributorID, syncSourceID(item.product), model.ItemNoKey(mapString(item.product, "item_no"))})
		rows[i] = string(encoded)
	}
	sort.Strings(rows)
	return rows
}

type syncCenterMissingError struct{ message string }

func (err syncCenterMissingError) Error() string { return err.message }

// The synchronization boundary never turns a generic 422, permission error, or empty response into absence.
func (center *SyncCenter) fetchStrictDetail(ctx context.Context, work syncCenterWork) (map[string]any, error) {
	select {
	case center.source.detailSemaphore <- struct{}{}:
		defer func() { <-center.source.detailSemaphore }()
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	detail, err := center.requestStrictDetail(ctx, work)
	if err != nil {
		return nil, err
	}
	return mergeFreshProductDetail(work.product, detail), nil
}

func validateSyncDetailResponse(detail map[string]any) error {
	if len(detail) == 0 {
		return errors.New("商品详情响应为空，无法确认库存")
	}
	message := mapString(detail, "message")
	if strings.Contains(message, "商品不存在") || strings.Contains(message, "商品已下架") || strings.Contains(message, "该商品已下架") {
		return syncCenterMissingError{message: message}
	}
	if mapInt64(detail, "status_code") >= 400 {
		return fmt.Errorf("商品详情失败: %s", firstNonEmpty(message, "上游错误，库存未知"))
	}
	return nil
}

func syncSaleableStatus(status string) bool {
	return status == "" || status == "onsale" || status == "only_show"
}

// strictSyncStock distinguishes confirmed zero from malformed or missing inventory.
func strictSyncStock(source map[string]any) (int64, error) {
	var stock int64
	found := false
	for _, key := range []string{"store", "item_total_store"} {
		raw, present := source[key]
		if !present {
			continue
		}
		number, valid := strictSyncInteger(raw)
		if !valid || number < 0 {
			return 0, fmt.Errorf("规格库存 %s 非有效非负整数，禁止覆盖完整快照", key)
		}
		if !found {
			stock = number
			found = true
		}
	}
	if !found {
		return 0, errors.New("规格缺少库存，禁止覆盖完整快照")
	}
	return stock, nil
}

func strictSyncInteger(raw any) (int64, bool) {
	switch value := raw.(type) {
	case int:
		return int64(value), true
	case int32:
		return int64(value), true
	case int64:
		return value, true
	case json.Number:
		number, err := value.Int64()
		return number, err == nil
	case string:
		number, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
		return number, err == nil
	case float64:
		if math.IsNaN(value) || math.IsInf(value, 0) || value < math.MinInt64 || value >= math.MaxInt64 || math.Trunc(value) != value {
			return 0, false
		}
		return int64(value), true
	default:
		return 0, false
	}
}

func (center *SyncCenter) ensureStagingWritable(ctx context.Context, run SyncCenterRun) error {
	var head SyncCenterSnapshot
	err := center.heads.FindOne(ctx, bson.M{"_id": run.ProfileID}).Decode(&head)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return err
	}
	if head.Generation == run.ID {
		return errors.New("已发布的同步版本不可再次写入，请启动新的同步任务")
	}
	return nil
}

// requestStrictDetail retains explicit absence evidence in an HTTP error body without
// treating status 422 alone as absence. It uses the same configured source client.
func (center *SyncCenter) requestStrictDetail(ctx context.Context, work syncCenterWork) (map[string]any, error) {
	endpoint, err := url.Parse(strings.TrimRight(center.source.config.APIBase, "/") + "/goods/items/" + syncSourceID(work.product))
	if err != nil {
		return nil, err
	}
	endpoint.RawQuery = url.Values{"regionauth_id": {work.member.RegionID}, "company_id": {center.source.config.CompanyID}}.Encode()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, err
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("authorizer-appid", center.source.config.AuthorizerAppID)
	response, err := center.source.httpClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	payload := map[string]any{}
	decodeErr := json.NewDecoder(io.LimitReader(response.Body, 16<<20)).Decode(&payload)
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		if decodeErr == nil {
			if message := explicitSyncMissingMessage(payload); message != "" {
				return nil, syncCenterMissingError{message: message}
			}
		}
		return nil, fmt.Errorf("catalog API returned HTTP %d，库存未知", response.StatusCode)
	}
	if decodeErr != nil {
		return nil, fmt.Errorf("商品详情JSON读取失败: %w", decodeErr)
	}
	detail := anyMap(payload["data"])
	if err = validateSyncDetailResponse(detail); err != nil {
		return nil, err
	}
	return detail, nil
}

func explicitSyncMissingMessage(payload map[string]any) string {
	for _, body := range []map[string]any{payload, anyMap(payload["data"])} {
		for _, key := range []string{"message", "msg"} {
			message := mapString(body, key)
			if strings.Contains(message, "商品不存在") || strings.Contains(message, "商品已下架") || strings.Contains(message, "该商品已下架") {
				return message
			}
		}
	}
	return ""
}

// Stability is a local secondary projection; failure must not roll back a complete source head.
func (center *SyncCenter) recordCompletedStability(run *SyncCenterRun) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	_, err := center.RecordActiveStability(ctx, run.ProfileID)
	if err != nil {
		run.StabilityError = err.Error()
		fmt.Printf("sync center stability projection failed for %s: %v\n", run.ProfileID, err)
	}
}
