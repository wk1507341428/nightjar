package xianyu

import "testing"

func TestParseCredentialFromAnyCurl(t *testing.T) {
	rawCurl := `curl --url 'https://h5api.m.goofish.com/h5/example/1.0/' -H 'Cookie: _m_h5_tk=token_expiry; cookie2=session' --data-raw $'data=%7B%7D&bx-ua=ua%2Bvalue&bx-umidtoken=umid&bx_et=et'`
	credential, err := ParseCredential(rawCurl)
	if err != nil {
		t.Fatalf("ParseCredential() error = %v", err)
	}
	if credential.Cookie != "_m_h5_tk=token_expiry; cookie2=session" {
		t.Fatalf("unexpected cookie: %s", credential.Cookie)
	}
	if credential.SearchCredential.BxUA != "ua+value" || !credential.SearchCredential.Complete() {
		t.Fatalf("unexpected search credential: %#v", credential.SearchCredential)
	}
}

func TestParseCredentialFromCookie(t *testing.T) {
	credential, err := ParseCredential("Cookie: _m_h5_tk=token_expiry; cookie2=session")
	if err != nil {
		t.Fatalf("ParseCredential() error = %v", err)
	}
	if credential.Cookie != "_m_h5_tk=token_expiry; cookie2=session" {
		t.Fatalf("unexpected cookie: %s", credential.Cookie)
	}
	if credential.SearchCredential.Complete() {
		t.Fatal("plain cookie must not report search credential")
	}
}
