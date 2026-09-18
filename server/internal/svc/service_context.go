package svc

import (
	"context"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/pinduoduo"
	"sidejob-server/internal/pricecompare"
	"sidejob-server/internal/publish"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/xianyu"
)

// ServiceContext 汇总 API 服务的共享依赖。
type ServiceContext struct {
	Config              config.Config
	MongoClient         *mongo.Client
	PublishRepository   *repository.PublishTaskRepository
	SessionRepository   *repository.SessionRepository
	PinduoduoRepository *repository.PinduoduoSessionRepository
	ListingRepository   *repository.MarketplaceListingRepository
	XianyuService       *xianyu.Service
	PinduoduoService    *pinduoduo.Service
	PublishService      *publish.Service
	CatalogService      *catalog.Service
	MarketplaceService  *marketplace.Service
	PriceCompareService *pricecompare.Service
	runtimeCancel       context.CancelFunc
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

	publishRepository := repository.NewPublishTaskRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := publishRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure publish task indexes: %w", err)
	}
	listingRepository := repository.NewMarketplaceListingRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	if err := listingRepository.EnsureIndexes(databaseContext); err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("ensure marketplace listing indexes: %w", err)
	}

	sessionRepository := repository.NewSessionRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	pinduoduoRepository := repository.NewPinduoduoSessionRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	sessionCipher, err := security.NewCipherFromFile(serviceConfig.Xianyu.SessionKeyPath)
	if err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("initialize session cipher: %w", err)
	}
	xianyuService := xianyu.NewService(serviceConfig.Xianyu, sessionRepository, sessionCipher)
	pinduoduoService := pinduoduo.NewService(pinduoduoRepository, sessionCipher)
	catalogService := catalog.NewService(serviceConfig.Catalog)
	marketplaceService := marketplace.NewService(listingRepository, publishRepository, xianyuService)
	priceCompareService := pricecompare.NewService(xianyuService, pinduoduoService)

	runtimeContext, runtimeCancel := context.WithCancel(context.Background())
	publishService := publish.NewService(runtimeContext, publishRepository, xianyuService, marketplaceService)
	go syncXianyuListings(runtimeContext, marketplaceService)

	return &ServiceContext{
		Config:              serviceConfig,
		MongoClient:         mongoClient,
		PublishRepository:   publishRepository,
		SessionRepository:   sessionRepository,
		PinduoduoRepository: pinduoduoRepository,
		ListingRepository:   listingRepository,
		XianyuService:       xianyuService,
		PinduoduoService:    pinduoduoService,
		PublishService:      publishService,
		CatalogService:      catalogService,
		MarketplaceService:  marketplaceService,
		PriceCompareService: priceCompareService,
		runtimeCancel:       runtimeCancel,
	}, nil
}

// syncXianyuListings 在服务启动时异步同步当前闲鱼在售商品。
func syncXianyuListings(runtimeContext context.Context, marketplaceService *marketplace.Service) {
	syncContext, cancel := context.WithTimeout(runtimeContext, 90*time.Second)
	defer cancel()

	listingCount, err := marketplaceService.SyncXianyu(syncContext)
	if err != nil {
		logx.Errorf("startup xianyu listing sync skipped: %v", err)
		return
	}
	logx.Infof("startup xianyu listing sync completed: %d active listings", listingCount)
}

// Close 释放浏览器和数据库连接。
func (serviceContext *ServiceContext) Close() {
	serviceContext.runtimeCancel()

	disconnectContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = serviceContext.MongoClient.Disconnect(disconnectContext)
}
