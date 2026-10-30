// backfill-source-metadata only creates local source metadata; it never starts publishing workers.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/zeromicro/go-zero/core/conf"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"sidejob-server/internal/catalog"
	"sidejob-server/internal/config"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "元数据回填失败：", err)
		os.Exit(1)
	}
}
func run() error {
	path := flag.String("f", "etc/sidejob-api.yaml", "配置文件")
	discover := flag.Bool("discover-stores", false, "显式读取品牌门店目录补全logo，不读取商品/SKU")
	flag.Parse()
	var cfg config.Config
	if err := conf.Load(*path, &cfg); err != nil {
		return err
	}
	if err := cfg.ApplyEnvironment(); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Minute)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.Mongo.URI))
	if err != nil {
		return fmt.Errorf("连接本地MongoDB失败")
	}
	defer client.Disconnect(context.Background())
	db := client.Database(cfg.Mongo.Database)
	source := catalog.NewService(cfg.Catalog, catalog.NewInventoryRepository(db), nil)
	center := catalog.NewSyncCenter(db, source)
	var results []catalog.SyncCenterMetadataBackfillResult
	if *discover {
		results, err = center.BackfillMetadataWithDiscovery(ctx)
	} else {
		results, err = center.BackfillMetadata(ctx)
	}
	if err != nil {
		return err
	}
	if err = json.NewEncoder(os.Stdout).Encode(results); err != nil {
		return err
	}
	for _, result := range results {
		if result.Error != "" {
			return fmt.Errorf("一个或多个品牌回填失败，旧完整数据保留；详见JSON摘要")
		}
	}
	return nil
}
