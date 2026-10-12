package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/conf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/config"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/xianyu"
)

const (
	publishedDateLabel          = "发布时间："
	updatedDateLabel            = "更新时间："
	legacyPublishedDateLabel    = "发布时间:"
	publishDescriptionMaxLength = 1500
	publishTaskActionPublish    = "publish"
	publishTaskActionRelist     = "relist"
)

type candidate struct {
	Listing     model.MarketplaceListing
	PublishedAt time.Time
	Title       string
	Description string
}

type previewRow struct {
	ItemNo         string `json:"itemNo"`
	PlatformItemID string `json:"platformItemId"`
	Title          string `json:"title"`
	PublishedDate  string `json:"publishedDate"`
	UpdatedDate    string `json:"updatedDate"`
}

func main() {
	configPath := flag.String("f", "etc/sidejob-api.yaml", "配置文件路径")
	accountID := flag.String("account", model.DefaultXianyuAccountID, "闲鱼账号 ID")
	brandProfileID := flag.String("brand-profile", "", "品牌聚合配置 ID")
	limit := flag.Int("limit", 10, "最多处理商品数")
	itemIDs := flag.String("item-ids", "", "指定闲鱼商品 ID，逗号分隔")
	sessionKeyPath := flag.String("session-key", "", "闲鱼会话密钥路径")
	apply := flag.Bool("apply", false, "实际修改闲鱼商品")
	quiet := flag.Bool("quiet", false, "不输出预览明细")
	flag.Parse()

	var serviceConfig config.Config
	conf.MustLoad(*configPath, &serviceConfig)
	if err := serviceConfig.ApplyEnvironment(); err != nil {
		log.Fatal(err)
	}
	if *sessionKeyPath != "" {
		serviceConfig.Xianyu.SessionKeyPath = *sessionKeyPath
	}
	if *limit < 1 {
		log.Fatal("limit 必须大于 0")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Hour)
	defer cancel()
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(serviceConfig.Mongo.URI))
	if err != nil {
		log.Fatal(err)
	}
	defer mongoClient.Disconnect(context.Background())
	database := mongoClient.Database(serviceConfig.Mongo.Database)
	sessionCipher, err := security.NewCipherFromFile(serviceConfig.Xianyu.SessionKeyPath)
	if err != nil {
		log.Fatal(err)
	}
	sessionRepository := repository.NewSellerSessionRepository(database)
	xianyuService := xianyu.NewSellerService(serviceConfig.Xianyu, sessionRepository, sessionCipher).ForAccount(*accountID)

	candidates, err := loadCandidates(ctx, database, xianyuService, *accountID, *brandProfileID, splitNonEmpty(*itemIDs), *limit)
	if err != nil {
		log.Fatal(err)
	}
	updatedAt := time.Now()
	rows := make([]previewRow, 0, len(candidates))
	for _, item := range candidates {
		rows = append(rows, previewRow{ItemNo: item.Listing.ItemNo, PlatformItemID: item.Listing.PlatformItemID, Title: item.Title, PublishedDate: item.PublishedAt.In(time.Local).Format("2006-01-02"), UpdatedDate: updatedAt.In(time.Local).Format("2006-01-02 15:04")})
	}
	if !*quiet {
		encoded, _ := json.MarshalIndent(rows, "", "  ")
		fmt.Println(string(encoded))
	}
	fmt.Printf("matched %d\n", len(candidates))
	if !*apply {
		return
	}

	publishRepository := repository.NewPublishTaskRepository(database)
	for index, item := range candidates {
		updatedDescription := withDates(item.Description, item.PublishedAt, updatedAt)
		if err := xianyuService.EditSellerText(ctx, item.Listing.PlatformItemID, item.Title, updatedDescription); err != nil {
			log.Fatalf("修改 %s（%s）失败，已停止：%v", item.Listing.ItemNo, item.Listing.PlatformItemID, err)
		}
		actual, err := xianyuService.GetSellerEditDetail(ctx, item.Listing.PlatformItemID)
		if err != nil || nestedString(actual, "itemTextDTO", "desc") != updatedDescription {
			log.Fatalf("回读 %s（%s）失败，已停止：%v", item.Listing.ItemNo, item.Listing.PlatformItemID, err)
		}
		auditTask := model.PublishTask{ID: primitive.NewObjectID().Hex(), AccountID: *accountID, Action: "update", SourceItemID: item.Listing.SourceItemID, ItemNo: item.Listing.ItemNo, Title: item.Title, Description: updatedDescription, PriceCents: item.Listing.PriceCents, ImageURLs: []string{item.Listing.ImageURL}, BrandProfileID: item.Listing.BrandProfileID, SourceType: item.Listing.SourceType, SourceRegions: item.Listing.SourceRegions, SourceMemberIDs: item.Listing.SourceMemberIDs, SourceItemIDs: item.Listing.SourceItemIDs, PublishedAt: item.PublishedAt, XianyuItemID: item.Listing.PlatformItemID, XianyuURL: item.Listing.ItemURL, ChangeReasons: []string{"补齐发布时间和更新时间"}, Status: model.PublishTaskSucceeded, CreatedAt: updatedAt, UpdatedAt: updatedAt}
		if err := publishRepository.Create(ctx, auditTask); err != nil {
			log.Fatalf("商品 %s 已修改，但保存本地审计记录失败：%v", item.Listing.ItemNo, err)
		}
		fmt.Printf("updated %d/%d %s %s\n", index+1, len(candidates), item.Listing.ItemNo, item.Listing.PlatformItemID)
		time.Sleep(time.Second)
	}
}

