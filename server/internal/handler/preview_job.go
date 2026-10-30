package handler

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"net/http"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
	"strings"
	"time"
)

var errPreviewUnavailable = errors.New("预览已过期或已提交，请重新生成")
var errPreviewPolicyChanged = errors.New("发布与下架规则已更新，请重新生成预览")

type previewJob struct {
	ID        string                          `bson:"_id"`
	Status    string                          `bson:"status"`
	Error     string                          `bson:"error"`
	Plan      []byte                          `bson:"plan"`
	CreatedAt time.Time                       `bson:"createdAt"`
	Request   types.CreatePublishBatchRequest `bson:"request"`
}

// servePreviewJob 将耗时的闲鱼逐件对账放入后台，保存结果供确认时使用。
func servePreviewJob(w http.ResponseWriter, r *http.Request, sc *svc.ServiceContext, body types.CreatePublishBatchRequest) {
	collection := sc.MongoClient.Database(sc.Config.Mongo.Database).Collection("publish_previews")
	if body.PreviewID != "" {
		var job previewJob
		if err := collection.FindOne(r.Context(), bson.M{"_id": body.PreviewID}).Decode(&job); err != nil {
			writeError(w, 404, "预览不存在，请重新生成")
			return
		}
		if job.Request.AccountID != body.AccountID {
			writeError(w, http.StatusConflict, "预览所属账号已变化，请重新生成")
			return
		}
		if job.Status == "failed" {
			writeError(w, 502, job.Error)
			return
		}
		if job.Status != "ready" {
			if job.Status != "preparing" || time.Since(job.CreatedAt) > 21*time.Minute {
				writeError(w, 409, "预览已提交或生成超时，请重新生成")
				return
			}
			writeJSON(w, 202, map[string]any{"previewId": job.ID, "status": job.Status})
			return
		}
		var plan publishBatchPlan
		if err := decodeCurrentPreviewPlan(job.Plan, &plan); err != nil {
			writePreviewPlanError(w, err)
			return
		}
		filterPreviewPriceCeiling(&plan)
		writeJSON(w, 200, types.PublishBatchPreviewResponse{AccountID: plan.AccountID, PreviewID: job.ID, Candidates: publishBatchCandidateResponses(plan.Candidates), Relists: publishTaskResponses(plan.Relists), Updates: plan.Updates, Unchanged: plan.Unchanged, BrandStoreID: plan.BrandStoreID, BrandName: plan.BrandName, CategoryIDs: plan.CategoryIDs, CategoryNames: plan.CategoryNames, Total: plan.Total, Publishable: len(plan.Candidates) + len(plan.Relists), Selected: minInt(job.Request.Limit, len(plan.Candidates)+len(plan.Relists)), Skipped: publishBatchSkipResponses(plan.Skipped), OfflineCandidates: publishBatchOfflineCandidateResponses(plan)})
		return
	}
	if body.SourceSnapshotID == "" {
		body.SourceSnapshotID = primitive.NewObjectID().Hex()
	}
	job := previewJob{ID: primitive.NewObjectID().Hex(), Status: "preparing", CreatedAt: time.Now(), Request: body}
	if _, err := collection.InsertOne(r.Context(), job); err != nil {
		writeError(w, 500, "创建预览失败")
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
		defer cancel()
		plan, err := buildConfirmedPreviewPlan(ctx, sc, body)
		update := bson.M{"status": "ready"}
		if err != nil {
			update = bson.M{"status": "failed", "error": err.Error()}
		} else {
			encoded, encodeErr := encodePreviewPlan(plan)
			if encodeErr != nil {
				update = bson.M{"status": "failed", "error": encodeErr.Error()}
			} else {
				update["plan"] = encoded
				update["createdAt"] = time.Now()
			}
		}
		saveCtx, saveCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer saveCancel()
		if _, saveErr := collection.UpdateOne(saveCtx, bson.M{"_id": job.ID}, bson.M{"$set": update}); saveErr != nil {
			_, _ = collection.UpdateOne(saveCtx, bson.M{"_id": job.ID}, bson.M{"$set": bson.M{"status": "failed", "error": "保存预览失败：" + saveErr.Error()}})
		}
	}()
	writeJSON(w, 202, map[string]any{"previewId": job.ID, "status": "preparing"})
}

