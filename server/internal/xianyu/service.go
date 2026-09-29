package xianyu

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"

	"sidejob-server/internal/config"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
)

// PublishInput 是闲鱼 API 发布所需商品信息。
type PublishInput struct {
	Quantity           int64
	Title              string
	Description        string
	PriceCents         int64
	OriginalPriceCents int64
	ImagePaths         []string
	RegionID           string
	Brand              string
	Condition          string
	AvailableSizes     []string
	Variants           []PublishVariant
	IsFootwear         bool
}

// PublishVariant 是卖家工作台发布接口的一条可售规格。
type PublishVariant struct {
	PriceCents int64
	Quantity   int64
	Properties []PublishVariantProperty
}

// PublishVariantProperty 是一条规格属性，例如“鞋码：42”。
type PublishVariantProperty struct {
	Name  string
	Value string
}

// PublishResult 是闲鱼发布成功结果。
type PublishResult struct {
	ItemID string
	URL    string
}

// OnSaleItem 是闲鱼“我发布的”接口返回的当前在卖商品。
type OnSaleItem struct {
	ItemID     string
	Title      string
	PriceCents int64
	ImageURL   string
	CategoryID string
	Status     string
}

// OfflineResult 是一次下架操作的逐商品结果。
type OfflineResult struct {
	SucceededItemIDs []string
	FailedItemIDs    []string
}

// SearchInput 是闲鱼公开搜索所需的统一筛选条件。
type SearchInput struct {
	Keyword     string
	RowsPerPage int
	Condition   []string
	Shipping    string
}

// SearchItem 是闲鱼市场搜索返回的候选商品。
type SearchItem struct {
	ItemID             string
	Title              string
	PriceCents         int64
	OriginalPriceCents int64
	ImageURL           string
	ItemURL            string
	Attributes         map[string]string
}

// Service 管理加密会话并编排闲鱼 MTop 发布流程。
type Service struct {
	config            config.XianyuConfig
	sessionRepository *repository.SessionRepository
	sessionCipher     *security.Cipher
	sellerWorkbench   bool
	accountID         string
}

// NewSellerService 创建卖家工作台专用闲鱼服务。
func NewSellerService(serviceConfig config.XianyuConfig, sessionRepository *repository.SessionRepository, sessionCipher *security.Cipher) *Service {
	service := NewService(serviceConfig, sessionRepository, sessionCipher)
	service.sellerWorkbench = true
	return service
}

// NewService 创建闲鱼 API 服务。
func NewService(
	serviceConfig config.XianyuConfig,
	sessionRepository *repository.SessionRepository,
	sessionCipher *security.Cipher,
) *Service {
	return &Service{
		config:            serviceConfig,
		sessionRepository: sessionRepository,
		sessionCipher:     sessionCipher,
		accountID:         model.DefaultXianyuAccountID,
	}
}

// ForAccount 返回绑定到指定闲鱼账号的服务实例。
func (service *Service) ForAccount(accountID string) *Service {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	return &Service{
		config:            service.config,
		sessionRepository: service.sessionRepository.ForAccount(accountID),
		sessionCipher:     service.sessionCipher,
		sellerWorkbench:   service.sellerWorkbench,
		accountID:         accountID,
	}
}

// AccountID 返回当前服务绑定的账号 ID。
func (service *Service) AccountID() string { return service.accountID }

// Connect 解析任意闲鱼 cURL 或 Cookie，校验后加密保存可用凭证。
func (service *Service) Connect(ctx context.Context, rawCredential string) (string, bool, error) {
	displayName, _, searchReady, err := service.ConnectWithIdentity(ctx, rawCredential, "")
	return displayName, searchReady, err
}

// ConnectWithIdentity 校验凭证并返回可用于账号绑定的平台用户 ID。
func (service *Service) ConnectWithIdentity(ctx context.Context, rawCredential, expectedPlatformUserID string) (string, string, bool, error) {
	parsedCredential, err := ParseCredential(rawCredential)
	if err != nil {
		return "", "", false, err
	}
	client, err := NewClient(service.config, parsedCredential.Cookie)
	if err != nil {
		return "", "", false, err
	}
	client.SetSellerWorkbenchMode(service.sellerWorkbench)
	if service.sellerWorkbench {
		if err := validateSellerWorkbenchSession(ctx, client); err != nil {
			return "", "", false, fmt.Errorf("闲鱼卖家后台凭证校验失败：%w", err)
		}
	}

	// 用户资料接口只用于补充昵称；部分可搜索的静默会话无法访问该接口，不阻断凭证保存。
	var navigationResponse map[string]any
	_ = client.Call(ctx, "mtop.idle.web.user.page.nav", "1.0", map[string]any{}, &navigationResponse)
	displayName := readDisplayName(navigationResponse)
	platformUserID := readPlatformUserID(navigationResponse)
	if platformUserID == "" {
		platformUserID = credentialPlatformUserID(parsedCredential.Cookie)
	}
	if expectedPlatformUserID != "" && platformUserID != "" && platformUserID != expectedPlatformUserID {
		return "", "", false, errors.New("当前凭证属于另一个闲鱼账号，请新增账号后再连接")
	}
	if displayName == "" {
		existingSession, existingErr := service.sessionRepository.Get(ctx)
		if existingErr == nil {
			displayName = existingSession.DisplayName
		}
		if displayName == "" {
			displayName = "闲鱼凭证"
		}
	}

	hasSearchCredential, err := service.saveConnectedCredential(ctx, client.CookieHeader(), displayName, parsedCredential.SearchCredential)
	if err != nil {
		return "", "", false, err
	}
	if platformUserID != "" {
		session, loadErr := service.sessionRepository.Get(ctx)
		if loadErr == nil {
			session.PlatformUserID = platformUserID
			_ = service.sessionRepository.Save(ctx, session)
		}
	}
	return displayName, platformUserID, hasSearchCredential, nil
}

// credentialPlatformUserID 从 Cookie 中读取稳定的闲鱼用户 ID。
func credentialPlatformUserID(rawCookie string) string {
	cookies := parseCookieHeader(rawCookie)
	for _, key := range []string{"unb", "user_id", "userid", "uid"} {
		if value := strings.TrimSpace(cookies[key]); value != "" {
			return value
		}
	}
	return ""
}

