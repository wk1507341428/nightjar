package svc

import (
	"context"
	"fmt"
	"time"

	redisclient "github.com/redis/go-redis/v9"
	"github.com/zeromicro/go-zero/core/logx"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/model"
	"sidejob-server/internal/publish"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/xianyu"
)

// ServiceContext 汇总 API 服务的共享依赖。
type ServiceContext struct {
	Config                  config.Config
	MongoClient             *mongo.Client
	RedisClient             *redisclient.Client
	PublishRepository       *repository.PublishTaskRepository
	PublishBatchRepository  *repository.PublishBatchRepository
	XianyuAccountRepository *repository.XianyuAccountRepository
	SessionRepository       *repository.SessionRepository
	SellerSessionRepository *repository.SessionRepository
	ListingRepository       *repository.MarketplaceListingRepository
	InventoryRepository     *catalog.InventoryRepository
	XianyuService           *xianyu.Service
	SellerXianyuService     *xianyu.Service
	PublishService          *publish.Service
	CatalogService          *catalog.Service
	MarketplaceService      *marketplace.Service
	runtimeCancel           context.CancelFunc
}

// NewServiceContext 初始化 MongoDB 和浏览器管理器。
func NewServiceContext(serviceConfig config.Config) (*ServiceContext, error) {
	databaseContext, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(databaseContext, options.Client().ApplyURI(serviceConfig.Mongo.URI))
	if err != nil {
		return nil, fmt.Errorf("connect MongoDB: %w", err)
	}
	if err := mongoClient.Ping(databaseContext, nil); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ping MongoDB: %w", err)
	}
	redisClient := redisclient.NewClient(&redisclient.Options{Addr: serviceConfig.Redis.Addr, Password: serviceConfig.Redis.Password, DB: serviceConfig.Redis.DB})
	if err := redisClient.Ping(databaseContext).Err(); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ping Redis: %w", err)
	}

	publishRepository := repository.NewPublishTaskRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := publishRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure publish task indexes: %w", err)
	}
	publishBatchRepository := repository.NewPublishBatchRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := publishBatchRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure publish batch indexes: %w", err)
	}
	listingRepository := repository.NewMarketplaceListingRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := listingRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure marketplace listing indexes: %w", err)
	}

	sessionRepository := repository.NewSessionRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	sellerSessionRepository := repository.NewSellerSessionRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	xianyuAccountRepository := repository.NewXianyuAccountRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := xianyuAccountRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure xianyu account indexes: %w", err)
	}
	if err := xianyuAccountRepository.EnsureDefault(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure default xianyu account: %w", err)
	}
	if err := migrateLegacyAccountData(databaseContext, mongoClient.Database(serviceConfig.Mongo.Database)); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("migrate legacy xianyu account data: %w", err)
	}
	sessionCipher, err := security.NewCipherFromFile(serviceConfig.Xianyu.SessionKeyPath)
	if err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("initialize session cipher: %w", err)
	}
	xianyuService := xianyu.NewService(serviceConfig.Xianyu, sessionRepository, sessionCipher)
	sellerXianyuService := xianyu.NewSellerService(serviceConfig.Xianyu, sellerSessionRepository, sessionCipher)
	if session, sessionErr := sessionRepository.ForAccount(model.DefaultXianyuAccountID).Get(databaseContext); sessionErr == nil {
		_ = xianyuAccountRepository.UpdateConnection(databaseContext, model.DefaultXianyuAccountID, "session", session.DisplayName, session.PlatformUserID, true, session.EncryptedSearchCredential != "")
	}
	if session, sessionErr := sellerSessionRepository.ForAccount(model.DefaultXianyuAccountID).Get(databaseContext); sessionErr == nil {
		_ = xianyuAccountRepository.UpdateConnection(databaseContext, model.DefaultXianyuAccountID, "seller", session.DisplayName, session.PlatformUserID, true, false)
	}
	inventoryRepository := catalog.NewInventoryRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := inventoryRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure catalog inventory indexes: %w", err)
	}
	catalogService := catalog.NewService(serviceConfig.Catalog, inventoryRepository, listingRepository, redisClient)
	marketplaceService := marketplace.NewService(listingRepository, publishRepository, xianyuAccountRepository, xianyuService, sellerXianyuService)

	runtimeContext, runtimeCancel := context.WithCancel(context.Background())
	publishService := publish.NewService(runtimeContext, publishRepository, xianyuAccountRepository, sellerXianyuService, marketplaceService)
	go syncXianyuListings(runtimeContext, marketplaceService, xianyuAccountRepository)

	return &ServiceContext{
		Config:                  serviceConfig,
		MongoClient:             mongoClient,
		RedisClient:             redisClient,
		PublishRepository:       publishRepository,
		PublishBatchRepository:  publishBatchRepository,
		XianyuAccountRepository: xianyuAccountRepository,
		SessionRepository:       sessionRepository,
		SellerSessionRepository: sellerSessionRepository,
		ListingRepository:       listingRepository,
		InventoryRepository:     inventoryRepository,
		XianyuService:           xianyuService,
		SellerXianyuService:     sellerXianyuService,
		PublishService:          publishService,
		CatalogService:          catalogService,
		MarketplaceService:      marketplaceService,
		runtimeCancel:           runtimeCancel,
	}, nil
}

