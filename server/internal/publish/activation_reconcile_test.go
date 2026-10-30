package publish

import (
	"context"
	"sidejob-server/internal/model"
	"testing"
)

func TestActivationRejectsLegacySourceBeforePreparation(t *testing.T) {
	service := &Service{}
	for _, action := range []string{"", model.PublishActionPublish, model.PublishActionRelist} {
		if _, err := service.refreshActivationTask(context.Background(), model.PublishTask{Action: action}); err == nil {
			t.Fatalf("legacy %q activation accepted", action)
		}
	}
}