// PlatformUserIDFromCredential 在不保存凭证的情况下读取稳定用户 ID。
func PlatformUserIDFromCredential(rawCredential string) (string, error) {
	parsedCredential, err := ParseCredential(rawCredential)
	if err != nil {
		return "", err
	}
	return credentialPlatformUserID(parsedCredential.Cookie), nil
}

// Connection 返回本地是否保存了闲鱼会话。
func (service *Service) Connection(ctx context.Context) (model.XianyuSession, error) {
	session, err := service.sessionRepository.Get(ctx)
	if err != nil || !service.sellerWorkbench {
		return session, err
	}
	rawCookie, err := service.sessionCipher.Decrypt(session.EncryptedCookie)
	if err != nil {
		return model.XianyuSession{}, err
	}
	client, err := NewClient(service.config, rawCookie)
	if err != nil {
		return model.XianyuSession{}, err
	}
	client.SetSellerWorkbenchMode(true)
	if err := validateSellerWorkbenchSession(ctx, client); err != nil {
		return model.XianyuSession{}, err
	}
	return session, nil
}

// Disconnect 删除本地保存的闲鱼会话。
func (service *Service) Disconnect(ctx context.Context) error {
	return service.sessionRepository.Delete(ctx)
}

// ListOnSaleItems 分页获取当前账号正在闲鱼出售的全部商品。
func (service *Service) ListOnSaleItems(ctx context.Context) ([]OnSaleItem, error) {
	return service.ListItemsByStatus(ctx, "0")
}

// ListItemsByStatus 分页读取卖家工作台指定状态组的商品。
func (service *Service) ListItemsByStatus(ctx context.Context, itemStatus string) ([]OnSaleItem, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName, client.CredentialVersion())
	}()
	if service.sellerWorkbench {
		return listSellerWorkbenchItems(ctx, client, itemStatus)
	}
	if itemStatus != "0" {
		return nil, errors.New("下架商品查询需要卖家工作台会话")
	}

	// 聚合后的当前在卖商品。
	items := make([]OnSaleItem, 0)
	for pageNumber := 1; pageNumber <= 100; pageNumber++ {
		var pageResponse map[string]any
		if err := client.Call(ctx, "mtop.taobao.idle.wx.user.publish.items", "9.3", map[string]any{
			"pageNumber": pageNumber,
		}, &pageResponse); err != nil {
			return nil, fmt.Errorf("获取闲鱼在卖商品失败：%w", err)
		}

		for _, cardValue := range sliceValue(pageResponse["itemCards"]) {
			card := mapValue(cardValue)
			itemID := stringValue(card["id"])
			if itemID == "" {
				continue
			}
			items = append(items, OnSaleItem{
				ItemID:     itemID,
				Title:      stringValue(card["title"]),
				PriceCents: parseYuanPriceCents(stringValue(card["price"])),
				ImageURL:   stringValue(card["picUrl"]),
				CategoryID: stringValue(card["categoryId"]),
			})
		}

		if !boolValue(pageResponse["nextPage"]) {
			break
		}
	}
	return items, nil
}

// listSellerWorkbenchOnSaleItems 使用卖家工作台接口分页读取当前在售商品。
func listSellerWorkbenchItems(ctx context.Context, client *Client, itemStatus string) ([]OnSaleItem, error) {
	const pageSize = 50
	type pageResult struct {
		items []OnSaleItem
		total int
		err   error
	}
	fetchPage := func(pageNumber int) pageResult {
		var response map[string]any
		if err := client.Call(ctx, "mtop.alibaba.idle.seller.pc.common.item.search", "1.0", map[string]any{
			"pageNo":        pageNumber,
			"pageSize":      pageSize,
			"bizType":       "commonPro",
			"searchRequest": "{}",
			"itemStatus":    itemStatus,
		}, &response); err != nil {
			return pageResult{err: fmt.Errorf("获取闲鱼卖家商品失败：%w", err)}
		}
		payload := mapValue(response["data"])
		if len(payload) == 0 {
			payload = response
		}
		pageItems := sliceValue(payload["itemSearchResponseList"])
		items := make([]OnSaleItem, 0, len(pageItems))
		for _, itemValue := range pageItems {
			item := mapValue(itemValue)
			itemID := firstNonEmptyString(item, "itemId", "id", "item_id")
			if itemID == "" {
				continue
			}
			items = append(items, OnSaleItem{
				ItemID:     itemID,
				Title:      firstNonEmptyString(item, "itemTitle", "title", "itemName"),
				PriceCents: parseSearchPriceCents(item),
				ImageURL:   firstNonEmptyString(item, "mainPicUrl", "picUrl", "imageUrl"),
				CategoryID: firstNonEmptyString(item, "categoryId", "catId"),
				Status:     firstNonEmptyString(item, "itemStatus", "status"),
			})
		}
		total, _ := strconv.Atoi(stringValue(payload["total"]))
		return pageResult{items: items, total: total}
	}
	firstPage := fetchPage(1)
	if firstPage.err != nil {
		return nil, firstPage.err
	}
	if firstPage.total <= len(firstPage.items) {
		return firstPage.items, nil
	}
	pageCount := (firstPage.total + pageSize - 1) / pageSize
	pageResults := make([]pageResult, pageCount+1)
	pageResults[1] = firstPage
	pageSemaphore := make(chan struct{}, 4)
	var pageWaitGroup sync.WaitGroup
	for pageNumber := 2; pageNumber <= pageCount; pageNumber++ {
		pageNumber := pageNumber
		pageWaitGroup.Add(1)
		go func() {
			defer pageWaitGroup.Done()
			select {
			case pageSemaphore <- struct{}{}:
				defer func() { <-pageSemaphore }()
			case <-ctx.Done():
				pageResults[pageNumber].err = ctx.Err()
				return
			}
			pageResults[pageNumber] = fetchPage(pageNumber)
		}()
	}
	pageWaitGroup.Wait()
	items := make([]OnSaleItem, 0, firstPage.total)
	for pageNumber := 1; pageNumber <= pageCount; pageNumber++ {
		if pageResults[pageNumber].err != nil {
			return nil, pageResults[pageNumber].err
		}
		items = append(items, pageResults[pageNumber].items...)
	}
	if len(items) != firstPage.total {
		return nil, fmt.Errorf("闲鱼卖家商品分页不完整：期望%d件，实际%d件", firstPage.total, len(items))
	}
	return items, nil
}

