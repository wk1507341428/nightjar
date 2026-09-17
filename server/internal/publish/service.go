package publish

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/xianyu"
)

const (
	maxImageCount = 9
	maxImageBytes = 15 << 20
)

// Service 串行消费闲鱼发布任务，避免账号接口并发触发风控。
type Service struct {
	repository    *repository.PublishTaskRepository
	xianyuService *xianyu.Service
	marketplace   *marketplace.Service
	httpClient    *http.Client
	queue         chan string
}

// NewService 创建发布任务服务并启动单消费者 Worker。
func NewService(
	runtimeContext context.Context,
	taskRepository *repository.PublishTaskRepository,
	xianyuService *xianyu.Service,
	marketplaceService *marketplace.Service,
) *Service {
	service := &Service{
		repository:    taskRepository,
		xianyuService: xianyuService,
		marketplace:   marketplaceService,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(request *http.Request, _ []*http.Request) error {
				return validatePublicImageURL(request.URL.String())
			},
		},
		queue: make(chan string, 100),
	}
	go service.run(runtimeContext)
	return service
}

// Enqueue 将已持久化的任务加入发布队列。
func (service *Service) Enqueue(taskID string) error {
	select {
	case service.queue <- taskID:
		return nil
	default:
		return errors.New("publish queue is full")
	}
}

// run 串行处理队列中的发布任务。
func (service *Service) run(runtimeContext context.Context) {
	for {
		select {
		case <-runtimeContext.Done():
			return
		case taskID := <-service.queue:
			service.processTask(runtimeContext, taskID)
		}
	}
}

// processTask 完成图片暂存、表单填写和结果持久化。
func (service *Service) processTask(runtimeContext context.Context, taskID string) {
	task, err := service.repository.Get(runtimeContext, taskID)
	if err != nil {
		logx.Errorf("load publish task %s: %v", taskID, err)
		return
	}

	if err := service.repository.UpdateStatus(runtimeContext, taskID, model.PublishTaskPreparing, "", "", ""); err != nil {
		logx.Errorf("mark publish task %s preparing: %v", taskID, err)
		return
	}

	temporaryDirectory, imagePaths, err := service.downloadImages(runtimeContext, task.ImageURLs)
	if temporaryDirectory != "" {
		defer os.RemoveAll(temporaryDirectory)
	}
	if err != nil {
		service.failTask(runtimeContext, taskID, fmt.Sprintf("准备商品图片失败：%v", err))
		return
	}

	if err := service.repository.UpdateStatus(runtimeContext, taskID, model.PublishTaskPublishing, "", "", ""); err != nil {
		logx.Errorf("mark publish task %s publishing: %v", taskID, err)
		return
	}

	publishResult, err := service.xianyuService.Publish(runtimeContext, xianyu.PublishInput{
		Title:              task.Title,
		Description:        task.Description,
		PriceCents:         task.PriceCents,
		OriginalPriceCents: task.OriginalPriceCents,
		ImagePaths:         imagePaths,
		RegionID:           task.RegionID,
		Brand:              task.Brand,
		Condition:          task.Condition,
		AvailableSizes:     task.AvailableSizes,
		IsFootwear:         task.IsFootwear,
	})
	if err != nil {
		if errors.Is(err, xianyu.ErrSessionExpired) {
			_ = service.repository.UpdateStatus(runtimeContext, taskID, model.PublishTaskNeedsLogin, err.Error(), "", "")
			return
		}
		service.failTask(runtimeContext, taskID, fmt.Sprintf("闲鱼发布失败：%v", err))
		return
	}

	if err := service.repository.UpdateStatus(
		runtimeContext,
		taskID,
		model.PublishTaskSucceeded,
		"",
		publishResult.ItemID,
		publishResult.URL,
	); err != nil {
		logx.Errorf("save publish task %s result: %v", taskID, err)
	}
	if err := service.marketplace.MarkXianyuPublished(runtimeContext, task, publishResult); err != nil {
		logx.Errorf("mark xianyu listing %s: %v", publishResult.ItemID, err)
	}
}

// failTask 将任务标记为失败并保留用户可读原因。
func (service *Service) failTask(runtimeContext context.Context, taskID string, errorMessage string) {
	if err := service.repository.UpdateStatus(runtimeContext, taskID, model.PublishTaskFailed, errorMessage, "", ""); err != nil {
		logx.Errorf("mark publish task %s failed: %v", taskID, err)
	}
}

