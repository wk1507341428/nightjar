package pinduoduo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
)

// Service 管理拼多多加密凭证并提供商品搜索。
type Service struct {
	sessionRepository *repository.PinduoduoSessionRepository
	sessionCipher     *security.Cipher
}

// NewService 创建拼多多服务。
func NewService(sessionRepository *repository.PinduoduoSessionRepository, sessionCipher *security.Cipher) *Service {
	return &Service{sessionRepository: sessionRepository, sessionCipher: sessionCipher}
}

// Connect 解析、验证并加密保存拼多多商家后台 cURL 或 Cookie。
func (service *Service) Connect(ctx context.Context, rawCredential string) error {
	credential, err := ParseCredential(rawCredential)
	if err != nil {
		return err
	}
	client, err := NewClient(credential)
	if err != nil {
		return err
	}
	if _, err := client.Search(ctx, SearchInput{Keyword: "NIKE", Page: 1, Size: 1}); err != nil {
		return err
	}
	encodedCredential, err := EncodeCredential(credential)
	if err != nil {
		return err
	}
	encryptedCredential, err := service.sessionCipher.Encrypt(encodedCredential)
	if err != nil {
		return err
	}
	return service.sessionRepository.Save(ctx, model.PinduoduoSession{
		Platform:            model.PinduoduoPlatform,
		EncryptedCredential: encryptedCredential,
		UpdatedAt:           time.Now(),
	})
}

// Connection 返回当前保存的拼多多连接状态。
func (service *Service) Connection(ctx context.Context) (model.PinduoduoSession, error) {
	session, err := service.sessionRepository.Get(ctx)
	if err != nil {
		return model.PinduoduoSession{}, err
	}
	encodedCredential, err := service.sessionCipher.Decrypt(session.EncryptedCredential)
	if err != nil {
		return model.PinduoduoSession{}, repository.ErrPinduoduoSessionNotFound
	}
	if _, err := DecodeCredential(encodedCredential); err != nil {
		return model.PinduoduoSession{}, repository.ErrPinduoduoSessionNotFound
	}
	return session, nil
}

// Disconnect 删除拼多多连接凭证。
func (service *Service) Disconnect(ctx context.Context) error {
	return service.sessionRepository.Delete(ctx)
}

// SearchItems 使用已保存的拼多多凭证搜索商品。
func (service *Service) SearchItems(ctx context.Context, input SearchInput) ([]SearchItem, error) {
	session, err := service.sessionRepository.Get(ctx)
	if errors.Is(err, repository.ErrPinduoduoSessionNotFound) {
		return nil, fmt.Errorf("尚未连接拼多多商家后台，请先填写并验证商家后台凭证")
	}
	if err != nil {
		return nil, err
	}
	encodedCredential, err := service.sessionCipher.Decrypt(session.EncryptedCredential)
	if err != nil {
		return nil, err
	}
	credential, err := DecodeCredential(encodedCredential)
	if err != nil {
		return nil, err
	}
	client, err := NewClient(credential)
	if err != nil {
		return nil, err
	}
	return client.Search(ctx, input)
}
