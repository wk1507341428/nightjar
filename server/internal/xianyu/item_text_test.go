package xianyu

import (
	"strings"
	"testing"
)

func TestPublishAndEditUseFullUnifiedDescription(t *testing.T) {
	name := "全新 The North Face北面 F/W男冲锋衣 NF0A8DX1DHL1"
	description := name + "\n\n货号：NF0A8DX1DHL1\n发货地区：成都、重庆"
	input := PublishInput{Title: name, Description: description, PriceCents: 10000}
	payloads := []map[string]any{
		buildPublishPayload(input, nil, nil, nil, nil),
		sellerTextEditPayload(map[string]any{"itemId": "existing"}, name, description),
		ManagedRelistPayload(map[string]any{"itemId": "existing"}, input),
	}
	for _, payload := range payloads {
		text := mapValue(payload["itemTextDTO"])
		if text["title"] != description || text["desc"] != description || text["titleDescSeparate"] != false {
			t.Fatalf("unexpected text payload: %#v", text)
		}
	}
	if itemDescription(name, "\n货号：NF0A8DX1DHL1") != name+"\n\n货号：NF0A8DX1DHL1" {
		t.Fatal("legacy description lost full product name")
	}
}

func TestDescriptionLimitUsesOfficialUTF16CountWithoutTruncation(t *testing.T) {
	for _, text := range []string{strings.Repeat("中", 1500), strings.Repeat("A", 1500), strings.Repeat("😀", 750)} {
		if err := validateItemDescription("", text); err != nil {
			t.Fatal(err)
		}
		if unifiedItemText("", text)["desc"] != text {
			t.Fatal("description was truncated")
		}
	}
	for _, text := range []string{" ", strings.Repeat("中", 1501), strings.Repeat("😀", 751)} {
		if validateItemDescription("", text) == nil {
			t.Fatal("invalid description accepted")
		}
	}
	if validateItemDescription("完整名称", strings.Repeat("中", 1499)) == nil {
		t.Fatal("prepended product name must count toward limit")
	}
}

func TestUnifiedTextReadbackAcceptsPlatformGeneratedDisplayTitle(t *testing.T) {
	description := "全新 The North Face北面男冲锋衣 NF0A8DX1DHL1\n货号：NF0A8DX1DHL1"
	before := map[string]any{"itemTextDTO": unifiedItemText("", description)}
	remote := map[string]any{"itemTextDTO": map[string]any{"title": "平台生成的展示标题", "desc": description, "titleDescSeparate": "false"}}
	if !SameManagedState(ManagedState(before), ManagedState(remote)) {
		t.Fatal("platform display title must not cause verification failure")
	}
	mapValue(remote["itemTextDTO"])["desc"] = "错误文案"
	if SameManagedState(ManagedState(before), ManagedState(remote)) {
		t.Fatal("description mismatch must still fail verification")
	}
}
