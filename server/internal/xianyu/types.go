package xianyu

import (
	"encoding/json"
	"strings"
)

// UploadedImage 是闲鱼上传接口返回的图片信息。
type UploadedImage struct {
	URL     string      `json:"url"`
	ImgPath string      `json:"imgPath"`
	Width   json.Number `json:"width"`
	Height  json.Number `json:"height"`
	Pix     string      `json:"pix"`
	FileID  string      `json:"fileId"`
	Status  string      `json:"status"`
}

// mtopEnvelope 是闲鱼 MTop 通用响应。
type mtopEnvelope struct {
	Ret  []string        `json:"ret"`
	Data json.RawMessage `json:"data"`
}

// Success 判断 MTop 是否返回成功。
func (envelope mtopEnvelope) Success() bool {
	return len(envelope.Ret) > 0 && strings.HasPrefix(envelope.Ret[0], "SUCCESS")
}

// Error 拆分 MTop 错误码与错误文案。
func (envelope mtopEnvelope) Error() (string, string) {
	if len(envelope.Ret) == 0 {
		return "UNKNOWN", "闲鱼接口返回未知错误"
	}
	parts := strings.SplitN(envelope.Ret[0], "::", 2)
	if len(parts) == 1 {
		return parts[0], parts[0]
	}
	return parts[0], parts[1]
}
