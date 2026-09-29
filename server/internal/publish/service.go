package publish

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/zeromicro/go-zero/core/logx"

	"sidejob-server/internal/marketplace"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/xianyu"
)

const (
	maxImageCount                 = 9
	maxImageBytes                 = 10 << 20
	defaultMinPublishDelaySeconds = 1
	defaultMaxPublishDelaySeconds = 2
	publishQueueCapacity          = 3000
	publishRecoveryLimit          = 3000
	maxConcurrentAccounts         = 2
)

// Service 串行消费闲鱼发布任务，避免账号接口并发触发风控。
type Service struct {
	PrepareRetry        func(context.Context, model.PublishTask) (model.PublishTask, error)
	PrepareOfflineBatch func(context.Context, []model.PublishTask) map[string]error
	RefreshReconcile    func(context.Context, model.PublishTask) (model.PublishTask, error)
	repository          *repository.PublishTaskRepository
	accountRepository   *repository.XianyuAccountRepository
	xianyuService       *xianyu.Service
	marketplace         *marketplace.Service
	httpClient          *http.Client
	queue               chan string
	accountQueues       map[string]chan string
	accountQueueMutex   sync.Mutex
	globalSlots         chan struct{}
	startOnce           sync.Once
	runtimeContext      context.Context
}

// NewService 创建发布任务服务并恢复排队记录，依赖就绪后由 Start 启动消费。
func NewService(
	runtimeContext context.Context,
	taskRepository *repository.PublishTaskRepository,
	accountRepository *repository.XianyuAccountRepository,
	xianyuService *xianyu.Service,
	marketplaceService *marketplace.Service,
) *Service {
	service := &Service{
		runtimeContext:    runtimeContext,
		repository:        taskRepository,
		accountRepository: accountRepository,
		xianyuService:     xianyuService,
		marketplace:       marketplaceService,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(request *http.Request, _ []*http.Request) error {
				return validatePublicImageURL(request.URL.String())
			},
		},
		queue:         make(chan string, publishQueueCapacity),
		accountQueues: make(map[string]chan string),
		globalSlots:   make(chan struct{}, maxConcurrentAccounts),
	}
	service.restoreQueue(runtimeContext)
	return service
}

// Start 在处理依赖完成注册后才启动消费，避免恢复任务早于对账回调就绪。
func (service *Service) Start() {
	service.startOnce.Do(func() { go service.run(service.runtimeContext) })
}