// validateSellerWorkbenchSession 使用轻量查询实时确认卖家后台 Cookie 是否有效。
func validateSellerWorkbenchSession(ctx context.Context, client *Client) error {
	var response map[string]any
	if err := client.Call(ctx, "mtop.alibaba.idle.seller.pc.common.item.search", "1.0", map[string]any{
		"pageNo": 1, "pageSize": 1, "bizType": "commonPro", "searchRequest": "{}", "itemStatus": "0",
	}, &response); err != nil {
		return err
	}
	return nil
}

// OfflineItems 下架一个或多个当前在售的闲鱼商品。
func (service *Service) OfflineItems(ctx context.Context, itemIDs []string) (OfflineResult, error) {
	// 去重后的待下架商品 ID。
	normalizedItemIDs := uniqueItemIDs(itemIDs)
	if len(normalizedItemIDs) == 0 {
		return OfflineResult{}, errors.New("请选择至少一件闲鱼商品")
	}
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return OfflineResult{}, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName, client.CredentialVersion())
	}()

	if len(normalizedItemIDs) == 1 {
		itemID := normalizedItemIDs[0]
		var response map[string]any
		if err := client.Call(ctx, "mtop.alibaba.idle.seller.pc.item.offline", "1.0", map[string]any{"itemId": itemID}, &response); err != nil {
			return OfflineResult{}, fmt.Errorf("下架闲鱼商品失败：%w", err)
		}
		if !boolValue(response["data"]) {
			return OfflineResult{}, errors.New(firstNonEmptyString(response, "msg", "message"))
		}
		return OfflineResult{SucceededItemIDs: []string{itemID}}, nil
	}

	var response map[string]any
	if err := client.Call(ctx, "mtop.alibaba.idle.seller.pc.item.batch.offline", "1.0", map[string]any{"itemIds": strings.Join(normalizedItemIDs, ",")}, &response); err != nil {
		return OfflineResult{}, fmt.Errorf("批量下架闲鱼商品失败：%w", err)
	}
	processResults := sliceValue(mapValue(response["data"])["itemProcessResultList"])
	if len(processResults) == 0 {
		return OfflineResult{}, errors.New("闲鱼未返回批量下架结果")
	}

	// 批量下架的逐商品执行结果。
	result := OfflineResult{}
	processedItemIDs := make(map[string]struct{}, len(processResults))
	for _, rawResult := range processResults {
		itemResult := mapValue(rawResult)
		itemID := strings.TrimSpace(stringValue(itemResult["itemId"]))
		if itemID == "" {
			continue
		}
		processedItemIDs[itemID] = struct{}{}
		if boolValue(itemResult["success"]) {
			result.SucceededItemIDs = append(result.SucceededItemIDs, itemID)
		} else {
			result.FailedItemIDs = append(result.FailedItemIDs, itemID)
		}
	}
	for _, itemID := range normalizedItemIDs {
		if _, wasProcessed := processedItemIDs[itemID]; !wasProcessed {
			result.FailedItemIDs = append(result.FailedItemIDs, itemID)
		}
	}
	return result, nil
}

// uniqueItemIDs 清理并去重用户选择的商品 ID。
func uniqueItemIDs(itemIDs []string) []string {
	itemIDSet := make(map[string]struct{}, len(itemIDs))
	uniqueIDs := make([]string, 0, len(itemIDs))
	for _, itemID := range itemIDs {
		normalizedItemID := strings.TrimSpace(itemID)
		if normalizedItemID == "" {
			continue
		}
		if _, exists := itemIDSet[normalizedItemID]; exists {
			continue
		}
		itemIDSet[normalizedItemID] = struct{}{}
		uniqueIDs = append(uniqueIDs, normalizedItemID)
	}
	return uniqueIDs
}

// SearchItems 使用闲鱼 PC 搜索接口查询市场商品，复用当前 PC 登录态。
func (service *Service) SearchItems(ctx context.Context, input SearchInput) ([]SearchItem, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName, client.CredentialVersion())
	}()

	rowsPerPage := input.RowsPerPage
	if rowsPerPage <= 0 || rowsPerPage > 30 {
		rowsPerPage = 30
	}
	// PC 搜索页固定使用 quickFilter:filterFreePostage,filterNew 表示包邮和全新。
	searchFilter := buildPCSearchFilter(input)
	searchRequest := map[string]any{
		"pageNumber":        1,
		"keyword":           input.Keyword,
		"fromFilter":        searchFilter != "",
		"rowsPerPage":       rowsPerPage,
		"sortValue":         "",
		"sortField":         "",
		"customDistance":    "",
		"gps":               "",
		"propValueStr":      map[string]string{"searchFilter": searchFilter},
		"customGps":         "",
		"searchReqFromPage": "pcSearch",
		"extraFilterValue":  "{}",
		"userPositionJson":  "{}",
	}
	var searchResponse map[string]any
	if err := client.CallWithSearchCredential(ctx, "mtop.taobao.idlemtopsearch.pc.search", "1.0", searchRequest, &searchResponse); err != nil {
		return nil, fmt.Errorf("搜索闲鱼市场商品失败：%w", err)
	}

	searchItems := make([]SearchItem, 0)
	for _, resultValue := range sliceValue(searchResponse["resultList"]) {
		result := extractPCSearchItem(mapValue(resultValue))
		itemID := firstNonEmptyString(result, "id", "itemId", "item_id")
		if itemID == "" {
			continue
		}
		itemTitle := firstNonEmptyString(result, "title", "itemTitle")
		imageURL := firstNonEmptyString(result, "imageUrl", "picUrl", "mainPic", "mainPicUrl")
		priceCents := parseSearchPriceCents(result)
		searchItems = append(searchItems, SearchItem{
			ItemID:             itemID,
			Title:              itemTitle,
			PriceCents:         priceCents,
			OriginalPriceCents: parseSearchOriginalPriceCents(result),
			ImageURL:           imageURL,
			ItemURL:            "https://www.goofish.com/item?id=" + itemID,
			Attributes: map[string]string{
				"condition": strings.Join(input.Condition, ","),
				"shipping":  input.Shipping,
			},
		})
	}
	return searchItems, nil
}