// migrateLegacyAccountData 把历史单账号记录归入默认账号，允许脚本重复执行。
func migrateLegacyAccountData(ctx context.Context, database *mongo.Database) error {
	for _, collectionName := range []string{"publish_tasks", "publish_batches", "marketplace_listings"} {
		if err := backupLegacyAccountData(ctx, database, collectionName, bson.M{"accountId": bson.M{"$exists": false}}); err != nil {
			return err
		}
		if _, err := database.Collection(collectionName).UpdateMany(ctx, bson.M{"accountId": bson.M{"$exists": false}}, bson.M{"$set": bson.M{"accountId": model.DefaultXianyuAccountID}}); err != nil {
			return err
		}
	}
	if err := backupLegacyAccountData(ctx, database, "publish_previews", bson.M{"request.accountId": bson.M{"$exists": false}}); err != nil {
		return err
	}
	_, err := database.Collection("publish_previews").UpdateMany(ctx, bson.M{"request.accountId": bson.M{"$exists": false}}, bson.M{"$set": bson.M{"request.accountId": model.DefaultXianyuAccountID}})
	return err
}

// backupLegacyAccountData 在首次补 accountId 前保存原始文档，便于回退。
func backupLegacyAccountData(ctx context.Context, database *mongo.Database, collectionName string, filter bson.M) error {
	cursor, err := database.Collection(collectionName).Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	writes := make([]mongo.WriteModel, 0)
	for cursor.Next(ctx) {
		var document bson.M
		if err := cursor.Decode(&document); err != nil {
			return err
		}
		backupID := collectionName + ":" + fmt.Sprint(document["_id"])
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": backupID}).SetUpdate(bson.M{"$setOnInsert": bson.M{"sourceCollection": collectionName, "sourceId": document["_id"], "document": document, "backedUpAt": time.Now()}}).SetUpsert(true))
	}
	if err := cursor.Err(); err != nil {
		return err
	}
	if len(writes) == 0 {
		return nil
	}
	_, err = database.Collection("multi_account_migration_backup").BulkWrite(ctx, writes, options.BulkWrite().SetOrdered(false))
	return err
}

// syncXianyuListings 在服务启动时异步同步当前闲鱼在售商品。
func syncXianyuListings(runtimeContext context.Context, marketplaceService *marketplace.Service, accountRepository *repository.XianyuAccountRepository) {
	syncContext, cancel := context.WithTimeout(runtimeContext, 90*time.Second)
	defer cancel()
	accounts, err := accountRepository.List(syncContext)
	if err != nil {
		logx.Errorf("startup xianyu account list failed: %v", err)
		return
	}
	for _, account := range accounts {
		if account.Status != model.XianyuAccountActive || !account.SellerConnected {
			continue
		}
		listingCount, syncErr := marketplaceService.SyncXianyu(syncContext, account.ID)
		if syncErr != nil {
			logx.Errorf("startup xianyu listing sync skipped for account %s: %v", account.ID, syncErr)
			continue
		}
		logx.Infof("startup xianyu listing sync completed for account %s: %d active listings", account.ID, listingCount)
	}
}

// Close 释放浏览器和数据库连接。
func (serviceContext *ServiceContext) Close() {
	serviceContext.runtimeCancel()

	disconnectContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = serviceContext.MongoClient.Disconnect(disconnectContext)
	_ = serviceContext.RedisClient.Close()
}
