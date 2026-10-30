package handler

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
)

type publishDetailFetcher func(context.Context, map[string]any, string) (map[string]any, error)

// refreshPublishSources 核验原始地区来源后再合并，列表中的零库存也必须参与复核。
// 任何地区读取失败均保留未知状态，不把部分成功的库存当成完整库存。
func refreshPublishSources(ctx context.Context, fetch publishDetailFetcher, sources []map[string]any) ([]map[string]any, map[string]publishDetailValidation) {
	groups := make(map[string][]map[string]any)
	order := make([]string, 0)
	for _, source := range sources {
		key := model.ItemNoKey(productString(source, "item_no"))
		if key == "" {
			continue
		}
		if _, exists := groups[key]; !exists {
			order = append(order, key)
		}
		groups[key] = append(groups[key], source)
	}
	type result struct {
		product    map[string]any
		validation publishDetailValidation
	}
	results := make([]result, len(order))
	var workers sync.WaitGroup
	for index, key := range order {
		workers.Add(1)
		go func(index int, key string) {
			defer workers.Done()
			results[index].product, results[index].validation = refreshPublishArticle(ctx, fetch, groups[key])
		}(index, key)
	}
	workers.Wait()
	products := make([]map[string]any, 0, len(order))
	validations := make(map[string]publishDetailValidation, len(order))
	for index, key := range order {
		validations[key] = results[index].validation
		if results[index].product != nil {
			products = append(products, results[index].product)
		}
	}
	return products, validations
}

// refreshPublishArticle 只在全部地区核验成功后返回可售的合并商品。
func refreshPublishArticle(ctx context.Context, fetch publishDetailFetcher, sources []map[string]any) (map[string]any, publishDetailValidation) {
	verified := make([]map[string]any, 0, len(sources))
	for _, source := range sources {
		region := firstProductString(source, "_primary_region", "regionauth_id")
		detail, err := fetch(ctx, source, region)
		if err != nil && catalog.IsExplicitMissingProductError(err) {
			continue
		}
		if err != nil {
			return nil, publishDetailValidation{err: err}
		}
		if err = validateSourceDetail(source, detail); err != nil {
			return nil, publishDetailValidation{err: err}
		}
		verified = append(verified, detail)
	}
	merged := mergePublishProductsByItemNo(verified)
	if len(merged) == 0 {
		return nil, publishDetailValidation{missing: true}
	}
	return merged[0], publishDetailValidation{}
}

func validateSourceDetail(source, detail map[string]any) error {
	if model.ItemNoKey(productString(detail, "item_no")) != model.ItemNoKey(productString(source, "item_no")) {
		return fmt.Errorf("商详货号与列表货号不一致")
	}
	if specs, ok := detail["spec_items"].([]any); ok && len(specs) > 0 {
		for _, raw := range specs {
			sku, ok := raw.(map[string]any)
			if !ok || !validSourceStock(sku["store"]) {
				return fmt.Errorf("商详规格库存不完整，停止该货号对账")
			}
		}
		return nil
	}
	if detail["store"] == nil && detail["item_total_store"] == nil {
		return fmt.Errorf("商详缺少库存，停止该货号对账")
	}
	for _, key := range []string{"store", "item_total_store"} {
		if detail[key] != nil && !validSourceStock(detail[key]) {
			return fmt.Errorf("商详库存格式异常，停止该货号对账")
		}
	}
	return nil
}

func validSourceStock(value any) bool {
	stock, err := strconv.ParseInt(strings.TrimSpace(fmt.Sprint(value)), 10, 64)
	return err == nil && stock >= 0
}

// refreshPublishPlanSources 使用全品牌核验结果生成当前筛选范围，未知货号单列跳过。
func refreshPublishPlanSources(ctx context.Context, fetch publishDetailFetcher, plan *publishBatchPlan, selected, all []map[string]any) ([]map[string]any, []map[string]any, map[string]publishDetailValidation) {
	wanted := make(map[string]map[string]any)
	for _, source := range selected {
		wanted[model.ItemNoKey(productString(source, "item_no"))] = source
	}
	delete(wanted, "")
	plan.Total = len(wanted)
	allProducts, validations := refreshPublishSources(ctx, fetch, all)
	products := make([]map[string]any, 0, len(wanted))
	for _, product := range allProducts {
		if _, exists := wanted[model.ItemNoKey(productString(product, "item_no"))]; exists {
			products = append(products, product)
		}
	}
	for key, source := range wanted {
		validation := validations[key]
		if validation.err != nil {
			plan.Skipped = append(plan.Skipped, model.PublishBatchSkip{ItemNo: productString(source, "item_no"), Title: productString(source, "item_name"), Reason: "商详核对失败，未操作：" + validation.err.Error()})
		}
	}
	return products, allProducts, validations
}