// buildPCSearchFilter 按闲鱼 PC 页面约定生成快捷筛选字符串。
func buildPCSearchFilter(input SearchInput) string {
	filters := make([]string, 0, 2)
	if input.Shipping == "free" {
		filters = append(filters, "filterFreePostage")
	}
	if containsString(input.Condition, "new") {
		filters = append(filters, "filterNew")
	}
	if len(filters) == 0 {
		return ""
	}
	return "quickFilter:" + strings.Join(filters, ",")
}

// containsString 判断筛选值是否存在。
func containsString(values []string, expected string) bool {
	for _, value := range values {
		if strings.EqualFold(strings.TrimSpace(value), expected) {
			return true
		}
	}
	return false
}

// extractPCSearchItem 兼容 PC 搜索接口的新旧两种 resultList 数据结构。
func extractPCSearchItem(result map[string]any) map[string]any {
	data := mapValue(result["data"])
	if len(data) == 0 {
		return result
	}
	item := mapValue(data["item"])
	main := mapValue(item["main"])
	exContent := mapValue(main["exContent"])
	if len(exContent) > 0 {
		return exContent
	}
	return data
}

// firstNonEmptyString 读取多个可能的闲鱼字段名。
func firstNonEmptyString(values map[string]any, keys ...string) string {
	for _, key := range keys {
		if value := stringValue(values[key]); value != "" {
			return value
		}
	}
	return ""
}

// parseSearchPriceCents 兼容闲鱼搜索卡片中不同的价格字段。
func parseSearchPriceCents(result map[string]any) int64 {
	for _, key := range []string{"price", "priceText", "itemPrice", "reservePrice", "currentPrice"} {
		if priceCents := parseYuanPriceCents(firstNonEmptyString(result, key)); priceCents > 0 {
			return priceCents
		}
		if priceCents := parsePriceComponents(result[key]); priceCents > 0 {
			return priceCents
		}
	}
	return 0
}

// parsePriceComponents 解析 PC 搜索卡片的 sign/integer/decimal 价格组件。
func parsePriceComponents(value any) int64 {
	integerPart := ""
	decimalPart := ""
	for _, componentValue := range sliceValue(value) {
		component := mapValue(componentValue)
		switch stringValue(component["type"]) {
		case "integer":
			integerPart = stringValue(component["text"])
		case "decimal":
			decimalPart = strings.TrimPrefix(stringValue(component["text"]), ".")
		}
	}
	if integerPart == "" {
		return 0
	}
	priceText := integerPart
	if decimalPart != "" {
		priceText += "." + decimalPart
	}
	return parseYuanPriceCents(priceText)
}

// parseSearchOriginalPriceCents 读取划线原价字段。
func parseSearchOriginalPriceCents(result map[string]any) int64 {
	for _, key := range []string{"originalPrice", "originPrice", "marketPrice"} {
		if priceCents := parseYuanPriceCents(firstNonEmptyString(result, key)); priceCents > 0 {
			return priceCents
		}
	}
	return 0
}

// Publish 通过闲鱼 API 完成图片上传、属性推荐、服务配置和正式发布。
func (service *Service) Publish(ctx context.Context, input PublishInput) (PublishResult, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return PublishResult{}, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName, client.CredentialVersion())
	}()

	pregetAPI := "mtop.idle.pc.idleitem.preget"
	pregetRequest := map[string]any{}
	if service.sellerWorkbench {
		pregetAPI = "mtop.idle.pc.backend.idleitem.preget"
		pregetRequest["publishScene"] = "pcBackendPublish"
	}
	var pregetResponse map[string]any
	if err := client.Call(ctx, pregetAPI, "1.0", pregetRequest, &pregetResponse); err != nil {
		return PublishResult{}, fmt.Errorf("获取闲鱼发布配置失败：%w", err)
	}
	if service.sellerWorkbench && len(input.Variants) > 0 && !boolValue(pregetResponse["supportSkuOrInventory"]) {
		return PublishResult{}, errors.New("当前闲鱼卖家账号不支持多规格库存发布")
	}

	uploadedImages := make([]UploadedImage, 0, len(input.ImagePaths))
	for _, imagePath := range input.ImagePaths {
		uploadedImage, uploadErr := client.UploadImage(ctx, imagePath)
		if uploadErr != nil {
			return PublishResult{}, uploadErr
		}
		uploadedImages = append(uploadedImages, uploadedImage)
	}
	imageInfos := buildImageInfos(uploadedImages)

	recommendRequest := map[string]any{
		"description":     input.Description,
		"title":           input.Title,
		"imageInfos":      imageInfos,
		"currentCardList": []any{},
		"selectedList":    []any{},
		"catId":           "50023914",
		"catName":         "",
		"channelCatId":    "",
		"lockCpv":         false,
		"multiSKU":        len(input.Variants) > 0,
		"publishScene":    "mainPublish",
		"scene":           "newPublishChoice",
		"uniqueCode":      uniqueCode(),
	}
	recommendAPI := "mtop.taobao.idle.kgraph.property.recommend"
	if service.sellerWorkbench {
		recommendAPI = "mtop.taobao.idle.kgraph.pc.property.recommend"
		recommendRequest["publishScene"] = "pcBackendPublish"
		recommendRequest["scene"] = "shopPcPublish"
	}
	var recommendResponse map[string]any
	if err := client.Call(ctx, recommendAPI, "2.0", recommendRequest, &recommendResponse); err != nil {
		return PublishResult{}, fmt.Errorf("识别闲鱼商品属性失败：%w", err)
	}

	itemCategory := extractCategory(recommendResponse)
	if stringValue(itemCategory["catId"]) == "" {
		return PublishResult{}, errors.New("闲鱼没有识别出商品分类，请调整标题或描述")
	}
	service.applyOptionalAttributes(ctx, client, recommendResponse, itemCategory, input, imageInfos)
	itemLabels := extractSelectedLabels(recommendResponse)
	payload := buildPublishPayload(input, pregetResponse, imageInfos, itemCategory, itemLabels)

	serviceRequest := map[string]any{
		"cpvList":      mustJSON(recommendResponse["cardList"]),
		"itemInfoJson": mustJSON(payload),
		"param":        `{"multiSkuEditingMode":"false","settingsPreferences":null,"supportDefaultOpen":true}`,
	}
	serviceAPI := "mtop.idle.item.publish.service.cards.list"
	if service.sellerWorkbench {
		serviceAPI = "mtop.idle.pc.backend.publish.service.cards.list"
	}
	var serviceResponse map[string]any
	if err := client.Call(ctx, serviceAPI, "1.0", serviceRequest, &serviceResponse); err != nil {
		return PublishResult{}, fmt.Errorf("获取闲鱼发布服务失败：%w", err)
	}
	payload["userRightsProtocols"] = extractServiceProtocols(serviceResponse)
	payload["uniqueCode"] = uniqueCode()
	payload["sourceId"] = "pcMainPublish"
	payload["bizcode"] = "pcMainPublish"
	payload["publishScene"] = "pcMainPublish"
	if service.sellerWorkbench {
		payload["publishScene"] = "pcBackendPublish"
	}

	var publishResponse struct {
		ItemID any `json:"itemId"`
	}
	publishAPI := "mtop.idle.pc.idleitem.publish"
	publishRequest := any(payload)
	if service.sellerWorkbench {
		publishAPI = "mtop.idle.pc.backend.idleitem.publish"
		publishRequest = map[string]any{"inputJson": mustJSON(payload)}
	}
	if err := client.Call(ctx, publishAPI, "1.0", publishRequest, &publishResponse); err != nil {
		return PublishResult{}, fmt.Errorf("闲鱼发布接口失败：%w", err)
	}
	itemID := stringValue(publishResponse.ItemID)
	if itemID == "" {
		return PublishResult{}, errors.New("闲鱼发布成功响应缺少商品 ID")
	}

	return PublishResult{
		ItemID: itemID,
		URL:    "https://www.goofish.com/item?id=" + itemID,
	}, nil
}