func loadCandidates(ctx context.Context, database *mongo.Database, service *xianyu.Service, accountID, brandProfileID string, itemIDs []string, limit int) ([]candidate, error) {
	listingFilter := bson.M{"accountId": accountID, "platform": model.XianyuPlatform, "brandProfileId": brandProfileID, "$or": bson.A{bson.M{"saleStatus": "onsale"}, bson.M{"saleStatus": bson.M{"$exists": false}}}}
	if brandProfileID == "" {
		delete(listingFilter, "brandProfileId")
	}
	if len(itemIDs) > 0 {
		listingFilter["platformItemId"] = bson.M{"$in": itemIDs}
	}
	cursor, err := database.Collection("marketplace_listings").Find(ctx, listingFilter, options.Find().SetSort(bson.D{{Key: "listedAt", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var listings []model.MarketplaceListing
	if err := cursor.All(ctx, &listings); err != nil {
		return nil, err
	}
	platformItemIDs := make([]string, 0, len(listings))
	for _, listing := range listings {
		platformItemIDs = append(platformItemIDs, listing.PlatformItemID)
	}
	publishDates, err := loadPublishDates(ctx, database, accountID, platformItemIDs)
	if err != nil {
		return nil, err
	}
	result := make([]candidate, 0, min(limit, len(listings)))
	for _, listing := range listings {
		publishedAt := publishDates[listing.PlatformItemID]
		if publishedAt.IsZero() {
			continue
		}
		detail, err := service.GetSellerEditDetail(ctx, listing.PlatformItemID)
		if err != nil {
			return nil, fmt.Errorf("读取 %s（%s）失败：%w", listing.ItemNo, listing.PlatformItemID, err)
		}
		title := nestedString(detail, "itemTextDTO", "title")
		description := nestedString(detail, "itemTextDTO", "desc")
		if title == "" || description == "" || strings.Contains(description, publishedDateLabel) && strings.Contains(description, updatedDateLabel) {
			continue
		}
		result = append(result, candidate{Listing: listing, PublishedAt: publishedAt, Title: title, Description: description})
		if len(result) == limit {
			break
		}
	}
	return result, nil
}

func loadPublishDates(ctx context.Context, database *mongo.Database, accountID string, itemIDs []string) (map[string]time.Time, error) {
	result := make(map[string]time.Time)
	if len(itemIDs) == 0 {
		return result, nil
	}
	cursor, err := database.Collection("publish_tasks").Find(ctx, bson.M{"accountId": accountID, "xianyuItemId": bson.M{"$in": itemIDs}, "status": model.PublishTaskSucceeded, "action": bson.M{"$in": bson.A{publishTaskActionPublish, publishTaskActionRelist}}}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}).SetProjection(bson.M{"xianyuItemId": 1, "publishedAt": 1, "createdAt": 1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var tasks []model.PublishTask
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	for _, task := range tasks {
		publishedAt := task.PublishedAt
		if publishedAt.IsZero() {
			publishedAt = task.CreatedAt
		}
		if existing := result[task.XianyuItemID]; existing.IsZero() || publishedAt.Before(existing) {
			result[task.XianyuItemID] = publishedAt
		}
	}
	return result, nil
}

func withDates(description string, publishedAt, updatedAt time.Time) string {
	lines := make([]string, 0)
	for _, line := range strings.Split(description, "\n") {
		trimmedLine := strings.TrimSpace(line)
		if strings.HasPrefix(trimmedLine, publishedDateLabel) || strings.HasPrefix(trimmedLine, legacyPublishedDateLabel) || strings.HasPrefix(trimmedLine, updatedDateLabel) {
			continue
		}
		lines = append(lines, line)
	}
	suffix := "\n\n" + publishedDateLabel + " " + publishedAt.In(time.Local).Format("2006-01-02") + "\n" + updatedDateLabel + " " + updatedAt.In(time.Local).Format("2006-01-02 15:04")
	base := []rune(strings.TrimRight(strings.Join(lines, "\n"), "\n "))
	maxBaseLength := publishDescriptionMaxLength - len([]rune(suffix))
	if len(base) > maxBaseLength {
		base = base[:maxBaseLength]
	}
	return string(base) + suffix
}

func nestedString(value map[string]any, parentKey, childKey string) string {
	parent, _ := value[parentKey].(map[string]any)
	return strings.TrimSpace(fmt.Sprint(parent[childKey]))
}

func splitNonEmpty(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmedPart := strings.TrimSpace(part); trimmedPart != "" {
			result = append(result, trimmedPart)
		}
	}
	return result
}
