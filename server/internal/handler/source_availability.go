package handler

const (
	sourceStatusOnSale   = "onsale"
	sourceStatusOnlyShow = "only_show"
)

// sourceSKUAvailable 将库存和销售状态一起判断；缺少状态的旧快照兼容库存判断。
// instock 等明确非在售状态即使仍有实物库存，也不能提交到闲鱼销售。
func sourceSKUAvailable(sku map[string]any) bool {
	if productNumber(sku, "store") <= 0 {
		return false
	}
	switch productString(sku, "approve_status") {
	case "", sourceStatusOnSale, sourceStatusOnlyShow:
		return true
	default:
		return false
	}
}

// sourceAvailableStock 在有规格时按可售规格汇总，禁止退回包含下架尺码的商品总库存。
func sourceAvailableStock(product map[string]any) int64 {
	if specs, ok := product["spec_items"].([]any); ok && len(specs) > 0 {
		var stock int64
		for _, raw := range specs {
			sku, _ := raw.(map[string]any)
			if sourceSKUAvailable(sku) {
				stock += productNumber(sku, "store")
			}
		}
		return stock
	}
	return firstPositivePrice(productNumber(product, "item_total_store"), productNumber(product, "store"))
}
