package xianyu

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"strings"
)

// ManagedState 只对比系统负责管理的字段，忽略闲鱼自动产生的时间和标签。
func ManagedState(detail map[string]any) map[string]any {
	encoded, _ := json.Marshal(detail)
	var normalized map[string]any
	_ = json.Unmarshal(encoded, &normalized)
	detail = normalized
	text := mapValue(detail["itemTextDTO"])
	price := mapValue(detail["itemPriceDTO"])
	rows := []string{}
	for _, raw := range sliceValue(detail["itemSkuList"]) {
		sku := mapValue(raw)
		props := []string{}
		for _, p := range sliceValue(sku["propertyList"]) {
			v := mapValue(p)
			props = append(props, stringValue(v["propertyText"])+"="+stringValue(v["valueText"]))
		}
		sort.Strings(props)
		rows = append(rows, strings.Join(props, "|")+":"+stringValue(sku["priceInCent"])+":"+stringValue(sku["quantity"]))
	}
	sort.Strings(rows)
	return map[string]any{"title": stringValue(text["title"]), "description": stringValue(text["desc"]), "price": stringValue(price["priceInCent"]), "originalPrice": stringValue(price["origPriceInCent"]), "quantity": stringValue(detail["quantity"]), "skus": rows}
}

// SameManagedState 兼容 Mongo 数组类型和 JSON 数组类型。
func SameManagedState(a, b map[string]any) bool {
	x, _ := json.Marshal(a)
	y, _ := json.Marshal(b)
	return string(x) == string(y)
}

// actionableState 只将库存是否可售用于对账，原始精确库存仍保留用于并发校验和编辑回读。
func actionableState(state map[string]any) map[string]any {
	result := make(map[string]any, len(state))
	for key, value := range state {
		result[key] = value
	}
	result["quantity"] = availabilityValue(stringValue(state["quantity"]))
	encoded, _ := json.Marshal(state["skus"])
	var rows []string
	_ = json.Unmarshal(encoded, &rows)
	availableRows := []string{}
	for _, row := range rows {
		// 行尾是库存数量，规格值本身可以包含冒号。
		separator := strings.LastIndex(row, ":")
		if separator < 0 {
			availableRows = append(availableRows, row)
			continue
		}
		quantity := availabilityValue(row[separator+1:])
		// 零库存规格和已删除规格均不可购买。
		if quantity == "0" {
			continue
		}
		availableRows = append(availableRows, row[:separator+1]+quantity)
	}
	sort.Strings(availableRows)
	result["skus"] = availableRows
	delete(result, "title")
	delete(result, "description")
	result["shippingRegions"] = descriptionValues(stringValue(state["description"]), "发货地区")
	result["describedSizes"] = descriptionValues(stringValue(state["description"]), "有货尺码/型号")
	return result
}

// descriptionValues 只读取业务字段，忽略模板段落、空格和枚举顺序。
func descriptionValues(description, label string) string {
	for _, line := range strings.Split(description, "\n") {
		line = strings.TrimSpace(strings.ReplaceAll(line, "：", ":"))
		if !strings.HasPrefix(line, label+":") {
			continue
		}
		values := strings.FieldsFunc(strings.TrimPrefix(line, label+":"), func(r rune) bool { return r == '、' || r == ',' || r == '，' || r == ';' || r == '；' })
		unique := map[string]bool{}
		ordered := []string{}
		for _, value := range values {
			value = strings.TrimSpace(value)
			if value != "" && !unique[value] {
				unique[value] = true
				ordered = append(ordered, value)
			}
		}
		sort.Strings(ordered)
		return strings.Join(ordered, "、")
	}
	return ""
}

func availabilityValue(value string) string {
	quantity, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return value
	}
	if quantity > 0 {
		return "1"
	}
	return "0"
}

// SameActionableState 决定是否需要编辑：忽略仍有货的数量波动。
func SameActionableState(before, after map[string]any) bool {
	return SameManagedState(actionableState(before), actionableState(after))
}

// ManagedEditPayload 用同一个发布生成器替换文案、价格、规格，保留原图片和服务配置。
func ManagedEditPayload(detail map[string]any, input PublishInput) map[string]any {
	payload := sellerTextEditPayload(detail, input.Title, input.Description)
	payload["itemPriceDTO"] = map[string]any{"priceInCent": strconv.FormatInt(input.PriceCents, 10), "origPriceInCent": optionalPrice(input.OriginalPriceCents)}
	payload["quantity"] = publishQuantity(input.Variants)
	if len(input.Variants) == 0 && input.Quantity > 0 {
		payload["quantity"] = strconv.FormatInt(input.Quantity, 10)
	}
	payload["itemSkuList"] = buildPublishSKUList(input.Variants)
	payload["itemProperties"] = buildPublishProperties(input.Variants)
	payload["propertyImageList"] = nil
	// 沿用完全相同的规格组合 ID，新增规格交给闲鱼创建。
	oldIDs := map[string]map[string]any{}
	for _, v := range sliceValue(detail["itemSkuList"]) {
		sku := mapValue(v)
		oldIDs[skuPropertyKey(sku)] = sku
	}
	for _, v := range sliceValue(payload["itemSkuList"]) {
		sku := mapValue(v)
		old := oldIDs[skuPropertyKey(sku)]
		for _, key := range []string{"skuId", "inventoryId"} {
			if old[key] != nil {
				sku[key] = old[key]
			}
		}
	}
	return payload
}

