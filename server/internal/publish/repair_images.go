package publish

import (
	"context"
	"net/http"
	"time"
)

// DownloadRepairImages 复用发布图片的真实格式、大小及公网地址校验，不创建任务或启动队列。
func DownloadRepairImages(ctx context.Context, urls []string) (string, []string, error) {
	service := &Service{httpClient: &http.Client{Timeout: 30 * time.Second, CheckRedirect: func(r *http.Request, _ []*http.Request) error { return validatePublicImageURL(r.URL.String()) }}}
	return service.downloadImages(ctx, urls)
}
