package security

import (
	"path/filepath"
	"testing"
)

// TestCipherRoundTrip 验证 Cookie 加密后可恢复且不会明文落盘。
func TestCipherRoundTrip(t *testing.T) {
	cipherInstance, err := NewCipherFromFile(filepath.Join(t.TempDir(), "session.key"))
	if err != nil {
		t.Fatalf("NewCipherFromFile() error: %v", err)
	}

	plaintext := "_m_h5_tk=secret; cookie2=value"
	encryptedValue, err := cipherInstance.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("Encrypt() error: %v", err)
	}
	if encryptedValue == plaintext {
		t.Fatal("Encrypt() returned plaintext")
	}
	decryptedValue, err := cipherInstance.Decrypt(encryptedValue)
	if err != nil {
		t.Fatalf("Decrypt() error: %v", err)
	}
	if decryptedValue != plaintext {
		t.Fatalf("Decrypt() = %q, want %q", decryptedValue, plaintext)
	}
}
