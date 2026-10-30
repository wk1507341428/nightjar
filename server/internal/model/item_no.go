package model

import "strings"

// ItemNoKey 统一同款货号的大小写和空白写法，保留连字符及颜色后缀。
// 原始货号仍用于标题展示，规范键只用于合并和防重。
func ItemNoKey(itemNo string) string {
	return strings.ToUpper(strings.Join(strings.Fields(itemNo), ""))
}

const (
	PublishActionPublish = "publish"
	PublishActionRelist  = "relist"
	PublishActionUpdate  = "update"
	PublishActionOffline = "offline"
)

// IsListingActivationAction 兼容旧版未保存 action 的新建任务。
func IsListingActivationAction(action string) bool {
	return action == "" || action == PublishActionPublish || action == PublishActionRelist
}