// downloadImages 将远程商品图下载到单次任务临时目录。
func (service *Service) downloadImages(ctx context.Context, imageURLs []string) (string, []string, error) {
	if len(imageURLs) == 0 {
		return "", nil, errors.New("至少需要一张商品图片")
	}
	if len(imageURLs) > maxImageCount {
		imageURLs = imageURLs[:maxImageCount]
	}

	temporaryDirectory, err := os.MkdirTemp("", "sidejob-publish-*")
	if err != nil {
		return "", nil, err
	}

	imagePaths := make([]string, 0, len(imageURLs))
	for imageIndex, imageURL := range imageURLs {
		imagePath, downloadErr := service.downloadImage(ctx, temporaryDirectory, imageIndex, imageURL)
		if downloadErr != nil {
			return temporaryDirectory, nil, downloadErr
		}
		imagePaths = append(imagePaths, imagePath)
	}
	return temporaryDirectory, imagePaths, nil
}

// downloadImage 安全下载单张公网图片并限制响应体大小。
func (service *Service) downloadImage(
	ctx context.Context,
	temporaryDirectory string,
	imageIndex int,
	imageURL string,
) (string, error) {
	if err := validatePublicImageURL(imageURL); err != nil {
		return "", err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, imageURL, nil)
	if err != nil {
		return "", err
	}
	request.Header.Set("User-Agent", "Mozilla/5.0 SideJob/1.0")

	response, err := service.httpClient.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return "", fmt.Errorf("图片接口返回 HTTP %d", response.StatusCode)
	}

	contentType := response.Header.Get("Content-Type")
	if contentType != "" && !strings.HasPrefix(strings.ToLower(contentType), "image/") {
		return "", errors.New("商品图片接口没有返回图片内容")
	}
	extension := imageExtension(contentType, imageURL)
	imagePath := filepath.Join(temporaryDirectory, fmt.Sprintf("image-%02d%s", imageIndex+1, extension))
	imageFile, err := os.OpenFile(imagePath, os.O_CREATE|os.O_WRONLY|os.O_EXCL, 0o600)
	if err != nil {
		return "", err
	}
	defer imageFile.Close()

	writtenBytes, err := io.Copy(imageFile, io.LimitReader(response.Body, maxImageBytes+1))
	if err != nil {
		return "", err
	}
	if writtenBytes > maxImageBytes {
		return "", errors.New("单张商品图片不能超过 15MB")
	}
	return imagePath, nil
}

// validatePublicImageURL 拒绝本地地址，避免远程图片字段被用于 SSRF。
func validatePublicImageURL(imageURL string) error {
	parsedURL, err := url.Parse(imageURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") || parsedURL.Hostname() == "" {
		return errors.New("商品图片地址无效")
	}

	ipAddresses, err := net.LookupIP(parsedURL.Hostname())
	if err != nil {
		return fmt.Errorf("解析图片域名失败：%w", err)
	}
	for _, ipAddress := range ipAddresses {
		if ipAddress.IsLoopback() || ipAddress.IsPrivate() || ipAddress.IsLinkLocalUnicast() || ipAddress.IsUnspecified() {
			return errors.New("商品图片地址不能指向本地网络")
		}
	}
	return nil
}

// imageExtension 根据响应类型和地址生成安全扩展名。
func imageExtension(contentType string, imageURL string) string {
	lowerContentType := strings.ToLower(contentType)
	if strings.Contains(lowerContentType, "png") {
		return ".png"
	}
	if strings.Contains(lowerContentType, "webp") {
		return ".webp"
	}
	if strings.Contains(lowerContentType, "heic") {
		return ".heic"
	}
	if strings.Contains(lowerContentType, "jpeg") || strings.Contains(lowerContentType, "jpg") {
		return ".jpg"
	}

	parsedURL, _ := url.Parse(imageURL)
	extension := strings.ToLower(filepath.Ext(parsedURL.Path))
	switch extension {
	case ".png", ".webp", ".heic", ".jpeg", ".jpg":
		return extension
	default:
		return ".jpg"
	}
}
