package handler

import (
	"go/ast"
	"go/parser"
	"go/token"
	"testing"
)

// Category menus must never load full source documents or fan out by member stores.
func TestCategoryMenuHandlersOnlyUseMetadata(t *testing.T) {
	targets := map[string]string{"synced_search_handler.go": "syncedSourceCategoriesHandler", "catalog_inventory_handler.go": "listCatalogBrandCategoriesHandler", "offline_center_handler.go": "listOfflineCenterCategoriesHandler"}
	blocked := map[string]bool{"readSyncedSource": true, "ReadProfile": true, "ReadStore": true, "collectProfileCategories": true, "localSourceCategories": true, "syncedSnapshotCategories": true}
	for path, name := range targets {
		root, err := parser.ParseFile(token.NewFileSet(), path, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		found := false
		for _, decl := range root.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || fn.Name.Name != name {
				continue
			}
			found = true
			ast.Inspect(fn, func(node ast.Node) bool {
				if call, ok := node.(*ast.CallExpr); ok {
					method := ""
					switch f := call.Fun.(type) {
					case *ast.Ident:
						method = f.Name
					case *ast.SelectorExpr:
						method = f.Sel.Name
					}
					if blocked[method] {
						t.Errorf("%s reloads source data through %s", name, method)
					}
				}
				return true
			})
		}
		if !found {
			t.Fatalf("handler missing: %s", name)
		}
	}
}
