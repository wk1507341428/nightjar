package publish

import (
	"context"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
	"sidejob-server/internal/model"
	"sidejob-server/internal/xianyu"
)

// stopOnPublishCountLimit closes the account gate before any further queued task can reach the platform.
func (service *Service) stopOnPublishCountLimit(task model.PublishTask, err error) bool {
	if !xianyu.IsPublishCountLimit(err) {
		return false
	}
	accountID := task.AccountID
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	// The in-memory gate also fails closed when the database pause write fails.
	service.capacityStops.Store(accountID, true)
	reason := fmt.Sprintf("闲鱼发布商品数量已达上限，已自动中止该账号发布队列（%s）；清理商品后需手动恢复", xianyu.PublishCountLimitErrorCode)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if pauseErr := service.accountRepository.PauseForPublishLimit(ctx, accountID, reason); pauseErr != nil {
		logx.Errorf("persist capacity stop account=%s: %v", accountID, pauseErr)
	}
	if stopErr := service.repository.AbortAccountQueueForPublishLimit(ctx, accountID, reason); stopErr != nil {
		logx.Errorf("abort capacity queue account=%s: %v", accountID, stopErr)
	}
	if task.ID != "" {
		service.failTask(ctx, task.ID, fmt.Sprintf("%v；%s", err, reason))
	}
	return true
}

// ClearAutomaticStop is called only after an explicit account-resume request has been saved.
func (service *Service) ClearAutomaticStop(accountID string) {
	if accountID == "" {
		accountID = model.DefaultXianyuAccountID
	}
	service.capacityStops.Delete(accountID)
}
