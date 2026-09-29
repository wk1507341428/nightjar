package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/zeromicro/go-zero/rest"
)

// Config 是 SideJob API 的完整运行配置。
type Config struct {
	rest.RestConf
	Mongo   MongoConfig
	Redis   RedisConfig
	Xianyu  XianyuConfig
	Catalog CatalogConfig
	Web     WebConfig
}

// RedisConfig 定义商详状态缓存连接。
type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

// MongoConfig 定义 MongoDB 连接信息。
type MongoConfig struct {
	URI      string
	Database string
}

// XianyuConfig 定义闲鱼 MTop API 和会话加密配置。
type XianyuConfig struct {
	APIBase        string
	UploadURL      string
	AppKey         string
	SessionKeyPath string
	RequestTimeout int
}

// CatalogConfig 定义奥莱商品接口配置。
type CatalogConfig struct {
	APIBase         string
	CompanyID       string
	AuthorizerAppID string
	RequestTimeout  int
}

// WebConfig 定义允许访问本地 API 的前端来源。
type WebConfig struct {
	AllowedOrigins []string
}

// ApplyEnvironment 使用容器环境变量覆盖本地 YAML 默认值。
func (serviceConfig *Config) ApplyEnvironment() error {
	if host := os.Getenv("SIDEJOB_HOST"); host != "" {
		serviceConfig.Host = host
	}
	if portText := os.Getenv("SIDEJOB_PORT"); portText != "" {
		port, err := strconv.Atoi(portText)
		if err != nil {
			return fmt.Errorf("invalid SIDEJOB_PORT: %w", err)
		}
		serviceConfig.Port = port
	}
	if mongoURI := os.Getenv("SIDEJOB_MONGO_URI"); mongoURI != "" {
		serviceConfig.Mongo.URI = mongoURI
	}
	if mongoDatabase := os.Getenv("SIDEJOB_MONGO_DATABASE"); mongoDatabase != "" {
		serviceConfig.Mongo.Database = mongoDatabase
	}
	if redisAddr := os.Getenv("SIDEJOB_REDIS_ADDR"); redisAddr != "" {
		serviceConfig.Redis.Addr = redisAddr
	}
	if redisPassword := os.Getenv("SIDEJOB_REDIS_PASSWORD"); redisPassword != "" {
		serviceConfig.Redis.Password = redisPassword
	}
	if sessionKeyPath := os.Getenv("SIDEJOB_SESSION_KEY_PATH"); sessionKeyPath != "" {
		serviceConfig.Xianyu.SessionKeyPath = sessionKeyPath
	}
	if catalogAPIBase := os.Getenv("SIDEJOB_CATALOG_API_BASE"); catalogAPIBase != "" {
		serviceConfig.Catalog.APIBase = catalogAPIBase
	}
	if allowedOrigins := os.Getenv("SIDEJOB_ALLOWED_ORIGINS"); allowedOrigins != "" {
		serviceConfig.Web.AllowedOrigins = splitNonEmpty(allowedOrigins)
	}
	return nil
}

// splitNonEmpty 拆分逗号分隔配置并过滤空值。
func splitNonEmpty(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmedPart := strings.TrimSpace(part)
		if trimmedPart != "" {
			result = append(result, trimmedPart)
		}
	}
	return result
}