// applyOptionalAttributes 尽可能补充品牌、成色和鞋码，匹配失败时不阻断发布。
func (service *Service) applyOptionalAttributes(
	ctx context.Context,
	client *Client,
	recommendResponse map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
) {
	requirements := []attributeRequirement{
		{Label: "品牌", PropertyNames: []string{"品牌"}, Values: []string{input.Brand}, MatchMode: attributeMatchBrand},
		{Label: "成色", PropertyNames: []string{"成色", "新旧程度"}, Values: []string{input.Condition}, MatchMode: attributeMatchContains},
	}
	if input.IsFootwear {
		requirements = append(requirements, attributeRequirement{
			Label: "鞋码", PropertyNames: []string{"鞋码", "尺码"}, Values: input.AvailableSizes, MatchMode: attributeMatchSize,
		})
	}

	for _, requirement := range requirements {
		if len(requirement.Values) == 0 || strings.TrimSpace(requirement.Values[0]) == "" {
			continue
		}
		cardData := findAttributeCard(recommendResponse, requirement.PropertyNames)
		if cardData == nil {
			continue
		}
		service.selectOptionalAttributeValues(ctx, client, cardData, itemCategory, input, imageInfos, requirement)
	}
}

// attributeRequirement 描述一个必须明确选择的闲鱼属性。
type attributeRequirement struct {
	Label         string
	PropertyNames []string
	Values        []string
	MatchMode     string
}

const (
	attributeMatchContains = "contains"
	attributeMatchBrand    = "brand"
	attributeMatchSize     = "size"
)

// findAttributeCard 按属性名称查找推荐接口返回的卡片。
func findAttributeCard(recommendResponse map[string]any, propertyNames []string) map[string]any {
	for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
		cardData := mapValue(mapValue(cardValue)["cardData"])
		propertyName := stringValue(cardData["propertyName"])
		for _, expectedName := range propertyNames {
			if strings.Contains(propertyName, expectedName) {
				return cardData
			}
		}
	}
	return nil
}

// selectOptionalAttributeValues 匹配现有选项，搜索或匹配失败时保留已匹配结果。
func (service *Service) selectOptionalAttributeValues(
	ctx context.Context,
	client *Client,
	cardData map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
	requirement attributeRequirement,
) {
	options := sliceValue(cardData["valuesList"])
	for _, optionValue := range options {
		option := mapValue(optionValue)
		option["isClicked"] = "0"
		option["isUserClick"] = "0"
	}

	for _, desiredValue := range requirement.Values {
		matchedOption := findMatchingOption(options, desiredValue, requirement.MatchMode)
		if matchedOption == nil {
			searchedOptions, err := service.searchAttributeOptions(ctx, client, cardData, itemCategory, input, imageInfos, desiredValue)
			if err != nil {
				continue
			}
			for _, searchedOption := range searchedOptions {
				options = append(options, searchedOption)
			}
			matchedOption = findMatchingOption(searchedOptions, desiredValue, requirement.MatchMode)
		}
		if matchedOption == nil {
			continue
		}
		matchedOption["isClicked"] = "1"
		matchedOption["isUserClick"] = "1"
	}
	cardData["valuesList"] = options
}

// searchAttributeOptions 使用当前分类搜索品牌或鞋码选项。
func (service *Service) searchAttributeOptions(
	ctx context.Context,
	client *Client,
	cardData map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
	searchText string,
) ([]any, error) {
	pictureURL := ""
	if len(imageInfos) > 0 {
		pictureURL = stringValue(imageInfos[0]["imgPath"])
	}
	searchRequest := map[string]any{
		"inputText":    searchText,
		"propertyId":   stringValue(cardData["propertyId"]),
		"description":  input.Description,
		"catId":        itemCategory["catId"],
		"channelCatId": itemCategory["channelCatId"],
		"tbCatId":      itemCategory["tbCatId"],
		"picUrl":       pictureURL,
		"scene":        "mainPublish",
	}
	var searchResponse map[string]any
	if err := client.Call(ctx, "mtop.taobao.idle.kgraph.property.search", "1.0", searchRequest, &searchResponse); err != nil {
		return nil, err
	}
	return sliceValue(searchResponse["searchList"]), nil
}

// findMatchingOption 按品牌、成色或尺码规则匹配闲鱼属性选项。
func findMatchingOption(options []any, desiredValue string, matchMode string) map[string]any {
	for _, optionValue := range options {
		option := mapValue(optionValue)
		optionName := stringValue(option["valueName"])
		if optionName == "" {
			optionName = stringValue(option["text"])
		}
		if attributeValueMatches(optionName, desiredValue, matchMode) {
			return option
		}
	}
	return nil
}