// restoreQueue 恢复服务重启前尚未开始的排队任务。
func (service *Service) restoreQueue(runtimeContext context.Context) {
	if err := service.repository.FailInterruptedTasks(runtimeContext); err != nil {
		logx.Errorf("mark interrupted publish tasks failed: %v", err)
	}
	tasks, err := service.repository.ListQueued(runtimeContext, publishRecoveryLimit)
	if err != nil {
		logx.Errorf("load queued publish tasks: %v", err)
		return
	}
	for _, task := range tasks {
		if err := service.Enqueue(task.ID); err != nil {
			logx.Errorf("restore publish task %s: %v", task.ID, err)
			return
		}
	}
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

// run 把任务分发给对应账号的串行 worker。
func (service *Service) run(runtimeContext context.Context) {
	for {
		select {
		case <-runtimeContext.Done():
			return
		case taskID := <-service.queue:
			task, err := service.repository.Get(runtimeContext, taskID)
			if err != nil {
				logx.Errorf("load publish task %s: %v", taskID, err)
				continue
			}
			accountID := task.AccountID
			if accountID == "" {
				accountID = model.DefaultXianyuAccountID
			}
			select {
			case service.queueForAccount(runtimeContext, accountID) <- taskID:
			case <-runtimeContext.Done():
				return
			}
		}
	}
}

// queueForAccount 返回账号独立的串行任务通道。
func (service *Service) queueForAccount(runtimeContext context.Context, accountID string) chan string {
	service.accountQueueMutex.Lock()
	defer service.accountQueueMutex.Unlock()
	accountQueue := service.accountQueues[accountID]
	if accountQueue == nil {
		accountQueue = make(chan string, publishQueueCapacity)
		service.accountQueues[accountID] = accountQueue
		go service.runAccount(runtimeContext, accountID, accountQueue)
	}
	return accountQueue
}

// runAccount 串行执行一个账号的任务，不阻塞其他账号。
func (service *Service) runAccount(runtimeContext context.Context, accountID string, accountQueue <-chan string) {
	// 暂存被批量收集器提前读出的非下架任务，保持原队列顺序。
	pendingTasks := make([]model.PublishTask, 0)
	for {
		var task model.PublishTask
		if len(pendingTasks) > 0 {
			task = pendingTasks[0]
			pendingTasks = pendingTasks[1:]
		} else {
			select {
			case <-runtimeContext.Done():
				return
			case taskID := <-accountQueue:
				loadedTask, err := service.repository.Get(runtimeContext, taskID)
				if err != nil {
					logx.Errorf("load publish task %s: %v", taskID, err)
					continue
				}
				task = loadedTask
			}
		}
		if !service.waitForAccount(runtimeContext, accountID) {
			return
		}

		// 扫描当前账号队列，把下架任务集中出来，修改任务暂存到队列头部。
		offlineTasks := make([]model.PublishTask, 0, 100)
		nonOfflineTasks := make([]model.PublishTask, 0)
		if task.Action == "offline" {
			offlineTasks = append(offlineTasks, task)
		} else {
			nonOfflineTasks = append(nonOfflineTasks, task)
		}
		for scannedCount := 0; scannedCount < publishQueueCapacity && len(offlineTasks) < 100; scannedCount++ {
			select {
			case nextTaskID := <-accountQueue:
				nextTask, nextErr := service.repository.Get(runtimeContext, nextTaskID)
				if nextErr != nil {
					continue
				}
				if nextTask.Action == "offline" {
					offlineTasks = append(offlineTasks, nextTask)
				} else {
					nonOfflineTasks = append(nonOfflineTasks, nextTask)
				}
			default:
				goto accountQueueScanned
			}
		}
	accountQueueScanned:
		if len(offlineTasks) > 0 {
			pendingTasks = append(nonOfflineTasks, pendingTasks...)
			select {
			case service.globalSlots <- struct{}{}:
				service.processOfflineBatch(runtimeContext, offlineTasks)
				<-service.globalSlots
			case <-runtimeContext.Done():
				return
			}
			if !waitForNextPublish(runtimeContext, offlineTasks[0].MinDelaySeconds, offlineTasks[0].MaxDelaySeconds) {
				return
			}
			continue
		}
		if len(nonOfflineTasks) > 1 {
			pendingTasks = append(nonOfflineTasks[1:], pendingTasks...)
		}

		select {
		case service.globalSlots <- struct{}{}:
			service.processTask(runtimeContext, task)
			<-service.globalSlots
		case <-runtimeContext.Done():
			return
		}
		if !waitForNextPublish(runtimeContext, task.MinDelaySeconds, task.MaxDelaySeconds) {
			return
		}
	}
}

// processOfflineBatch 使用闲鱼批量下架接口处理一组连续的下架任务。
func (service *Service) processOfflineBatch(runtimeContext context.Context, tasks []model.PublishTask) {
	if len(tasks) == 0 {
		return
	}
	itemIDs := make([]string, 0, len(tasks))
	tasksByItemID := make(map[string]model.PublishTask, len(tasks))
	for _, task := range tasks {
		_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskPublishing, "", "", "")
		itemIDs = append(itemIDs, task.XianyuItemID)
		tasksByItemID[task.XianyuItemID] = task
	}
	accountID := tasks[0].AccountID
	hasRetryRequested := false
	for _, task := range tasks {
		if task.RetryRequested {
			hasRetryRequested = true
			break
		}
	}
	if hasRetryRequested && service.PrepareOfflineBatch != nil {
		checkResults := service.PrepareOfflineBatch(runtimeContext, tasks)
		eligibleTasks := make([]model.PublishTask, 0, len(tasks))
		for _, task := range tasks {
			if !task.RetryRequested {
				eligibleTasks = append(eligibleTasks, task)
				continue
			}
			if checkErr := checkResults[task.ID]; checkErr != nil {
				_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskFailed, checkErr.Error(), "", "")
				continue
			}
			_ = service.repository.FinishRetryPreparation(runtimeContext, task)
			eligibleTasks = append(eligibleTasks, task)
		}
		tasks = eligibleTasks
		if len(tasks) == 0 {
			return
		}
		itemIDs = itemIDs[:0]
		tasksByItemID = make(map[string]model.PublishTask, len(tasks))
		for _, task := range tasks {
			itemIDs = append(itemIDs, task.XianyuItemID)
			tasksByItemID[task.XianyuItemID] = task
		}
	}
	result, err := service.marketplace.OfflineXianyuListings(runtimeContext, accountID, itemIDs)
	if err != nil {
		if errors.Is(err, xianyu.ErrSessionExpired) {
			if account, accountErr := service.accountRepository.Get(runtimeContext, accountID); accountErr == nil {
				_ = service.accountRepository.UpdateConnection(runtimeContext, accountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
			}
			_ = service.accountRepository.Update(runtimeContext, accountID, "", model.XianyuAccountPaused)
			for _, task := range tasks {
				_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskNeedsLogin, "闲鱼登录已失效，请重新连接该账号", "", "")
			}
			return
		}
		for _, task := range tasks {
			_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskFailed, err.Error(), "", "")
		}
		return
	}
	succeeded := make(map[string]struct{}, len(result.SucceededItemIDs))
	for _, itemID := range result.SucceededItemIDs {
		succeeded[itemID] = struct{}{}
	}
	failed := make(map[string]struct{}, len(result.FailedItemIDs))
	for _, itemID := range result.FailedItemIDs {
		failed[itemID] = struct{}{}
	}
	for itemID, task := range tasksByItemID {
		if _, ok := succeeded[itemID]; ok {
			_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskSucceeded, "", task.XianyuItemID, task.XianyuURL)
			continue
		}
		if _, ok := failed[itemID]; ok {
			_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskFailed, "闲鱼批量下架失败", "", "")
			continue
		}
		_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskFailed, "闲鱼未返回下架结果", "", "")
	}
}

