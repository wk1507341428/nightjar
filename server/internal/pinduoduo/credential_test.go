package pinduoduo

import "testing"

func TestParseCredentialFromCurl(t *testing.T) {
	credential, err := ParseCredential("curl --url 'https://mms.pinduoduo.com/test' -b 'api_uid=1; JSESSIONID=session-value; PASS_ID=pass-value'")
	if err != nil {
		t.Fatalf("ParseCredential() error: %v", err)
	}
	if credential.Cookie != "api_uid=1; JSESSIONID=session-value; PASS_ID=pass-value" {
		t.Fatalf("ParseCredential().Cookie = %q", credential.Cookie)
	}
}

func TestParseCredentialFromRawCookie(t *testing.T) {
	credential, err := ParseCredential("Cookie: JSESSIONID=session-value; PASS_ID=pass-value")
	if err != nil {
		t.Fatalf("ParseCredential() error: %v", err)
	}
	if credential.Cookie != "JSESSIONID=session-value; PASS_ID=pass-value" {
		t.Fatalf("ParseCredential().Cookie = %q", credential.Cookie)
	}
}