// ManagedRelistPayload 使用编辑发布页相同语义，把下架商品状态切回正式在售。
func ManagedRelistPayload(detail map[string]any, input PublishInput) map[string]any {
	payload := ManagedEditPayload(detail, input)
	payload["itemStatus"] = "0"
	return payload
}

func skuPropertyKey(sku map[string]any) string {
	// 转一次 JSON，使生成器和接口返回数组具有相同类型。
	encoded, _ := json.Marshal(sku["propertyList"])
	var props []map[string]any
	_ = json.Unmarshal(encoded, &props)
	keys := []string{}
	for _, p := range props {
		keys = append(keys, stringValue(p["propertyText"])+"="+stringValue(p["valueText"]))
	}
	sort.Strings(keys)
	return strings.Join(keys, "|")
}

// EditManagedItem 编辑前核对远端快照，成功后回读，重试时已达目标则不重复编辑。
func (service *Service) EditManagedItem(ctx context.Context, itemID string, input PublishInput, before map[string]any) error {
	detail, err := service.GetSellerEditDetail(ctx, itemID)
	if err != nil {
		return err
	}
	payload := ManagedEditPayload(detail, input)
	desired := ManagedState(payload)
	current := ManagedState(detail)
	if SameActionableState(current, desired) {
		return nil
	}
	if !SameManagedState(current, before) {
		return fmt.Errorf("闲鱼商品已发生变化，请重新生成预览后修改")
	}
	client, name, err := service.loadClient(ctx)
	if err != nil {
		return err
	}
	var response map[string]any
	callErr := client.Call(ctx, "mtop.idle.pc.backend.idleitem.edit", "1.0", map[string]any{"inputJson": mustJSON(payload)}, &response)
	_ = service.saveCookie(ctx, client.CookieHeader(), name, client.CredentialVersion())
	actual, readErr := service.GetSellerEditDetail(ctx, itemID)
	if readErr == nil && SameManagedState(ManagedState(actual), desired) {
		return nil
	}
	if callErr != nil {
		return callErr
	}
	if readErr != nil {
		return readErr
	}
	return fmt.Errorf("闲鱼编辑后回读不一致，请核对商品，不自动覆盖重试")
}

// StateChangeReasons 返回用户能理解的变更类型。
func StateChangeReasons(before, after map[string]any) []string {
	before, after = actionableState(before), actionableState(after)
	reasons := []string{}
	for _, field := range []struct{ key, label string }{{"price", "售价"}, {"originalPrice", "划线价"}, {"shippingRegions", "发货地区"}, {"describedSizes", "描述中的可售尺码"}} {
		if !reflect.DeepEqual(before[field.key], after[field.key]) {
			oldValue, newValue := stringValue(before[field.key]), stringValue(after[field.key])
			if field.key == "price" || field.key == "originalPrice" {
				oldValue = reasonPrice(oldValue)
				newValue = reasonPrice(newValue)
			}
			if oldValue == "" {
				oldValue = "未记录"
			}
			if newValue == "" {
				newValue = "无"
			}
			reasons = append(reasons, fmt.Sprintf("%s：%s → %s", field.label, oldValue, newValue))
		}
	}
	if before["quantity"] != after["quantity"] {
		reasons = append(reasons, "商品可售状态："+availabilityLabel(stringValue(before["quantity"]))+" → "+availabilityLabel(stringValue(after["quantity"])))
	}
	oldSKUs, newSKUs := reasonSKUs(before), reasonSKUs(after)
	keys := []string{}
	for key := range oldSKUs {
		keys = append(keys, key)
	}
	for key := range newSKUs {
		if _, exists := oldSKUs[key]; !exists {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)
	if len(oldSKUs) == 0 && len(newSKUs) > 0 {
		reasons = append(reasons, "补充购买规格：原商品无可选规格 → "+strings.Join(keys, "、"))
	} else {
		for _, key := range keys {
			oldPrice, had := oldSKUs[key]
			newPrice, has := newSKUs[key]
			switch {
			case !had:
				reasons = append(reasons, "规格新增/恢复有货："+key)
			case !has:
				reasons = append(reasons, "规格缺货/移除："+key)
			case oldPrice != newPrice:
				reasons = append(reasons, "规格售价（"+key+"）："+reasonPrice(oldPrice)+" → "+reasonPrice(newPrice))
			}
		}
	}
	return reasons
}

func reasonPrice(value string) string {
	cents, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return "未记录"
	}
	return fmt.Sprintf("¥%.2f", float64(cents)/100)
}
func availabilityLabel(value string) string {
	if value == "1" {
		return "有货"
	}
	if value == "0" {
		return "缺货"
	}
	return "未知"
}
func reasonSKUs(state map[string]any) map[string]string {
	encoded, _ := json.Marshal(state["skus"])
	var rows []string
	_ = json.Unmarshal(encoded, &rows)
	result := map[string]string{}
	for _, row := range rows {
		last := strings.LastIndex(row, ":")
		if last < 0 {
			continue
		}
		rest := row[:last]
		separator := strings.LastIndex(rest, ":")
		if separator < 0 {
			continue
		}
		result[rest[:separator]] = rest[separator+1:]
	}
	return result
}