// buildConfirmedPreviewPlan 在展示前应用与确认一致的去重保护，未知状态不能算作可恢复商品。
func buildConfirmedPreviewPlan(ctx context.Context, sc *svc.ServiceContext, body types.CreatePublishBatchRequest) (publishBatchPlan, error) {
	plan, err := buildPublishBatchPlan(ctx, sc, body)
	if err != nil {
		return plan, err
	}
	err = recheckPreviewActivations(ctx, sc, &plan)
	return plan, err
}

// consumePreview 只允许提交用户已经看过的有效预览一次。
func consumePreview(ctx context.Context, sc *svc.ServiceContext, body types.CreatePublishBatchRequest) (publishBatchPlan, error) {
	var job previewJob
	collection := sc.MongoClient.Database(sc.Config.Mongo.Database).Collection("publish_previews")
	err := collection.FindOneAndUpdate(ctx, bson.M{"_id": body.PreviewID, "status": "ready", "request.accountId": body.AccountID, "createdAt": bson.M{"$gte": time.Now().Add(-30 * time.Minute)}}, bson.M{"$set": bson.M{"status": "submitted"}}).Decode(&job)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return publishBatchPlan{}, errPreviewUnavailable
		}
		return publishBatchPlan{}, fmt.Errorf("读取发布预览失败: %w", err)
	}
	var plan publishBatchPlan
	err = decodeCurrentPreviewPlan(job.Plan, &plan)
	if err == nil {
		selectPreviewActions(&plan, job.Request.Limit, body.PreservedOfflinePlatformItemIDs)
		plan.PreservedOfflineIDs = body.PreservedOfflinePlatformItemIDs
		err = recheckPreviewActivations(ctx, sc, &plan)
	}
	return plan, err
}

// decodeCurrentPreviewPlan 读取与确认共用政策版本校验，旧预览不能展示或提交旧策略。
func decodeCurrentPreviewPlan(data []byte, plan *publishBatchPlan) error {
	if err := decodePreviewPlan(data, plan); err != nil {
		return err
	}
	if plan.SourceSnapshotVersion != aggregateSnapshotVersion {
		return errPreviewPolicyChanged
	}
	return nil
}

func writePreviewPlanError(w http.ResponseWriter, err error) {
	if errors.Is(err, errPreviewPolicyChanged) {
		writeError(w, http.StatusConflict, err.Error())
		return
	}
	writeError(w, http.StatusInternalServerError, "预览读取失败")
}

// excludePreservedOfflineListings 移除用户明确要求保留上架的闲鱼商品。
func excludePreservedOfflineListings(listings []model.MarketplaceListing, preservedPlatformItemIDs []string) []model.MarketplaceListing {
	if len(preservedPlatformItemIDs) == 0 {
		return listings
	}
	preservedIDs := make(map[string]struct{}, len(preservedPlatformItemIDs))
	for _, platformItemID := range preservedPlatformItemIDs {
		preservedIDs[strings.TrimSpace(platformItemID)] = struct{}{}
	}
	filteredListings := make([]model.MarketplaceListing, 0, len(listings))
	for _, listing := range listings {
		if _, preserved := preservedIDs[strings.TrimSpace(listing.PlatformItemID)]; !preserved {
			filteredListings = append(filteredListings, listing)
		}
	}
	return filteredListings
}

// encodePreviewPlan 压缩完整货源快照，避免多门店计划超过 Mongo 单文档限制。
func encodePreviewPlan(plan publishBatchPlan) ([]byte, error) {
	var output bytes.Buffer
	writer := gzip.NewWriter(&output)
	if err := json.NewEncoder(writer).Encode(plan); err != nil {
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}
	if output.Len() > 14<<20 {
		return nil, fmt.Errorf("预览数据过大，请缩小品类范围")
	}
	return output.Bytes(), nil
}

func decodePreviewPlan(data []byte, plan *publishBatchPlan) error {
	if len(data) > 2 && data[0] == 0x1f && data[1] == 0x8b {
		reader, err := gzip.NewReader(bytes.NewReader(data))
		if err != nil {
			return err
		}
		defer reader.Close()
		return json.NewDecoder(reader).Decode(plan)
	}
	return json.Unmarshal(data, plan)
}
