package main

import (
	"flag"
	"fmt"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest"

	"sidejob-server/internal/config"
	"sidejob-server/internal/handler"
	"sidejob-server/internal/svc"
)

var configFile = flag.String("f", "etc/sidejob-api.yaml", "配置文件路径")

func main() {
	flag.Parse()

	var serviceConfig config.Config
	conf.MustLoad(*configFile, &serviceConfig)
	if err := serviceConfig.ApplyEnvironment(); err != nil {
		logx.Must(err)
	}

	serviceContext, err := svc.NewServiceContext(serviceConfig)
	logx.Must(err)
	defer serviceContext.Close()

	server := rest.MustNewServer(
		serviceConfig.RestConf,
		rest.WithCors(serviceConfig.Web.AllowedOrigins...),
	)
	defer server.Stop()

	handler.RegisterHandlers(server, serviceContext)

	fmt.Printf("SideJob API listening on %s:%d\n", serviceConfig.Host, serviceConfig.Port)
	server.Start()
}
