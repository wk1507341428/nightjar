package handler

import (
	"encoding/json"
	"net/http"
)

// writeJSON 输出统一 JSON 响应。
func writeJSON(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

// writeError 输出不包含敏感细节的错误响应。
func writeError(responseWriter http.ResponseWriter, statusCode int, message string) {
	writeJSON(responseWriter, statusCode, map[string]string{"message": message})
}