// waitForAccount 在账号暂停时保留队首任务，恢复后继续执行。
func (service *Service) waitForAccount(runtimeContext context.Context, accountID string) bool {
	for {
		account, err := service.accountRepository.Get(runtimeContext, accountID)
		if err != nil || account.Status == model.XianyuAccountDisabled {
			return true
		}
		if account.Status == model.XianyuAccountActive {
			return true
		}
		timer := time.NewTimer(2 * time.Second)
		select {
		case <-runtimeContext.Done():
			timer.Stop()
			return false
		case <-timer.C:
		}
	}
}

// waitForNextPublish 在任务之间随机冷却，降低连续发布触发风控的概率。
func waitForNextPublish(runtimeContext context.Context, minDelaySeconds, maxDelaySeconds int) bool {
	delay := nextPublishDelay(minDelaySeconds, maxDelaySeconds)
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-runtimeContext.Done():
		return false
	case <-timer.C:
		return true
	}
}

// nextPublishDelay 返回任务之间的随机安全间隔。
func nextPublishDelay(minDelaySeconds, maxDelaySeconds int) time.Duration {
	if minDelaySeconds <= 0 {
		minDelaySeconds = defaultMinPublishDelaySeconds
	}
	if maxDelaySeconds < minDelaySeconds {
		maxDelaySeconds = max(minDelaySeconds, defaultMaxPublishDelaySeconds)
	}
	minDelay := time.Duration(minDelaySeconds) * time.Second
	maxDelay := time.Duration(maxDelaySeconds) * time.Second
	delayRange := maxDelay - minDelay
	return minDelay + time.Duration(rand.Int63n(int64(delayRange)+1))
}

