package handler

import (
	"context"
	"strings"

	"sidejob-server/internal/model"
)

const previewCandidateBatchSize = 10

type publishSourceSelection struct {
	state       *publishPlanBuildState
	actions     *publishPlanActions
	groups      map[string][]map[string]any
	selected    map[string][]map[string]any
	order       []string
	verified    map[string]map[string]any
	validations map[string]publishDetailValidation
}

// refreshRequiredSources 在售完整核验；新品仅核验通过列表初筛且在发布限额内的候选。
// 完整列表保留作存在性证据，未入选新品不能被当成缺货。
func (state *publishPlanBuildState) refreshRequiredSources(ctx context.Context, actions *publishPlanActions) {
	selection := publishSourceSelection{state: state, actions: actions, groups: groupPublishSources(state.allScopeProducts), selected: groupPublishSources(state.products), verified: make(map[string]map[string]any), validations: make(map[string]publishDetailValidation)}
	for _, product := range state.products {
		key := model.ItemNoKey(productString(product, "item_no"))
		if _, exists := selection.selected[key]; exists {
			selection.order = append(selection.order, key)
			delete(selection.selected, key)
		}
	}
	selection.selected = groupPublishSources(state.products)
	state.plan.Total = len(selection.order)
	selection.refreshManaged(ctx)
	selection.refreshNewCandidates(ctx)
	state.products = nil
	for _, key := range selection.order {
		if product := selection.verified[key]; product != nil {
			state.products = append(state.products, product)
		}
	}
	state.validations = selection.validations
}

func groupPublishSources(sources []map[string]any) map[string][]map[string]any {
	groups := make(map[string][]map[string]any)
	for _, product := range sources {
		key := model.ItemNoKey(productString(product, "item_no"))
		if key != "" {
			groups[key] = append(groups[key], product)
		}
	}
	return groups
}

func (selection *publishSourceSelection) refreshManaged(ctx context.Context) {
	needed := make(map[string]bool)
	for _, listing := range selection.actions.listings {
		if !listingBelongsToPlan(listing, selection.state.plan) {
			continue
		}
		key := model.ItemNoKey(listing.ItemNo)
		if selection.state.plan.ActionMode != model.PublishPresetFull && len(selection.selected[key]) == 0 {
			continue
		}
		needed[key] = true
	}
	sources := make([]map[string]any, 0)
	for key := range needed {
		sources = append(sources, selection.groups[key]...)
	}
	products, validations := refreshPublishSources(ctx, selection.state.previewProductDetail, sources)
	selection.accept(products, validations)
}

func (selection *publishSourceSelection) refreshNewCandidates(ctx context.Context) {
	keys := selection.preselectNewCandidates()
	limit := selection.state.request.Limit
	if limit <= 0 {
		limit = 20
	}
	accepted := 0
	for len(keys) > 0 && accepted < limit && ctx.Err() == nil {
		count := min(previewCandidateBatchSize, limit-accepted, len(keys))
		batch := keys[:count]
		keys = keys[count:]
		sources := make([]map[string]any, 0)
		for _, key := range batch {
			sources = append(sources, selection.groups[key]...)
		}
		products, validations := refreshPublishSources(ctx, selection.state.previewProductDetail, sources)
		selection.accept(products, validations)
		for _, product := range products {
			key := model.ItemNoKey(productString(product, "item_no"))
			if reasons := publishProductExclusionReasons(product, selection.state.request); len(reasons) > 0 {
				selection.skip(key, strings.Join(reasons, "；"))
				delete(selection.verified, key)
				continue
			}
			accepted++
		}
	}
}

func (selection *publishSourceSelection) preselectNewCandidates() []string {
	keys := make([]string, 0)
	for _, key := range selection.order {
		if _, listed := selection.actions.listedItemNos[key]; listed {
			continue
		}
		if _, busy := selection.actions.existingTaskNos[key]; busy {
			continue
		}
		products := mergePublishProductsByItemNo(selection.selected[key])
		product := selection.selected[key][0]
		if len(products) > 0 {
			product = products[0]
		}
		if reasons := publishProductExclusionReasons(product, selection.state.request); len(reasons) > 0 {
			selection.skip(key, strings.Join(reasons, "；"))
			continue
		}
		keys = append(keys, key)
	}
	return keys
}

func (selection *publishSourceSelection) accept(products []map[string]any, validations map[string]publishDetailValidation) {
	for _, product := range products {
		selection.verified[model.ItemNoKey(productString(product, "item_no"))] = product
	}
	for key, validation := range validations {
		selection.validations[key] = validation
		if validation.err != nil {
			selection.skip(key, "商详核对失败，未操作："+validation.err.Error())
		}
	}
}

func (selection *publishSourceSelection) skip(key, reason string) {
	sources := selection.selected[key]
	if len(sources) == 0 {
		return
	}
	selection.state.plan.Skipped = append(selection.state.plan.Skipped, model.PublishBatchSkip{ItemNo: productString(sources[0], "item_no"), Title: productString(sources[0], "item_name"), Reason: reason})
}
