package xianyu

import "errors"

// PublishCountLimitErrorCode is the actual code captured from the seller publish response.
const PublishCountLimitErrorCode = "FAIL_BIZ_PLAYBOY_ERRORCODE_REACHED_PUBLISH_COUNT_LIMIT"

func IsPublishCountLimit(err error) bool {
	var business *APIError
	return errors.As(err, &business) && business.Code == PublishCountLimitErrorCode
}
