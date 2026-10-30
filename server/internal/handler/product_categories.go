package handler

import "go.mongodb.org/mongo-driver/bson"

type sourceCategoryNode struct {
	data  map[string]any
	depth int
}

// flattenSourceCategories accepts both historical flat paths and current nested source trees.
func flattenSourceCategories(value any, depth int) []sourceCategoryNode {
	result := []sourceCategoryNode{}
	appendNode := func(category map[string]any) {
		result = append(result, sourceCategoryNode{data: category, depth: depth})
		result = append(result, flattenSourceCategories(category["children"], depth+1)...)
	}
	switch value := value.(type) {
	case map[string]any:
		appendNode(value)
	case bson.M:
		appendNode(map[string]any(value))
	case []any:
		for _, entry := range value {
			result = append(result, flattenSourceCategories(entry, depth)...)
		}
	case bson.A:
		for _, entry := range value {
			result = append(result, flattenSourceCategories(entry, depth)...)
		}
	case []map[string]any:
		for _, entry := range value {
			appendNode(entry)
		}
	}
	return result
}

func secondLevelSourceCategories(nodes []sourceCategoryNode) []map[string]any {
	rows := []map[string]any{}
	for _, node := range nodes {
		if productString(node.data, "category_level") == "2" {
			rows = append(rows, node.data)
		}
	}
	if len(rows) > 0 {
		return rows
	}
	for _, node := range nodes {
		if node.depth == 2 {
			rows = append(rows, node.data)
		}
	}
	return rows
}

// sourceProductCategoryRows exposes the standard category system first. Regional
// custom category IDs are a fallback, never additional menu options for a valid main path.
func sourceProductCategoryRows(product map[string]any) []map[string]any {
	for _, field := range []string{"item_category_main", "item_category_info"} {
		if rows := selectSourceCategoryRows(flattenSourceCategories(product[field], 1)); len(rows) > 0 {
			return rows
		}
	}
	return nil
}

func selectSourceCategoryRows(nodes []sourceCategoryNode) []map[string]any {
	result := []map[string]any{}
	for _, row := range secondLevelSourceCategories(nodes) {
		if validSourceCategoryRow(row) {
			result = append(result, row)
		}
	}
	if len(result) > 0 {
		return result
	}
	// Legacy unlevelled flat paths retain their last valid node fallback.
	for _, node := range nodes {
		if productString(node.data, "category_level") == "" && node.depth == 1 && validSourceCategoryRow(node.data) {
			result = []map[string]any{node.data}
		}
	}
	return result
}

func validSourceCategoryRow(row map[string]any) bool {
	return firstProductString(row, "category_id", "id") != "" && firstProductString(row, "category_name", "name") != ""
}

func sourceMatchesCategories(product map[string]any, projected []string, selected map[string]bool) bool {
	if len(selected) == 0 {
		return true
	}
	for _, id := range projected {
		if selected[id] {
			return true
		}
	}
	for _, field := range []string{"item_category_main", "item_category_info"} {
		for _, node := range flattenSourceCategories(product[field], 1) {
			if selected[firstProductString(node.data, "category_id", "id")] {
				return true
			}
		}
	}
	return false
}
