package xianyu

import (
	"encoding/json"
	"errors"
	"net/url"
	"strconv"
	"strings"
	"unicode"
)

// ErrSearchCredentialMissing 表示连接可用于发布，但缺少闲鱼搜索风控凭证。
var ErrSearchCredentialMissing = errors.New("当前闲鱼凭证可用于账号连接，但未包含比价所需的 bx 安全参数；请重新导入一条包含 bx-ua 的闲鱼 cURL")

// SearchCredential 保存闲鱼搜索请求的动态安全参数。
type SearchCredential struct {
	BxUA        string `json:"bxUa"`
	BxUmidToken string `json:"bxUmidToken"`
	BxET        string `json:"bxEt"`
}

// Complete 判断搜索安全参数是否齐全。
func (credential SearchCredential) Complete() bool {
	return credential.BxUA != "" && credential.BxUmidToken != "" && credential.BxET != ""
}

// FormValues 返回闲鱼搜索接口要求的附加表单字段。
func (credential SearchCredential) FormValues() url.Values {
	return url.Values{
		"bx-ua":        []string{credential.BxUA},
		"bx-umidtoken": []string{credential.BxUmidToken},
		"bx_et":        []string{credential.BxET},
	}
}

// ParsedCredential 是从任意闲鱼 cURL 或纯 Cookie 中提取出的连接信息。
type ParsedCredential struct {
	Cookie           string
	SearchCredential SearchCredential
}

// ParseCredential 支持解析浏览器复制的任意闲鱼 cURL，也兼容纯 Cookie Header。
func ParseCredential(rawInput string) (ParsedCredential, error) {
	normalizedInput := strings.TrimSpace(rawInput)
	if normalizedInput == "" {
		return ParsedCredential{}, errors.New("请粘贴闲鱼请求 cURL 或完整 Cookie")
	}
	if !strings.HasPrefix(strings.ToLower(normalizedInput), "curl ") {
		return ParsedCredential{Cookie: normalizeRawCookie(normalizedInput)}, nil
	}

	arguments := splitShellArguments(normalizedInput)
	parsedCredential := ParsedCredential{}
	for argumentIndex := 0; argumentIndex < len(arguments); argumentIndex++ {
		argument := arguments[argumentIndex]
		switch argument {
		case "-b", "--cookie":
			if argumentIndex+1 < len(arguments) {
				argumentIndex++
				parsedCredential.Cookie = normalizeRawCookie(arguments[argumentIndex])
			}
		case "-H", "--header":
			if argumentIndex+1 < len(arguments) {
				argumentIndex++
				headerValue := arguments[argumentIndex]
				if strings.HasPrefix(strings.ToLower(headerValue), "cookie:") {
					parsedCredential.Cookie = normalizeRawCookie(headerValue)
				}
			}
		case "--data", "--data-raw", "--data-binary", "--data-urlencode":
			if argumentIndex+1 < len(arguments) {
				argumentIndex++
				mergeSearchCredential(&parsedCredential.SearchCredential, arguments[argumentIndex])
			}
		default:
			if strings.HasPrefix(argument, "--cookie=") {
				parsedCredential.Cookie = normalizeRawCookie(strings.TrimPrefix(argument, "--cookie="))
			}
		}
	}
	if parsedCredential.Cookie == "" {
		return ParsedCredential{}, errors.New("cURL 中没有找到 Cookie，请从已登录的闲鱼请求复制完整 cURL")
	}
	return parsedCredential, nil
}

// EncodeSearchCredential 将搜索安全参数序列化后交给会话加密器。
func EncodeSearchCredential(credential SearchCredential) (string, error) {
	encodedCredential, err := json.Marshal(credential)
	if err != nil {
		return "", err
	}
	return string(encodedCredential), nil
}

// DecodeSearchCredential 解析已解密的搜索安全参数。
func DecodeSearchCredential(encodedCredential string) (SearchCredential, error) {
	var credential SearchCredential
	if err := json.Unmarshal([]byte(encodedCredential), &credential); err != nil {
		return SearchCredential{}, err
	}
	return credential, nil
}

// normalizeRawCookie 移除可选的 Cookie: 前缀。
func normalizeRawCookie(rawCookie string) string {
	trimmedCookie := strings.TrimSpace(rawCookie)
	if len(trimmedCookie) >= len("cookie:") && strings.EqualFold(trimmedCookie[:len("cookie:")], "cookie:") {
		return strings.TrimSpace(trimmedCookie[len("cookie:"):])
	}
	return trimmedCookie
}

// mergeSearchCredential 从表单正文中提取搜索安全参数。
func mergeSearchCredential(credential *SearchCredential, formBody string) {
	formValues, err := url.ParseQuery(formBody)
	if err != nil {
		return
	}
	if value := formValues.Get("bx-ua"); value != "" {
		credential.BxUA = value
	}
	if value := formValues.Get("bx-umidtoken"); value != "" {
		credential.BxUmidToken = value
	}
	if value := formValues.Get("bx_et"); value != "" {
		credential.BxET = value
	}
}

// splitShellArguments 解析浏览器“Copy as cURL”输出中的引号和换行转义。
func splitShellArguments(command string) []string {
	arguments := make([]string, 0)
	currentArgument := strings.Builder{}
	var quote rune
	ansiQuoted := false
	flushArgument := func() {
		if currentArgument.Len() == 0 {
			return
		}
		argument := currentArgument.String()
		if ansiQuoted {
			if unquotedArgument, err := strconv.Unquote(`"` + strings.ReplaceAll(argument, `"`, `\"`) + `"`); err == nil {
				argument = unquotedArgument
			}
		}
		arguments = append(arguments, argument)
		currentArgument.Reset()
		ansiQuoted = false
	}

	commandRunes := []rune(command)
	for runeIndex := 0; runeIndex < len(commandRunes); runeIndex++ {
		currentRune := commandRunes[runeIndex]
		if quote == 0 {
			if unicode.IsSpace(currentRune) {
				flushArgument()
				continue
			}
			if currentRune == '$' && runeIndex+1 < len(commandRunes) && commandRunes[runeIndex+1] == '\'' {
				quote = '\''
				ansiQuoted = true
				runeIndex++
				continue
			}
			if currentRune == '\'' || currentRune == '"' {
				quote = currentRune
				continue
			}
			if currentRune == '\\' && runeIndex+1 < len(commandRunes) {
				runeIndex++
				if commandRunes[runeIndex] != '\n' {
					currentArgument.WriteRune(commandRunes[runeIndex])
				}
				continue
			}
			currentArgument.WriteRune(currentRune)
			continue
		}

		if currentRune == quote {
			quote = 0
			continue
		}
		currentArgument.WriteRune(currentRune)
	}
	flushArgument()
	return arguments
}
