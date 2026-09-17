package handler

import (
	"net/http"

	"sidejob-server/internal/types"
)

// healthHandler 返回 API 存活状态。
func healthHandler() http.HandlerFunc {
	return func(responseWriter http.ResponseWriter, _ *http.Request) {
		writeJSON(responseWriter, http.StatusOK, types.HealthResponse{Status: "ok"})
	}
}
