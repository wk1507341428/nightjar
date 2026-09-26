// 修复本次重试缺图事件：只操作重试成功且记录为单图的商品，结果逐件留档。
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"regexp"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
	"sidejob-server/internal/model"
	"sidejob-server/internal/publish"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/xianyu"
	"strings"
	"time"
)

func main() {
	if os.Getenv("SIDEJOB_REPAIR_SINGLE_IMAGES") != "confirmed" {
		panic("explicit repair authorization required")
	}
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://sidejob:sidejob-dev@127.0.0.1:27017/?authSource=admin"))
	if err != nil {
		panic(err)
	}
	defer client.Disconnect(ctx)
	db := client.Database("sidejob")
	cipher, err := security.NewCipherFromFile("../runtime/session.key")
	if err != nil {
		panic(err)
	}
	seller := xianyu.NewSellerService(config.XianyuConfig{APIBase: "https://h5api.m.goofish.com/h5", AppKey: "34839810", UploadURL: "https://stream-upload.goofish.com/api/upload.api?floderId=0&appkey=fleamarket&_input_charset=utf-8", RequestTimeout: 30}, repository.NewSellerSessionRepository(db), cipher)
	cat := catalog.NewService(config.CatalogConfig{APIBase: "https://aiopro.fvo2o.com/api/h5app/wxapp", CompanyID: "1", AuthorizerAppID: "wx8fa740aa841dafb4", RequestTimeout: 15}, nil, nil)
	if id := os.Getenv("SIDEJOB_REPAIR_INSPECT"); id != "" {
		detail, err := seller.GetSellerEditDetail(ctx, id)
		if err != nil {
			panic(err)
		}
		fmt.Printf("images=%+v\n", detail["imageInfoDOList"])
		return
	}
	cursor, err := db.Collection("publish_tasks").Find(ctx, bson.M{"retryCount": bson.M{"$gt": 0}, "status": "succeeded", "action": bson.M{"$nin": bson.A{"update", "offline"}}, "imageUrls": bson.M{"$size": 1}})
	if err != nil {
		panic(err)
	}
	var tasks []model.PublishTask
	if err = cursor.All(ctx, &tasks); err != nil {
		panic(err)
	}
	fmt.Printf("targets=%d\n", len(tasks))
	for i, task := range tasks {
		repairCtx, cancel := context.WithTimeout(ctx, 3*time.Minute)
		count, urls, repairErr := repair(repairCtx, seller, cat, db, task)
		cancel()
		result := bson.M{"itemNo": task.ItemNo, "taskId": task.ID, "updatedAt": time.Now(), "imageCount": count}
		if repairErr != nil {
			result["status"] = "failed"
			result["error"] = repairErr.Error()
		} else {
			result["status"] = "verified"
			result["error"] = ""
			if len(urls) > 1 {
				_, err = db.Collection("publish_tasks").UpdateOne(ctx, bson.M{"_id": task.ID}, bson.M{"$set": bson.M{"imageUrls": urls, "updatedAt": time.Now()}})
				if err != nil {
					panic(err)
				}
			}
		}
		if _, err = db.Collection("image_repair_audit").UpdateOne(ctx, bson.M{"_id": task.XianyuItemID}, bson.M{"$set": result}, options.Update().SetUpsert(true)); err != nil {
			panic(err)
		}
		fmt.Printf("%d/%d item=%s remote=%s images=%d error=%v\n", i+1, len(tasks), task.ItemNo, task.XianyuItemID, count, repairErr)
		time.Sleep(time.Second)
	}
}

func repair(ctx context.Context, seller *xianyu.Service, cat *catalog.Service, db *mongo.Database, task model.PublishTask) (int, []string, error) {
	before, err := seller.GetSellerEditDetail(ctx, task.XianyuItemID)
	if err != nil {
		return 0, nil, err
	}
	images, _ := before["imageInfoDOList"].([]any)
	_, err = db.Collection("image_repair_audit").UpdateOne(ctx, bson.M{"_id": task.XianyuItemID}, bson.M{"$setOnInsert": bson.M{"before": before, "createdAt": time.Now()}}, options.Update().SetUpsert(true))
	if err != nil {
		return 0, nil, err
	}
	regions := append([]string{}, task.SourceRegions...)
	regions = append(regions, task.RegionID)
	var detail map[string]any
	for _, region := range regions {
		detail, err = cat.GetLiveProductDetail(ctx, map[string]any{"default_item_id": task.SourceItemID}, region)
		if err == nil && strings.EqualFold(fmt.Sprint(detail["item_no"]), task.ItemNo) {
			break
		}
	}
	if err != nil {
		return 0, nil, err
	}
	if !strings.EqualFold(fmt.Sprint(detail["item_no"]), task.ItemNo) {
		return 0, nil, fmt.Errorf("货号不匹配")
	}
	urls := []string{task.ImageURLs[0]}
	seen := map[string]bool{urls[0]: true}
	add := func(value string) {
		if strings.HasPrefix(value, "https://") || strings.HasPrefix(value, "http://") {
			if !seen[value] && len(urls) < 9 {
				seen[value] = true
				urls = append(urls, value)
			}
		}
	}
	if pics, ok := detail["pics"].([]any); ok {
		for _, v := range pics {
			add(fmt.Sprint(v))
		}
	}
	for _, match := range regexp.MustCompile(`(?i)<img[^>]+src=["'](https?://[^"']+)["']`).FindAllStringSubmatch(fmt.Sprint(detail["intro"]), -1) {
		add(match[1])
	}
	if len(urls) < 2 {
		return 0, nil, fmt.Errorf("上游商详没有额外图片")
	}
	if len(images) > 1 {
		var audit struct {
			Before     map[string]any `bson:"before"`
			ImageCount int            `bson:"imageCount"`
		}
		if err = db.Collection("image_repair_audit").FindOne(ctx, bson.M{"_id": task.XianyuItemID}).Decode(&audit); err != nil {
			return 0, nil, err
		}
		encoded, _ := json.Marshal(audit.Before)
		var original map[string]any
		_ = json.Unmarshal(encoded, &original)
		originalImages, _ := original["imageInfoDOList"].([]any)
		if len(originalImages) != 1 || !xianyu.SameManagedState(xianyu.ManagedState(original), xianyu.ManagedState(before)) {
			return 0, nil, fmt.Errorf("原始快照或价格规格核对失败")
		}
		oldMain, _ := originalImages[0].(map[string]any)
		newMain, _ := images[0].(map[string]any)
		if oldMain["url"] != newMain["url"] || (audit.ImageCount > 0 && audit.ImageCount != len(images)) {
			return 0, nil, fmt.Errorf("主图或图片数量校验失败")
		}
		return len(images), urls, nil
	}
	_, _ = db.Collection("image_repair_audit").UpdateOne(ctx, bson.M{"_id": task.XianyuItemID}, bson.M{"$set": bson.M{"sourceImageUrls": urls}})
	directory, paths, err := publish.DownloadRepairImages(ctx, urls[1:])
	if directory != "" {
		defer os.RemoveAll(directory)
	}
	if err != nil {
		return 0, nil, err
	}
	count, err := seller.AppendSellerImages(ctx, task.XianyuItemID, paths)
	return count, urls, err
}
