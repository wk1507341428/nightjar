package xianyu

import (
	"errors"
	"strings"
	"unicode/utf16"
)

const maxItemDescriptionLength = 1500

// itemDescription 保留完整商品名作为描述首行，也兼容旧任务尚未包含首行的文案。
func itemDescription(title, description string) string {
	title, description = strings.TrimSpace(title), strings.TrimSpace(description)
	if title != "" && !strings.HasPrefix(description, title) {
		return strings.TrimSpace(title + "\n\n" + description)
	}
	return description
}

// unifiedItemText 与闲鱼“发闲置”页面一致：完整文案同时传入 title/desc，由平台生成展示标题。
func unifiedItemText(title, description string) map[string]any {
	text := itemDescription(title, description)
	return map[string]any{"title": text, "desc": text, "titleDescSeparate": false}
}

// managedTextTitle 在不分离模式下以完整描述核验文案，避免平台自动生成的短标题导致回读误报。
func managedTextTitle(text map[string]any) string {
	separate, exists := text["titleDescSeparate"]
	if exists && (separate == false || separate == "false") {
		return stringValue(text["desc"])
	}
	return stringValue(text["title"])
}

func validateItemDescription(title, description string) error {
	text := itemDescription(title, description)
	if text == "" {
		return errors.New("宝贝描述不能为空")
	}
	// 官方页面使用 JavaScript string.length，按 UTF-16 计数；超长报错，不截断商品名称。
	if len(utf16.Encode([]rune(text))) > maxItemDescriptionLength {
		return errors.New("宝贝描述不能超过1500个字符，请精简文案")
	}
	return nil
}
