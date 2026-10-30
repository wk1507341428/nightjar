package xianyu

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/zeromicro/go-zero/core/logx"
	"strings"
)

const skuPropertyMaxRunes = 20

// SKUPropertyLabelMapping links an immutable source label to its platform-only representation.
type SKUPropertyLabelMapping struct {
	Kind     string `json:"kind"`
	Axis     string `json:"axis,omitempty"`
	Original string `json:"original"`
	Protocol string `json:"protocol"`
}

func skuProtocolLabel(domain, axis, value string) string {
	if len([]rune(value)) <= skuPropertyMaxRunes {
		return value
	}
	digest := sha256.Sum256([]byte(domain + "\x00" + axis + "\x00" + value))
	// Only append letters/digits: the platform rejects punctuation in custom labels.
	return string([]rune(value)[:12]) + hex.EncodeToString(digest[:4])
}
func skuProtocolProperty(name, value string) (string, string) {
	axis := skuProtocolLabel("name", "", name)
	return axis, skuProtocolLabel("value", axis, value)
}
func skuProtocolPropertyKey(name, value string) string {
	axis, label := skuProtocolProperty(name, value)
	return axis + "\x00" + label
}

// SKUPropertyLabelMappings rejects any non-injective mapping, including a literal
// short source value that collides with a generated label. It never merges source SKUs.
func SKUPropertyLabelMappings(variants []PublishVariant) ([]SKUPropertyLabelMapping, error) {
	names := map[string]string{}
	values := map[string]map[string]string{}
	mappings := []SKUPropertyLabelMapping{}
	recorded := map[string]bool{}
	for _, variant := range variants {
		for _, property := range variant.Properties {
			name, value := property.Name, property.Value
			if strings.TrimSpace(name) == "" || strings.TrimSpace(value) == "" {
				return nil, fmt.Errorf("闲鱼规格属性名称和值不能为空")
			}
			axis, label := skuProtocolProperty(name, value)
			if err := claimProtocolLabel(names, axis, name); err != nil {
				return nil, err
			}
			if values[axis] == nil {
				values[axis] = map[string]string{}
			}
			if err := claimProtocolLabel(values[axis], label, value); err != nil {
				return nil, err
			}
			for _, mapping := range []SKUPropertyLabelMapping{{Kind: "name", Original: name, Protocol: axis}, {Kind: "value", Axis: name, Original: value, Protocol: label}} {
				key := mapping.Kind + "\x00" + mapping.Axis + "\x00" + mapping.Original
				if mapping.Original != mapping.Protocol && !recorded[key] {
					mappings = append(mappings, mapping)
					recorded[key] = true
				}
			}
		}
	}
	return mappings, nil
}
func claimProtocolLabel(owners map[string]string, protocol, original string) error {
	if prior, exists := owners[protocol]; exists && prior != original {
		return fmt.Errorf("闲鱼规格短标识发生冲突，已拒绝提交，不会合并不同原规格：%q", protocol)
	}
	owners[protocol] = original
	return nil
}
func validateSKUProtocolProperties(variants []PublishVariant) error {
	mappings, err := SKUPropertyLabelMappings(variants)
	if err != nil {
		return err
	}
	if len(mappings) > 0 {
		logx.Infof("sku property protocol mappings (source unchanged): %s", mustJSON(mappings))
	}
	return nil
}
