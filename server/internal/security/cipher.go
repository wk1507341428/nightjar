package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const encryptionKeySize = 32

// Cipher 使用服务端独立密钥加密各平台登录凭证。
type Cipher struct {
	aead cipher.AEAD
}

// NewCipherFromFile 读取密钥文件；不存在时生成仅当前用户可读的新密钥。
func NewCipherFromFile(configuredPath string) (*Cipher, error) {
	keyPath, err := resolveKeyPath(configuredPath)
	if err != nil {
		return nil, err
	}
	key, err := loadOrCreateKey(keyPath)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("create session cipher: %w", err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("create session AEAD: %w", err)
	}
	return &Cipher{aead: aead}, nil
}

// Encrypt 加密敏感字符串并返回 Base64 文本。
func (sessionCipher *Cipher) Encrypt(plaintext string) (string, error) {
	nonce := make([]byte, sessionCipher.aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", fmt.Errorf("generate session nonce: %w", err)
	}
	ciphertext := sessionCipher.aead.Seal(nil, nonce, []byte(plaintext), nil)
	sealedPayload := append(nonce, ciphertext...)
	return base64.RawStdEncoding.EncodeToString(sealedPayload), nil
}

// Decrypt 解密数据库中的平台会话。
func (sessionCipher *Cipher) Decrypt(encodedPayload string) (string, error) {
	sealedPayload, err := base64.RawStdEncoding.DecodeString(encodedPayload)
	if err != nil {
		return "", errors.New("invalid encrypted session")
	}
	nonceSize := sessionCipher.aead.NonceSize()
	if len(sealedPayload) <= nonceSize {
		return "", errors.New("invalid encrypted session length")
	}
	plaintext, err := sessionCipher.aead.Open(nil, sealedPayload[:nonceSize], sealedPayload[nonceSize:], nil)
	if err != nil {
		return "", errors.New("decrypt platform session failed")
	}
	return string(plaintext), nil
}

// resolveKeyPath 返回默认应用数据目录中的密钥路径。
func resolveKeyPath(configuredPath string) (string, error) {
	if configuredPath != "" {
		return filepath.Abs(configuredPath)
	}
	userConfigDirectory, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("resolve user config directory: %w", err)
	}
	return filepath.Join(userConfigDirectory, "SideJob", "session.key"), nil
}

// loadOrCreateKey 加载或原子创建 256 位本机密钥。
func loadOrCreateKey(keyPath string) ([]byte, error) {
	key, err := os.ReadFile(keyPath)
	if err == nil {
		if len(key) != encryptionKeySize {
			return nil, errors.New("session key must be 32 bytes")
		}
		return key, nil
	}
	if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}
	if err := os.MkdirAll(filepath.Dir(keyPath), 0o700); err != nil {
		return nil, err
	}

	key = make([]byte, encryptionKeySize)
	if _, err := rand.Read(key); err != nil {
		return nil, err
	}
	keyFile, err := os.OpenFile(keyPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		if errors.Is(err, os.ErrExist) {
			return os.ReadFile(keyPath)
		}
		return nil, err
	}
	defer keyFile.Close()
	if _, err := keyFile.Write(key); err != nil {
		return nil, err
	}
	return key, nil
}