// attributeValueMatches 判断闲鱼选项是否对应源商品属性。
func attributeValueMatches(optionValue string, desiredValue string, matchMode string) bool {
	if matchMode == attributeMatchSize {
		return normalizeSize(optionValue) == normalizeSize(desiredValue)
	}
	if matchMode == attributeMatchBrand {
		return brandMatches(optionValue, desiredValue)
	}
	normalizedOption := normalizeAttributeText(optionValue)
	normalizedDesired := normalizeAttributeText(desiredValue)
	return normalizedOption == normalizedDesired || strings.Contains(normalizedOption, normalizedDesired)
}

// brandMatches 兼容中英文品牌名称。
func brandMatches(optionValue string, desiredValue string) bool {
	normalizedOption := normalizeAttributeText(optionValue)
	normalizedDesired := normalizeAttributeText(desiredValue)
	brandAliases := map[string][]string{
		"nike":       {"nike", "耐克"},
		"lining":     {"lining", "李宁"},
		"adidas":     {"adidas", "阿迪达斯"},
		"newbalance": {"newbalance", "新百伦"},
	}
	for _, aliases := range brandAliases {
		desiredMatched := false
		optionMatched := false
		for _, alias := range aliases {
			desiredMatched = desiredMatched || strings.Contains(normalizedDesired, alias)
			optionMatched = optionMatched || strings.Contains(normalizedOption, alias)
		}
		if desiredMatched && optionMatched {
			return true
		}
	}
	return normalizedOption == normalizedDesired || strings.Contains(normalizedOption, normalizedDesired)
}

// normalizeAttributeText 标准化普通属性文本。
func normalizeAttributeText(value string) string {
	normalizedValue := strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(" ", "", "-", "", "_", "", "/", "", "·", "")
	return replacer.Replace(normalizedValue)
}

// normalizeSize 标准化鞋码文本用于精确比较。
func normalizeSize(value string) string {
	normalizedValue := normalizeAttributeText(value)
	replacer := strings.NewReplacer("鞋码", "", "码", "", "eu", "", "cn", "")
	return replacer.Replace(normalizedValue)
}

// loadClient 解密数据库会话并创建请求客户端。
func (service *Service) loadClient(ctx context.Context) (*Client, string, error) {
	session, err := service.sessionRepository.Get(ctx)
	if errors.Is(err, repository.ErrSessionNotFound) {
		return nil, "", ErrSessionExpired
	}
	if err != nil {
		return nil, "", err
	}
	rawCookie, err := service.sessionCipher.Decrypt(session.EncryptedCookie)
	if err != nil {
		return nil, "", err
	}
	client, err := NewClient(service.config, rawCookie)
	if err != nil {
		return nil, "", err
	}
	client.SetSellerWorkbenchMode(service.sellerWorkbench)
	client.SetCredentialVersion(session.CredentialVersion)
	if session.EncryptedSearchCredential != "" {
		decryptedCredential, decryptErr := service.sessionCipher.Decrypt(session.EncryptedSearchCredential)
		if decryptErr != nil {
			return nil, "", decryptErr
		}
		searchCredential, decodeErr := DecodeSearchCredential(decryptedCredential)
		if decodeErr != nil {
			return nil, "", decodeErr
		}
		client.SetSearchCredential(searchCredential)
	}
	return client, session.DisplayName, nil
}

// saveConnectedCredential 保存 Cookie，并在 cURL 含搜索安全参数时更新比价凭证。
func (service *Service) saveConnectedCredential(
	ctx context.Context,
	rawCookie string,
	displayName string,
	searchCredential SearchCredential,
) (bool, error) {
	// 普通 cURL 更新登录态时保留已经存在的比价凭证。
	hasSearchCredential := false
	existingSession, existingErr := service.sessionRepository.Get(ctx)
	if existingErr == nil && existingSession.EncryptedSearchCredential != "" {
		hasSearchCredential = true
	}

	encryptedCookie, err := service.sessionCipher.Encrypt(rawCookie)
	if err != nil {
		return false, err
	}
	platform := model.XianyuPlatform
	if service.sellerWorkbench {
		platform = model.XianyuSellerPlatform
	}
	session := model.XianyuSession{
		Platform:          platform,
		EncryptedCookie:   encryptedCookie,
		DisplayName:       displayName,
		CredentialVersion: time.Now().UnixNano(),
		UpdatedAt:         time.Now(),
	}
	if existingErr == nil {
		session.PlatformUserID = existingSession.PlatformUserID
	}
	if searchCredential.Complete() {
		encodedCredential, encodeErr := EncodeSearchCredential(searchCredential)
		if encodeErr != nil {
			return false, encodeErr
		}
		session.EncryptedSearchCredential, err = service.sessionCipher.Encrypt(encodedCredential)
		if err != nil {
			return false, err
		}
		hasSearchCredential = true
	}
	if err := service.sessionRepository.Save(ctx, session); err != nil {
		return false, err
	}
	return hasSearchCredential, nil
}

// saveCookie 加密并保存最新 Cookie。
func (service *Service) saveCookie(ctx context.Context, rawCookie string, displayName string, credentialVersion int64) error {
	encryptedCookie, err := service.sessionCipher.Encrypt(rawCookie)
	if err != nil {
		return err
	}
	platform := model.XianyuPlatform
	if service.sellerWorkbench {
		platform = model.XianyuSellerPlatform
	}
	session := model.XianyuSession{
		Platform:        platform,
		EncryptedCookie: encryptedCookie,
		DisplayName:     displayName,
		UpdatedAt:       time.Now(),
	}
	if existingSession, existingErr := service.sessionRepository.Get(ctx); existingErr == nil {
		session.EncryptedSearchCredential = existingSession.EncryptedSearchCredential
		session.PlatformUserID = existingSession.PlatformUserID
		session.CredentialVersion = existingSession.CredentialVersion
	}
	_, err = service.sessionRepository.SaveIfVersion(ctx, session, credentialVersion)
	return err
}

