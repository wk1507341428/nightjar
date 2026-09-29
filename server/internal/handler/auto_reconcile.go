package handler

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/model"
	"sidejob-server/internal/svc"
	"sidejob-server/internal/types"
	"strings"
	"sync"
	"time"
)

// registerAutoReconcile 同步成功后只生成品牌对账预览，始终等待用户确认。
func registerAutoReconcile(sc *svc.ServiceContext) {
	var mutex sync.Mutex
	pending := map[string]*time.Timer{}
	running := map[string]bool{}
	sc.CatalogService.OnSynced = func(store catalog.BrandStore) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_, members, err := sc.InventoryRepository.ListBrandProfiles(ctx)
		if err != nil {
			return
		}
		accounts, accountErr := sc.XianyuAccountRepository.List(ctx)
		if accountErr != nil {
			return
		}
		for _, account := range accounts {
			if account.Status != model.XianyuAccountActive || !account.SellerConnected {
				continue
			}
			request := types.CreatePublishBatchRequest{AccountID: account.ID, SourceType: "live", RegionID: store.RegionID, DistributorID: store.DistributorID, BrandName: store.BrandName, Limit: 3000}
			key := account.ID + ":" + store.ID
			for _, member := range members {
				if member.RegionID == store.RegionID && member.DistributorID == store.DistributorID {
					request.BrandProfileID = member.ProfileID
					key = account.ID + ":" + member.ProfileID
					break
				}
			}
			mutex.Lock()
			if timer := pending[key]; timer != nil {
				timer.Stop()
			}
			requestCopy := request
			keyCopy := key
			pending[key] = time.AfterFunc(20*time.Second, func() {
				mutex.Lock()
				if running[keyCopy] {
					mutex.Unlock()
					return
				}
				running[keyCopy] = true
				mutex.Unlock()
				defer func() { mutex.Lock(); delete(running, keyCopy); mutex.Unlock() }()
				generateAutomaticPlan(sc, requestCopy)
			})
			mutex.Unlock()
		}
	}
}

func generateAutomaticPlan(sc *svc.ServiceContext, request types.CreatePublishBatchRequest) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
	defer cancel()
	collection := sc.MongoClient.Database(sc.Config.Mongo.Database).Collection("publish_previews")
	job := previewJob{ID: primitive.NewObjectID().Hex(), Status: "preparing", CreatedAt: time.Now(), Request: request}
	_, _ = collection.InsertOne(ctx, job)
	_, _ = collection.UpdateOne(ctx, bson.M{"_id": job.ID}, bson.M{"$set": bson.M{"automatic": true}})
	plan, err := buildPublishBatchPlan(ctx, sc, request)
	if err != nil {
		_, _ = collection.UpdateOne(context.Background(), bson.M{"_id": job.ID}, bson.M{"$set": bson.M{"status": "failed", "error": err.Error()}})
		return
	}
	// 自动维护仅处理已关联在售商品；新品仍由用户选择发布。
	plan.Candidates = nil
	if len(plan.Updates) == 0 && len(plan.OfflineListings) == 0 {
		_, _ = collection.DeleteOne(ctx, bson.M{"_id": job.ID})
		return
	}
	encoded, encodeErr := encodePreviewPlan(plan)
	if encodeErr != nil {
		_, _ = collection.UpdateOne(ctx, bson.M{"_id": job.ID}, bson.M{"$set": bson.M{"status": "failed", "error": encodeErr.Error()}})
		return
	}
	_, _ = collection.UpdateOne(ctx, bson.M{"_id": job.ID}, bson.M{"$set": bson.M{"status": "ready", "plan": encoded, "createdAt": time.Now()}})
}

// automaticPlansHandler 展示同步后生成的待确认计划和失败原因。
func automaticPlansHandler(sc *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filter := bson.M{"automatic": true}
		if accountID := strings.TrimSpace(r.URL.Query().Get("accountId")); accountID != "" {
			filter["request.accountId"] = accountID
		}
		cursor, err := sc.MongoClient.Database(sc.Config.Mongo.Database).Collection("publish_previews").Find(r.Context(), filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(20))
		if err != nil {
			writeError(w, 500, "读取对账计划失败")
			return
		}
		defer cursor.Close(r.Context())
		jobs := []previewJob{}
		if cursor.All(r.Context(), &jobs) != nil {
			writeError(w, 500, "读取对账计划失败")
			return
		}
		rows := []map[string]any{}
		for _, job := range jobs {
			var plan publishBatchPlan
			_ = decodePreviewPlan(job.Plan, &plan)
			rows = append(rows, map[string]any{"id": job.ID, "accountId": job.Request.AccountID, "status": job.Status, "error": job.Error, "request": job.Request, "brandName": job.Request.BrandName, "updates": len(plan.Updates), "offline": len(plan.OfflineListings), "createdAt": job.CreatedAt})
		}
		writeJSON(w, 200, rows)
	}
}
