package handler

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"strings"
	"testing"
)

// Product reads remain local. The brand maintenance directory explicitly reads live brand metadata.
func TestSourceNetworkCallsRemainInsideSyncCenter(t *testing.T) {
	files, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	blocked := map[string]bool{"ListLiveBrandOffers": true, "GetLiveProductDetail": true, "GetFreshProductDetail": true, "DiscoverBrandStores": true}
	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".go") || strings.HasSuffix(file.Name(), "_test.go") {
			continue
		}
		positions := token.NewFileSet()
		root, err := parser.ParseFile(positions, file.Name(), nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		ast.Inspect(root, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok {
				return true
			}
			selector, ok := call.Fun.(*ast.SelectorExpr)
			if ok && blocked[selector.Sel.Name] && !isBrandDirectoryDiscovery(file.Name(), root, call, selector.Sel.Name) {
				t.Errorf("%s invokes source network method %s outside sync center", positions.Position(call.Pos()), selector.Sel.Name)
			}
			return true
		})
	}
}

// 品牌维护按用户要求保留实时品牌目录；不放开商品查询或其它页面。
func isBrandDirectoryDiscovery(fileName string, root *ast.File, call *ast.CallExpr, method string) bool {
	if fileName != "brand_profile_handler.go" || method != "DiscoverBrandStores" {
		return false
	}
	for _, declaration := range root.Decls {
		function, ok := declaration.(*ast.FuncDecl)
		if ok && function.Name.Name == "getBrandMaintenanceHandler" && call.Pos() >= function.Pos() && call.End() <= function.End() {
			return true
		}
	}
	return false
}