// processTask 完成图片暂存、表单填写和结果持久化。
func (service *Service) processTask(runtimeContext context.Context, task model.PublishTask) {
	// 取消、成功或失败任务即使残留在内存队列中，也不能再次执行。
	if task.Status != model.PublishTaskQueued && task.Status != model.PublishTaskPreparing && task.Status != model.PublishTaskPublishing {
		return
	}
	if task.AccountID == "" {
		task.AccountID = model.DefaultXianyuAccountID
	}
	account, accountErr := service.accountRepository.Get(runtimeContext, task.AccountID)
	if accountErr != nil || account.Status == model.XianyuAccountDisabled {
		service.failTask(runtimeContext, task.ID, "闲鱼账号不可用")
		return
	}
	if task.RetryRequested {
		if service.PrepareRetry == nil {
			service.failTask(runtimeContext, task.ID, "重试服务未就绪")
			return
		}
		_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskPreparing, "", "", "")
		prepared, err := service.PrepareRetry(runtimeContext, task)
		if err != nil {
			service.failTask(runtimeContext, task.ID, err.Error())
			return
		}
		task = prepared
		if err = service.repository.UpdateContent(runtimeContext, task); err == nil {
			err = service.repository.FinishRetryPreparation(runtimeContext, task)
		}
		if err != nil {
			service.failTask(runtimeContext, task.ID, err.Error())
			return
		}
	}
	if task.Action == "update" || task.Action == "offline" {
		service.processReconcileTask(runtimeContext, task)
		return
	}
	if task.Action == "relist" {
		if service.RefreshReconcile == nil {
			service.failTask(runtimeContext, task.ID, "恢复前商详核对服务未就绪")
			return
		}
		refreshedTask, refreshErr := service.RefreshReconcile(runtimeContext, task)
		if refreshErr != nil {
			service.failTask(runtimeContext, task.ID, refreshErr.Error())
			return
		}
		task = refreshedTask
		if err := service.repository.UpdateContent(runtimeContext, task); err != nil {
			service.failTask(runtimeContext, task.ID, err.Error())
			return
		}
	}
	if err := service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskPreparing, "", "", ""); err != nil {
		logx.Errorf("mark publish task %s preparing: %v", task.ID, err)
		return
	}

	temporaryDirectory, imagePaths, err := service.downloadImages(runtimeContext, task.ImageURLs)
	if temporaryDirectory != "" {
		defer os.RemoveAll(temporaryDirectory)
	}
	if err != nil {
		service.failTask(runtimeContext, task.ID, fmt.Sprintf("准备商品图片失败：%v", err))
		return
	}

	if err := service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskPublishing, "", "", ""); err != nil {
		logx.Errorf("mark publish task %s publishing: %v", task.ID, err)
		return
	}
	if task.Action == "relist" {
		input := xianyu.PublishInput{Quantity: task.Quantity, Title: task.Title, Description: task.Description, PriceCents: task.PriceCents, OriginalPriceCents: task.OriginalPriceCents, ImagePaths: imagePaths, RegionID: task.RegionID, Brand: task.Brand, Condition: task.Condition, AvailableSizes: task.AvailableSizes, Variants: xianyuPublishVariants(task.Variants), IsFootwear: task.IsFootwear}
		if err := service.xianyuService.ForAccount(task.AccountID).ReactivateManagedItem(runtimeContext, task.XianyuItemID, input, task.Before); err != nil {
			if errors.Is(err, xianyu.ErrSessionExpired) {
				_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskNeedsLogin, "闲鱼登录已失效，请重新连接该账号", "", "")
				_ = service.accountRepository.UpdateConnection(runtimeContext, task.AccountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
				_ = service.accountRepository.Update(runtimeContext, task.AccountID, "", model.XianyuAccountPaused)
				return
			}
			service.failTask(runtimeContext, task.ID, "恢复历史商品失败："+err.Error())
			return
		}
		if err := service.marketplace.DeleteXianyuHistory(runtimeContext, task.AccountID, task.DuplicateXianyuItemIDs); err != nil {
			service.failTask(runtimeContext, task.ID, "历史商品已恢复，但清理重复商品失败："+err.Error())
			return
		}
		if err := service.marketplace.MarkXianyuPublished(runtimeContext, task, xianyu.PublishResult{ItemID: task.XianyuItemID, URL: task.XianyuURL}); err != nil {
			logx.Errorf("mark relisted xianyu item %s: %v", task.XianyuItemID, err)
		}
		_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskSucceeded, "", task.XianyuItemID, task.XianyuURL)
		return
	}

	publishResult, err := service.xianyuService.ForAccount(task.AccountID).Publish(runtimeContext, xianyu.PublishInput{
		Title:              task.Title,
		Description:        task.Description,
		PriceCents:         task.PriceCents,
		OriginalPriceCents: task.OriginalPriceCents,
		ImagePaths:         imagePaths,
		RegionID:           task.RegionID,
		Brand:              task.Brand,
		Condition:          task.Condition,
		AvailableSizes:     task.AvailableSizes,
		Variants:           xianyuPublishVariants(task.Variants),
		IsFootwear:         task.IsFootwear,
	})
	if err != nil {
		if errors.Is(err, xianyu.ErrSessionExpired) {
			_ = service.repository.UpdateStatus(runtimeContext, task.ID, model.PublishTaskNeedsLogin, "闲鱼登录已失效，请重新连接该账号", "", "")
			_ = service.accountRepository.UpdateConnection(runtimeContext, task.AccountID, "seller", account.DisplayName, account.PlatformUserID, false, false)
			_ = service.accountRepository.Update(runtimeContext, task.AccountID, "", model.XianyuAccountPaused)
			return
		}
		service.failTask(runtimeContext, task.ID, fmt.Sprintf("闲鱼发布失败：%v", err))
		return
	}

	if err := service.repository.UpdateStatus(
		runtimeContext,
		task.ID,
		model.PublishTaskSucceeded,
		"",
		publishResult.ItemID,
		publishResult.URL,
	); err != nil {
		logx.Errorf("save publish task %s result: %v", task.ID, err)
	}
	if err := service.marketplace.MarkXianyuPublished(runtimeContext, task, publishResult); err != nil {
		logx.Errorf("mark xianyu listing %s: %v", publishResult.ItemID, err)
	}
}

