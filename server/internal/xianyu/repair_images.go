package xianyu

import (
	"context"
	"fmt"
	"strings"
)

// AppendSellerImages 为已有商品补图，保留原主图、文案、价格和规格并回读验证。
func (service *Service) AppendSellerImages(ctx context.Context, itemID string, paths []string) (int, error) {
	before, err := service.GetSellerEditDetail(ctx, itemID)
	if err != nil {
		return 0, err
	}
	images := sliceValue(before["imageInfoDOList"])
	if len(images) > 1 {
		return len(images), nil
	}
	if len(images) != 1 || len(paths) == 0 {
		return 0, fmt.Errorf("原主图或待补图片为空")
	}
	client, name, err := service.loadClient(ctx)
	if err != nil {
		return 0, err
	}
	defer func() {
		_ = service.saveCookie(context.WithoutCancel(ctx), client.CookieHeader(), name, client.CredentialVersion())
	}()
	for _, path := range paths {
		if len(images) >= 9 {
			break
		}
		uploaded, uploadErr := client.UploadImage(ctx, path)
		if uploadErr != nil {
			return 0, uploadErr
		}
		info := buildImageInfos([]UploadedImage{uploaded})[0]
		info["major"] = false
		images = append(images, info)
	}
	// 完整保留后台编辑详情，仅替换图片字段。
	payload := make(map[string]any, len(before))
	for key, value := range before {
		payload[key] = value
	}
	payload["imageInfoDOList"] = images
	payload["uniqueCode"] = uniqueCode()
	payload["sourceId"] = "pcBackendPublish"
	payload["bizcode"] = "pcMainPublish"
	payload["publishScene"] = "pcBackendPublish"
	var response map[string]any
	callErr := client.Call(ctx, "mtop.idle.pc.backend.idleitem.edit", "1.0", map[string]any{"inputJson": mustJSON(payload)}, &response)
	after, readErr := service.GetSellerEditDetail(ctx, itemID)
	if readErr == nil {
		actual := sliceValue(after["imageInfoDOList"])
		if len(actual) == len(images) && SameManagedState(ManagedState(before), ManagedState(after)) {
			for i := range actual {
				if normalizeRepairImageURL(stringValue(mapValue(actual[i])["url"])) != normalizeRepairImageURL(stringValue(mapValue(images[i])["url"])) {
					return len(actual), fmt.Errorf("图片地址回读不一致：expected=%s actual=%s", stringValue(mapValue(images[i])["url"]), stringValue(mapValue(actual[i])["url"]))
				}
			}
			return len(actual), nil
		}
	}
	if callErr != nil {
		return 0, callErr
	}
	if readErr != nil {
		return 0, readErr
	}
	return 0, fmt.Errorf("补图后回读内容不一致，请核对原商品")
}

// 闲鱼保存图片时可能把 HTTPS 改写为 HTTP，资源路径必须仍然完全相同。
func normalizeRepairImageURL(value string) string {
	return strings.TrimPrefix(strings.TrimPrefix(value, "https:"), "http:")
}