// buildImageInfos 将上传响应转换为正式发布图片结构。
func buildImageInfos(uploadedImages []UploadedImage) []map[string]any {
	imageInfos := make([]map[string]any, 0, len(uploadedImages))
	for imageIndex, uploadedImage := range uploadedImages {
		width, _ := strconv.Atoi(uploadedImage.Width.String())
		height, _ := strconv.Atoi(uploadedImage.Height.String())
		if uploadedImage.Pix != "" {
			pixParts := strings.SplitN(uploadedImage.Pix, "x", 2)
			if width == 0 && len(pixParts) > 0 {
				width, _ = strconv.Atoi(pixParts[0])
			}
			if height == 0 && len(pixParts) > 1 {
				height, _ = strconv.Atoi(pixParts[1])
			}
		}
		imgPath := uploadedImage.ImgPath
		if imgPath == "" {
			imgPath = uploadedImage.URL
		}
		imageInfos = append(imageInfos, map[string]any{
			"extraInfo":     map[string]string{"isH": "false", "isT": "false", "raw": "false"},
			"heightSize":    height,
			"widthSize":     width,
			"imgPath":       imgPath,
			"url":           uploadedImage.URL,
			"thumbnail":     uploadedImage.URL,
			"major":         imageIndex == 0,
			"isQrCode":      false,
			"labels":        []any{},
			"templateIndex": "0",
			"type":          0,
			"status":        "done",
		})
	}
	return imageInfos
}

// buildPublishPayload 构造闲鱼网页当前版本的正式发布字段。
func buildPublishPayload(
	input PublishInput,
	pregetResponse map[string]any,
	imageInfos []map[string]any,
	itemCategory map[string]any,
	itemLabels []map[string]any,
) map[string]any {
	itemAddress := mapValue(pregetResponse["itemAddrDTO"])
	if len(itemAddress) == 0 {
		itemAddress = mapValue(pregetResponse["defaultItemAddrDTO"])
	}
	if stringValue(itemAddress["divisionId"]) == "" {
		itemAddress = defaultAddressForRegion(input.RegionID)
	}
	payload := map[string]any{
		"freebies":        false,
		"itemTypeStr":     "b",
		"quantity":        publishQuantity(input.Variants),
		"simpleItem":      "true",
		"imageInfoDOList": imageInfos,
		"itemTextDTO": map[string]any{
			"desc":              input.Description,
			"title":             input.Title,
			"titleDescSeparate": true,
		},
		"itemPriceDTO": map[string]any{
			"priceInCent":     strconv.FormatInt(input.PriceCents, 10),
			"origPriceInCent": optionalPrice(input.OriginalPriceCents),
		},
		"itemPostFeeDTO": map[string]any{
			"canFreeShipping": true,
			"supportFreight":  true,
			"onlyTakeSelf":    false,
		},
		"itemAddrDTO":       itemAddress,
		"itemCatDTO":        itemCategory,
		"itemLabelExtList":  itemLabels,
		"itemStatus":        "0",
		"itemTopicParams":   map[string]any{"topicInfos": []any{}},
		"topics":            []any{},
		"itemGroupDTO":      map[string]any{"groupId": ""},
		"itemProperties":    buildPublishProperties(input.Variants),
		"itemSkuList":       buildPublishSKUList(input.Variants),
		"propertyImageList": nil,
		"defaultPrice":      false,
		"aiHostUsed":        false,
		"aigc":              "",
		"aigcRequestId":     "",
		"asyncSecurityInfo": map[string]any{"securityStrategyHitResult": map[string]any{"FORBIDDEN": []any{}, "WARN": []any{}}},
		"yhbItemInfoDTO":    map[string]any{"idleAppraiseScene": "", "settingsPreferences": map[string]string{"assumeRule": "", "tradeRule": ""}, "useYhbService": false},
	}
	return payload
}

// publishQuantity 汇总所有规格库存；普通商品保持一件库存。
func publishQuantity(variants []PublishVariant) string {
	if len(variants) == 0 {
		return "1"
	}
	var quantity int64
	for _, variant := range variants {
		if variant.Quantity > 0 {
			quantity += variant.Quantity
		}
	}
	if quantity <= 0 {
		return "1"
	}
	return strconv.FormatInt(quantity, 10)
}

// buildPublishSKUList 生成卖家工作台要求的逐规格价格和库存。
func buildPublishSKUList(variants []PublishVariant) any {
	if len(variants) == 0 {
		return nil
	}
	items := make([]any, 0, len(variants))
	for _, variant := range variants {
		if variant.Quantity <= 0 || variant.PriceCents <= 0 || len(variant.Properties) == 0 {
			continue
		}
		properties := make([]map[string]string, 0, len(variant.Properties))
		for _, property := range variant.Properties {
			name := strings.TrimSpace(property.Name)
			value := strings.TrimSpace(property.Value)
			if name == "" || value == "" {
				continue
			}
			properties = append(properties, map[string]string{"propertyText": name, "valueText": value})
		}
		if len(properties) == 0 {
			continue
		}
		items = append(items, map[string]any{
			"priceInCent":  strconv.FormatInt(variant.PriceCents, 10),
			"quantity":     variant.Quantity,
			"propertyList": properties,
		})
	}
	if len(items) == 0 {
		return nil
	}
	return items
}

// buildPublishProperties 汇总多规格表头和值列表。
func buildPublishProperties(variants []PublishVariant) any {
	if len(variants) == 0 {
		return nil
	}
	propertyOrder := make([]string, 0, 2)
	propertyValues := make(map[string][]string)
	for _, variant := range variants {
		for _, property := range variant.Properties {
			name := strings.TrimSpace(property.Name)
			value := strings.TrimSpace(property.Value)
			if name == "" || value == "" {
				continue
			}
			if _, exists := propertyValues[name]; !exists {
				propertyOrder = append(propertyOrder, name)
			}
			propertyValues[name] = appendUniqueString(propertyValues[name], value)
		}
	}
	properties := make([]any, 0, len(propertyOrder))
	for _, propertyName := range propertyOrder {
		values := propertyValues[propertyName]
		if len(values) == 0 {
			continue
		}
		propertyValueList := make([]any, 0, len(values))
		for _, propertyValue := range values {
			propertyValueList = append(propertyValueList, map[string]any{"propertyValue": propertyValue})
		}
		properties = append(properties, map[string]any{
			"propertyName":   propertyName,
			"supportImage":   false,
			"propertyValues": propertyValueList,
		})
	}
	if len(properties) == 0 {
		return nil
	}
	return properties
}

// appendUniqueString 追加未出现的非空字符串。
func appendUniqueString(values []string, value string) []string {
	for _, currentValue := range values {
		if currentValue == value {
			return values
		}
	}
	return append(values, value)
}