// xianyuPublishVariants 将持久化规格转换为闲鱼发布接口参数。
func xianyuPublishVariants(variants []model.PublishVariant) []xianyu.PublishVariant {
	result := make([]xianyu.PublishVariant, 0, len(variants))
	for _, variant := range variants {
		properties := make([]xianyu.PublishVariantProperty, 0, len(variant.Properties))
		for _, property := range variant.Properties {
			properties = append(properties, xianyu.PublishVariantProperty{Name: property.Name, Value: property.Value})
		}
		result = append(result, xianyu.PublishVariant{PriceCents: variant.PriceCents, Quantity: variant.Quantity, Properties: properties})
	}
	return result
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
	var lastDownloadError error
	for imageIndex, imageURL := range imageURLs {
		imagePath, downloadErr := service.downloadImage(ctx, temporaryDirectory, imageIndex, imageURL)
		if downloadErr != nil {
			lastDownloadError = downloadErr
			continue
		}
		imagePaths = append(imagePaths, imagePath)
	}
	if len(imagePaths) == 0 {
		if lastDownloadError == nil {
			lastDownloadError = errors.New("没有可用的商品图片")
		}
		return temporaryDirectory, nil, lastDownloadError
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

	responseReader := bufio.NewReader(response.Body)
	fileHead, peekErr := responseReader.Peek(512)
	if peekErr != nil && !errors.Is(peekErr, io.EOF) {
		return "", fmt.Errorf("读取商品图片文件头失败：%w", peekErr)
	}
	if len(fileHead) == 0 {
		return "", errors.New("商品图片接口没有返回图片内容")
	}
	contentType := http.DetectContentType(fileHead)
	if !strings.HasPrefix(strings.ToLower(contentType), "image/") {
		return "", errors.New("商品图片接口没有返回图片内容")
	}
	if strings.Contains(strings.ToLower(contentType), "gif") || isAnimatedWebP(fileHead) {
		return "", errors.New("闲鱼不支持动态商品图片")
	}
	extension := imageExtension(contentType, imageURL)
	imagePath := filepath.Join(temporaryDirectory, fmt.Sprintf("image-%02d%s", imageIndex+1, extension))
	imageFile, err := os.OpenFile(imagePath, os.O_CREATE|os.O_WRONLY|os.O_EXCL, 0o600)
	if err != nil {
		return "", err
	}
	defer imageFile.Close()

	writtenBytes, err := io.Copy(imageFile, io.LimitReader(responseReader, maxImageBytes+1))
	if err != nil {
		return "", err
	}
	if writtenBytes > maxImageBytes {
		return "", errors.New("单张商品图片不能超过 10MB")
	}
	return imagePath, nil
}

// isAnimatedWebP 判断 WebP 文件头是否声明动画帧。
func isAnimatedWebP(fileHead []byte) bool {
	if len(fileHead) < 12 || string(fileHead[:4]) != "RIFF" || string(fileHead[8:12]) != "WEBP" {
		return false
	}
	return bytes.Contains(fileHead, []byte("ANIM")) || bytes.Contains(fileHead, []byte("ANMF"))
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
