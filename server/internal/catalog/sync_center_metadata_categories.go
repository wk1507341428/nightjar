package catalog

import (
	"sort"
	"strings"
)

type syncMetadataCategoryNode struct {
	data   map[string]any
	parent string
	depth  int
}

func flattenMetadataCategory(value any, parent string, depth int) []syncMetadataCategoryNode {
	result := []syncMetadataCategoryNode{}
	for _, row := range categoryMaps(value) {
		result = append(result, syncMetadataCategoryNode{row, parent, depth})
		result = append(result, flattenMetadataCategory(row["children"], metadataCategoryID(row), depth+1)...)
	}
	return result
}

func metadataCategoryID(row map[string]any) string {
	return firstNonEmpty(mapString(row, "category_id"), mapString(row, "id"))
}
func metadataCategoryName(row map[string]any) string {
	return firstNonEmpty(mapString(row, "category_name"), mapString(row, "name"))
}

// Match the existing publish UI: standard tree first, explicit level 2 then depth 2, legacy last flat node.
func selectedMetadataCategories(data map[string]any) (string, map[string]bool) {
	for _, system := range []string{"item_category_main", "item_category_info"} {
		nodes := flattenMetadataCategory(data[system], "", 1)
		for _, mode := range []string{"level", "depth", "flat"} {
			ids := metadataCategorySelection(nodes, mode)
			if len(ids) > 0 {
				return system, ids
			}
		}
	}
	return "", map[string]bool{}
}

func metadataCategorySelection(nodes []syncMetadataCategoryNode, mode string) map[string]bool {
	ids := map[string]bool{}
	for _, node := range nodes {
		if metadataCategoryID(node.data) == "" || metadataCategoryName(node.data) == "" {
			continue
		}
		level := mapString(node.data, "category_level")
		switch mode {
		case "level":
			if level == "2" {
				ids[metadataCategoryID(node.data)] = true
			}
		case "depth":
			if node.depth == 2 {
				ids[metadataCategoryID(node.data)] = true
			}
		case "flat":
			if level == "" && node.depth == 1 {
				ids = map[string]bool{metadataCategoryID(node.data): true}
			}
		}
	}
	return ids
}

func appendMetadataCategories(rows map[string]SyncCenterCategory, head SyncCenterSnapshot, product SyncCenterProduct) {
	displaySystem, displayIDs := selectedMetadataCategories(product.Data)
	for _, system := range []string{"item_category_main", "item_category_info"} {
		for _, node := range flattenMetadataCategory(product.Data[system], "", 1) {
			category := metadataCategoryRow(head, product, system, node)
			if category.CategoryID == "" || category.Name == "" {
				continue
			}
			category.Display = system == displaySystem && displayIDs[category.CategoryID]
			old := rows[category.ID]
			if category.ImageURL == "" {
				category.ImageURL = old.ImageURL
			}
			category.Display = category.Display || old.Display
			rows[category.ID] = category
		}
	}
}

func metadataCategoryRow(head SyncCenterSnapshot, product SyncCenterProduct, system string, node syncMetadataCategoryNode) SyncCenterCategory {
	id := metadataCategoryID(node.data)
	return SyncCenterCategory{ID: hashID(head.ProfileID, head.Generation, product.RegionID, product.DistributorID, system, id, node.parent), ProfileID: head.ProfileID, Generation: head.Generation, RegionID: product.RegionID, DistributorID: product.DistributorID, System: system, CategoryID: id, ParentID: node.parent, Depth: node.depth, Level: mapString(node.data, "category_level"), Path: mapString(node.data, "path"), Name: metadataCategoryName(node.data), ImageURL: strings.TrimSpace(mapString(node.data, "image_url")), Raw: node.data, SyncedAt: head.SyncedAt}
}

func metadataDisplayRows(categories []SyncCenterCategory) []BrandCategory {
	byID := map[string]BrandCategory{}
	for _, row := range categories {
		if !row.Display {
			continue
		}
		image := row.ImageURL
		if image == "" {
			image = byID[row.CategoryID].ImageURL
		}
		byID[row.CategoryID] = BrandCategory{ID: row.CategoryID, Name: row.Name, ImageURL: image}
	}
	result := make([]BrandCategory, 0, len(byID))
	for _, row := range byID {
		result = append(result, row)
	}
	sort.Slice(result, func(i, j int) bool {
		if result[i].Name == result[j].Name {
			return result[i].ID < result[j].ID
		}
		return result[i].Name < result[j].Name
	})
	return result
}