// defaultAddressForRegion 将奥莱地区转换为闲鱼发布所需行政区信息。
func defaultAddressForRegion(regionID string) map[string]any {
	// 各佛罗伦萨小镇对应的默认行政区。
	regionAddresses := map[string]map[string]any{
		"2": {"prov": "天津", "city": "天津", "area": "武清区", "divisionId": "120114"},
		"3": {"prov": "上海", "city": "上海", "area": "浦东新区", "divisionId": "310115"},
		"4": {"prov": "广东省", "city": "佛山市", "area": "南海区", "divisionId": "440605"},
		"5": {"prov": "四川省", "city": "成都市", "area": "郫都区", "divisionId": "510117"},
		"6": {"prov": "湖北省", "city": "鄂州市", "area": "华容区", "divisionId": "420703"},
		"7": {"prov": "重庆", "city": "重庆", "area": "沙坪坝区", "divisionId": "500106"},
	}
	address := regionAddresses[regionID]
	if address == nil {
		address = regionAddresses["3"]
	}
	return map[string]any{
		"prov":       address["prov"],
		"city":       address["city"],
		"area":       address["area"],
		"divisionId": address["divisionId"],
		"gps":        "",
		"poiId":      "",
		"poiName":    "",
	}
}

// extractCategory 读取推荐接口给出的分类。
func extractCategory(recommendResponse map[string]any) map[string]any {
	category := mapValue(recommendResponse["categoryPredictResult"])
	if stringValue(category["catId"]) == "" {
		for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
			cardData := mapValue(mapValue(cardValue)["cardData"])
			if stringValue(cardData["propertyId"]) != "-10000" {
				continue
			}
			for _, optionValue := range sliceValue(cardData["valuesList"]) {
				option := mapValue(optionValue)
				if stringValue(option["isClicked"]) == "1" {
					category = option
					break
				}
			}
		}
	}
	return map[string]any{
		"catId":        category["catId"],
		"catName":      category["catName"],
		"channelCatId": category["channelCatId"],
		"leafId":       category["leafId"],
		"tbCatId":      category["tbCatId"],
	}
}

// extractSelectedLabels 收集属性卡片默认选中的分类和属性。
func extractSelectedLabels(recommendResponse map[string]any) []map[string]any {
	labels := make([]map[string]any, 0)
	for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
		card := mapValue(cardValue)
		cardData := mapValue(card["cardData"])
		propertyID := stringValue(cardData["propertyId"])
		propertyName := stringValue(cardData["propertyName"])
		for _, optionValue := range sliceValue(cardData["valuesList"]) {
			option := mapValue(optionValue)
			if stringValue(option["isClicked"]) != "1" {
				continue
			}
			valueID := stringValue(option["valueId"])
			valueName := stringValue(option["valueName"])
			if propertyID == "-10000" {
				valueID = stringValue(option["channelCatId"])
				valueName = stringValue(option["catName"])
			}
			label := mapValue(option["transportData"])
			if label == nil {
				label = make(map[string]any)
			}
			label["text"] = valueName
			label["isUserClick"] = option["isUserClick"]
			label["properties"] = propertyID + "##" + propertyName + ":" + valueID + "##" + valueName
			labels = append(labels, label)
		}
	}
	return labels
}

// extractServiceProtocols 按闲鱼默认开关生成服务协议。
func extractServiceProtocols(serviceResponse map[string]any) []map[string]any {
	protocols := make([]map[string]any, 0)
	for _, serviceValue := range sliceValue(serviceResponse["services"]) {
		serviceInfo := mapValue(serviceValue)
		serviceCode := stringValue(serviceInfo["code"])
		if serviceCode == "" {
			continue
		}
		protocols = append(protocols, map[string]any{
			"serviceCode": serviceCode,
			"enable":      serviceCode != "AI_SALE" && boolValue(serviceInfo["defaultEnable"]),
		})
	}
	return protocols
}

// readDisplayName 读取登录用户昵称。
func readDisplayName(navigationResponse map[string]any) string {
	module := mapValue(navigationResponse["module"])
	base := mapValue(module["base"])
	return stringValue(base["displayName"])
}

// readPlatformUserID 从用户导航响应中读取稳定的闲鱼用户 ID。
func readPlatformUserID(navigationResponse map[string]any) string {
	module := mapValue(navigationResponse["module"])
	base := mapValue(module["base"])
	for _, key := range []string{"userId", "userID", "userid", "uid", "id"} {
		if value := stringValue(base[key]); value != "" {
			return value
		}
	}
	return ""
}

// uniqueCode 生成闲鱼网页格式的请求唯一标识。
func uniqueCode() string {
	return fmt.Sprintf("%d%03d", time.Now().UnixMilli(), time.Now().UnixNano()%1000)
}

// mustJSON 将嵌套参数编码为字符串。
func mustJSON(value any) string {
	encodedValue, _ := json.Marshal(value)
	return string(encodedValue)
}

// mapValue 安全读取动态 JSON 对象。
func mapValue(value any) map[string]any {
	if typedValue, ok := value.(map[string]any); ok {
		return typedValue
	}
	return map[string]any{}
}

// sliceValue 安全读取动态 JSON 数组。
func sliceValue(value any) []any {
	if typedValue, ok := value.([]any); ok {
		return typedValue
	}
	return []any{}
}

// stringValue 将接口动态字段转换为字符串。
func stringValue(value any) string {
	switch typedValue := value.(type) {
	case string:
		return typedValue
	case json.Number:
		return typedValue.String()
	case float64:
		return strconv.FormatInt(int64(typedValue), 10)
	default:
		return ""
	}
}

// boolValue 将接口动态字段转换为布尔值。
func boolValue(value any) bool {
	switch typedValue := value.(type) {
	case bool:
		return typedValue
	case string:
		return typedValue == "true" || typedValue == "1"
	default:
		return false
	}
}

// parseYuanPriceCents 将闲鱼人民币价格转换为分。
func parseYuanPriceCents(value string) int64 {
	normalizedValue := strings.TrimSpace(strings.TrimPrefix(value, "¥"))
	price, err := strconv.ParseFloat(normalizedValue, 64)
	if err != nil || price <= 0 {
		return 0
	}
	return int64(math.Round(price * 100))
}

// optionalPrice 省略无意义的原价字段。
func optionalPrice(priceCents int64) any {
	if priceCents <= 0 {
		return nil
	}
	return strconv.FormatInt(priceCents, 10)
}
