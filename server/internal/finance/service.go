package finance

import (
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/logx"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/xianyu"
	"sync"
	"time"
)

// Service 按账号串行同步，长任务不依赖HTTP请求超时。
type Service struct {
	ctx     context.Context
	repo    *repository.FinanceRepository
	seller  *xianyu.Service
	mutex   sync.Mutex
	running map[string]bool
}

func NewService(ctx context.Context, repo *repository.FinanceRepository, seller *xianyu.Service) *Service {
	return &Service{ctx: ctx, repo: repo, seller: seller, running: map[string]bool{}}
}

// StartSync 同一账号重复点击时返回原任务，不并发访问上游。
func (s *Service) StartSync(ctx context.Context, accountID string) (model.FinanceSyncState, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	state, err := s.repo.SyncState(ctx, accountID)
	if err != nil {
		return state, err
	}
	if s.running[accountID] {
		return state, nil
	}
	state.Status = model.FinanceSyncRunning
	state.UpdatedAt = time.Now()
	state.Error = ""
	state.Added = 0
	state.Updated = 0
	state.Total = 0
	if err := s.repo.SaveSyncState(ctx, accountID, state); err != nil {
		return state, err
	}
	s.running[accountID] = true
	go s.run(accountID, state)
	return state, nil
}
func (s *Service) run(accountID string, state model.FinanceSyncState) {
	defer func() { s.mutex.Lock(); delete(s.running, accountID); s.mutex.Unlock() }()
	ctx, cancel := context.WithTimeout(s.ctx, 20*time.Minute)
	defer cancel()
	orders, err := s.seller.ForAccount(accountID).ListSellerOrders(ctx)
	if err == nil {
		state.Added, state.Updated, err = s.repo.SaveOrders(ctx, accountID, orders)
	}
	state.UpdatedAt = time.Now()
	if err != nil {
		state.Status = model.FinanceSyncFailed
		state.Error = fmt.Sprintf("同步失败：%v", err)
	} else {
		state.Status = model.FinanceSyncSucceeded
		state.LastSucceededAt = &state.UpdatedAt
		state.Total = len(orders)
	}
	saveCtx, saveCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer saveCancel()
	if err := s.repo.SaveSyncState(saveCtx, accountID, state); err != nil {
		logx.Errorf("保存订单同步结果失败：%v", err)
	}
}
