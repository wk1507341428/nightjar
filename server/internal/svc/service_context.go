package svc

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"sidejob-server/internal/config"
	"sidejob-server/internal/publish"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
	"sidejob-server/internal/xianyu"
)

// ServiceContext 汇总 API 服务的共享依赖。
type ServiceContext struct {
	Config            config.Config
	MongoClient       *mongo.Client
	PublishRepository *repository.PublishTaskRepository
	SessionRepository *repository.SessionRepository
	XianyuService     *xianyu.Service
	PublishService    *publish.Service
	runtimeCancel     context.CancelFunc
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

	sessionRepository := repository.NewSessionRepository(mongoClient.Database(serviceConfig.Mongo.Database))
	sessionCipher, err := security.NewCipherFromFile(serviceConfig.Xianyu.SessionKeyPath)
	if err != nil {
		_ = mongoClient.Disconnect(context.Background())
		return nil, fmt.Errorf("initialize session cipher: %w", err)
	}
	xianyuService := xianyu.NewService(serviceConfig.Xianyu, sessionRepository, sessionCipher)

	runtimeContext, runtimeCancel := context.WithCancel(context.Background())
	publishService := publish.NewService(runtimeContext, publishRepository, xianyuService)

	return &ServiceContext{
		Config:            serviceConfig,
		MongoClient:       mongoClient,
		PublishRepository: publishRepository,
		SessionRepository: sessionRepository,
		XianyuService:     xianyuService,
		PublishService:    publishService,
		runtimeCancel:     runtimeCancel,
	}, nil
}

// Close 释放浏览器和数据库连接。
func (serviceContext *ServiceContext) Close() {
	serviceContext.runtimeCancel()

	disconnectContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = serviceContext.MongoClient.Disconnect(disconnectContext)
}
