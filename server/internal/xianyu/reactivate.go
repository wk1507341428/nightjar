package xianyu

import (
	"context"
	"fmt"
	"strings"
)

// ReactivateManagedItem 用最新模板、图片、价格和规格编辑旧商品并重新上架。
func (service *Service) ReactivateManagedItem(ctx context.Context, itemID string, input PublishInput, before map[string]any) error {
	detail, err := service.GetSellerEditDetail(ctx, itemID)
	if err != nil {
		return err
	}
	payload := ManagedRelistPayload(detail, input)
	desiredState := ManagedState(payload)
	currentState := ManagedState(detail)
	if len(before) > 0 && !SameManagedState(currentState, before) && !SameActionableState(currentState, desiredState) {
		return fmt.Errorf("闲鱼历史商品已发生变化，请重新生成预览")
	}
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return err
	}
	defer func() {
		_ = service.saveCookie(context.WithoutCancel(ctx), client.CookieHeader(), displayName, client.CredentialVersion())
	}()
	if len(input.ImagePaths) > 0 {
		uploadedImages := make([]UploadedImage, 0, len(input.ImagePaths))
		for _, imagePath := range input.ImagePaths {
			uploadedImage, uploadErr := client.UploadImage(ctx, imagePath)
			if uploadErr != nil {
				return uploadErr
			}
			uploadedImages = append(uploadedImages, uploadedImage)
		}
		payload["imageInfoDOList"] = buildImageInfos(uploadedImages)
	}
	var editResponse map[string]any
	if err := client.Call(ctx, "mtop.idle.pc.backend.idleitem.edit", "1.0", map[string]any{"inputJson": mustJSON(payload)}, &editResponse); err != nil {
		return fmt.Errorf("编辑历史商品失败：%w", err)
	}
	after, err := service.GetSellerEditDetail(ctx, itemID)
	if err != nil {
		return err
	}
	if !SameManagedState(ManagedState(after), desiredState) {
		return fmt.Errorf("历史商品编辑回读不一致")
	}
	return nil
}

// DeleteSellerItems 删除恢复成功后剩余的重复下架商品。
func (service *Service) DeleteSellerItems(ctx context.Context, itemIDs []string) error {
	itemIDs = uniqueItemIDs(itemIDs)
	if len(itemIDs) == 0 {
		return nil
	}
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return err
	}
	defer func() {
		_ = service.saveCookie(context.WithoutCancel(ctx), client.CookieHeader(), displayName, client.CredentialVersion())
	}()
	var response map[string]any
	if err := client.Call(ctx, "mtop.alibaba.idle.seller.pc.item.batch.delete", "1.0", map[string]any{"itemIds": strings.Join(itemIDs, ",")}, &response); err != nil {
		return err
	}
	results := sliceValue(response["itemProcessResultList"])
	if data := mapValue(response["data"]); len(results) == 0 {
		results = sliceValue(data["itemProcessResultList"])
	}
	for _, rawResult := range results {
		if !boolValue(mapValue(rawResult)["success"]) {
			return fmt.Errorf("存在重复历史商品删除失败")
		}
	}
	return nil
}
