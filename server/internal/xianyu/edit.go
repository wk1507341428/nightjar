package xianyu

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

// GetSellerEditDetail 读取可用于编辑的原商品快照。
func (service *Service) GetSellerEditDetail(ctx context.Context, itemID string) (map[string]any, error) {
	if !service.sellerWorkbench {
		return nil, errors.New("编辑商品需要卖家工作台会话")
	}
	client, _, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	var detail map[string]any
	if err = client.Call(ctx, "mtop.idle.pc.backend.idleitem.editdetail", "1.0", map[string]any{"itemId": itemID}, &detail); err != nil {
		return nil, err
	}
	if stringValue(detail["itemId"]) != itemID {
		return nil, errors.New("闲鱼编辑详情的商品 ID 不匹配")
	}
	return detail, nil
}

// EditSellerText 基于原商品快照编辑文案，保留库存、规格和服务配置。
func (service *Service) EditSellerText(ctx context.Context, itemID, title, description string) error {
	if strings.TrimSpace(title) == "" || len([]rune(title)) > 30 || strings.TrimSpace(description) == "" {
		return errors.New("编辑文案为空或标题超过30字")
	}
	detail, err := service.GetSellerEditDetail(ctx, itemID)
	if err != nil {
		return err
	}
	payload := sellerTextEditPayload(detail, title, description)
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return err
	}
	var response map[string]any
	if err = client.Call(ctx, "mtop.idle.pc.backend.idleitem.edit", "1.0", map[string]any{"inputJson": mustJSON(payload)}, &response); err != nil {
		return fmt.Errorf("编辑闲鱼商品失败：%w", err)
	}
	_ = service.saveCookie(ctx, client.CookieHeader(), displayName, client.CredentialVersion())
	if stringValue(response["itemId"]) != itemID {
		return errors.New("编辑结果未确认原商品 ID，请回读核对后再操作")
	}
	return nil
}

// sellerTextEditPayload 只替换文案字段，不修改其他商品内容。
func sellerTextEditPayload(detail map[string]any, title, description string) map[string]any {
	payload := make(map[string]any, len(detail))
	for key, value := range detail {
		payload[key] = value
	}
	payload["itemTextDTO"] = map[string]any{"title": title, "desc": description, "titleDescSeparate": true}
	payload["uniqueCode"] = uniqueCode()
	payload["sourceId"] = "pcBackendPublish"
	payload["bizcode"] = "pcMainPublish"
	payload["publishScene"] = "pcBackendPublish"
	return payload
}
