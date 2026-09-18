package xianyu

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"sidejob-server/internal/config"
	"sidejob-server/internal/model"
	"sidejob-server/internal/repository"
	"sidejob-server/internal/security"
)

// PublishInput 是闲鱼 API 发布所需商品信息。
type PublishInput struct {
	Title              string
	Description        string
	PriceCents         int64
	OriginalPriceCents int64
	ImagePaths         []string
	RegionID           string
	Brand              string
	Condition          string
	AvailableSizes     []string
	IsFootwear         bool
}

// PublishResult 是闲鱼发布成功结果。
type PublishResult struct {
	ItemID string
	URL    string
}

// OnSaleItem 是闲鱼“我发布的”接口返回的当前在卖商品。
type OnSaleItem struct {
	ItemID     string
	Title      string
	PriceCents int64
	ImageURL   string
	CategoryID string
}

// SearchInput 是闲鱼公开搜索所需的统一筛选条件。
type SearchInput struct {
	Keyword     string
	RowsPerPage int
	Condition   []string
	Shipping    string
}

// SearchItem 是闲鱼市场搜索返回的候选商品。
type SearchItem struct {
	ItemID             string
	Title              string
	PriceCents         int64
	OriginalPriceCents int64
	ImageURL           string
	ItemURL            string
	Attributes         map[string]string
}

// Service 管理加密会话并编排闲鱼 MTop 发布流程。
type Service struct {
	config            config.XianyuConfig
	sessionRepository *repository.SessionRepository
	sessionCipher     *security.Cipher
}

// NewService 创建闲鱼 API 服务。
func NewService(
	serviceConfig config.XianyuConfig,
	sessionRepository *repository.SessionRepository,
	sessionCipher *security.Cipher,
) *Service {
	return &Service{
		config:            serviceConfig,
		sessionRepository: sessionRepository,
		sessionCipher:     sessionCipher,
	}
}

// Connect 解析任意闲鱼 cURL 或 Cookie，校验后加密保存可用凭证。
func (service *Service) Connect(ctx context.Context, rawCredential string) (string, bool, error) {
	parsedCredential, err := ParseCredential(rawCredential)
	if err != nil {
		return "", false, err
	}
	client, err := NewClient(service.config, parsedCredential.Cookie)
	if err != nil {
		return "", false, err
	}

	// 用户资料接口只用于补充昵称；部分可搜索的静默会话无法访问该接口，不阻断凭证保存。
	var navigationResponse map[string]any
	_ = client.Call(ctx, "mtop.idle.web.user.page.nav", "1.0", map[string]any{}, &navigationResponse)
	displayName := readDisplayName(navigationResponse)
	if displayName == "" {
		existingSession, existingErr := service.sessionRepository.Get(ctx)
		if existingErr == nil {
			displayName = existingSession.DisplayName
		}
		if displayName == "" {
			displayName = "闲鱼凭证"
		}
	}

	hasSearchCredential, err := service.saveConnectedCredential(ctx, client.CookieHeader(), displayName, parsedCredential.SearchCredential)
	if err != nil {
		return "", false, err
	}
	return displayName, hasSearchCredential, nil
}

// Connection 返回本地是否保存了闲鱼会话。
func (service *Service) Connection(ctx context.Context) (model.XianyuSession, error) {
	return service.sessionRepository.Get(ctx)
}

// Disconnect 删除本地保存的闲鱼会话。
func (service *Service) Disconnect(ctx context.Context) error {
	return service.sessionRepository.Delete(ctx)
}

// ListOnSaleItems 分页获取当前账号正在闲鱼出售的全部商品。
func (service *Service) ListOnSaleItems(ctx context.Context) ([]OnSaleItem, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName)
	}()

	// 聚合后的当前在卖商品。
	items := make([]OnSaleItem, 0)
	for pageNumber := 1; pageNumber <= 100; pageNumber++ {
		var pageResponse map[string]any
		if err := client.Call(ctx, "mtop.taobao.idle.wx.user.publish.items", "9.3", map[string]any{
			"pageNumber": pageNumber,
		}, &pageResponse); err != nil {
			return nil, fmt.Errorf("获取闲鱼在卖商品失败：%w", err)
		}

		for _, cardValue := range sliceValue(pageResponse["itemCards"]) {
			card := mapValue(cardValue)
			itemID := stringValue(card["id"])
			if itemID == "" {
				continue
			}
			items = append(items, OnSaleItem{
				ItemID:     itemID,
				Title:      stringValue(card["title"]),
				PriceCents: parseYuanPriceCents(stringValue(card["price"])),
				ImageURL:   stringValue(card["picUrl"]),
				CategoryID: stringValue(card["categoryId"]),
			})
		}

		if !boolValue(pageResponse["nextPage"]) {
			break
		}
	}
	return items, nil
}

// SearchItems 使用闲鱼 PC 搜索接口查询市场商品，复用当前 PC 登录态。
func (service *Service) SearchItems(ctx context.Context, input SearchInput) ([]SearchItem, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName)
	}()

	rowsPerPage := input.RowsPerPage
	if rowsPerPage <= 0 || rowsPerPage > 30 {
		rowsPerPage = 30
	}
	// PC 搜索页固定使用 quickFilter:filterFreePostage,filterNew 表示包邮和全新。
	searchFilter := buildPCSearchFilter(input)
	searchRequest := map[string]any{
		"pageNumber":        1,
		"keyword":           input.Keyword,
		"fromFilter":        searchFilter != "",
		"rowsPerPage":       rowsPerPage,
		"sortValue":         "",
		"sortField":         "",
		"customDistance":    "",
		"gps":               "",
		"propValueStr":      map[string]string{"searchFilter": searchFilter},
		"customGps":         "",
		"searchReqFromPage": "pcSearch",
		"extraFilterValue":  "{}",
		"userPositionJson":  "{}",
	}
	var searchResponse map[string]any
	if err := client.CallWithSearchCredential(ctx, "mtop.taobao.idlemtopsearch.pc.search", "1.0", searchRequest, &searchResponse); err != nil {
		return nil, fmt.Errorf("搜索闲鱼市场商品失败：%w", err)
	}

	searchItems := make([]SearchItem, 0)
	for _, resultValue := range sliceValue(searchResponse["resultList"]) {
		result := extractPCSearchItem(mapValue(resultValue))
		itemID := firstNonEmptyString(result, "id", "itemId", "item_id")
		if itemID == "" {
			continue
		}
		itemTitle := firstNonEmptyString(result, "title", "itemTitle")
		imageURL := firstNonEmptyString(result, "imageUrl", "picUrl", "mainPic", "mainPicUrl")
		priceCents := parseSearchPriceCents(result)
		searchItems = append(searchItems, SearchItem{
			ItemID:             itemID,
			Title:              itemTitle,
			PriceCents:         priceCents,
			OriginalPriceCents: parseSearchOriginalPriceCents(result),
			ImageURL:           imageURL,
			ItemURL:            "https://www.goofish.com/item?id=" + itemID,
			Attributes: map[string]string{
				"condition": strings.Join(input.Condition, ","),
				"shipping":  input.Shipping,
			},
		})
	}
	return searchItems, nil
}

// buildPCSearchFilter 按闲鱼 PC 页面约定生成快捷筛选字符串。
func buildPCSearchFilter(input SearchInput) string {
	filters := make([]string, 0, 2)
	if input.Shipping == "free" {
		filters = append(filters, "filterFreePostage")
	}
	if containsString(input.Condition, "new") {
		filters = append(filters, "filterNew")
	}
	if len(filters) == 0 {
		return ""
	}
	return "quickFilter:" + strings.Join(filters, ",")
}

// containsString 判断筛选值是否存在。
func containsString(values []string, expected string) bool {
	for _, value := range values {
		if strings.EqualFold(strings.TrimSpace(value), expected) {
			return true
		}
	}
	return false
}

// extractPCSearchItem 兼容 PC 搜索接口的新旧两种 resultList 数据结构。
func extractPCSearchItem(result map[string]any) map[string]any {
	data := mapValue(result["data"])
	if len(data) == 0 {
		return result
	}
	item := mapValue(data["item"])
	main := mapValue(item["main"])
	exContent := mapValue(main["exContent"])
	if len(exContent) > 0 {
		return exContent
	}
	return data
}

// firstNonEmptyString 读取多个可能的闲鱼字段名。
func firstNonEmptyString(values map[string]any, keys ...string) string {
	for _, key := range keys {
		if value := stringValue(values[key]); value != "" {
			return value
		}
	}
	return ""
}

// parseSearchPriceCents 兼容闲鱼搜索卡片中不同的价格字段。
func parseSearchPriceCents(result map[string]any) int64 {
	for _, key := range []string{"price", "priceText", "itemPrice"} {
		if priceCents := parseYuanPriceCents(firstNonEmptyString(result, key)); priceCents > 0 {
			return priceCents
		}
		if priceCents := parsePriceComponents(result[key]); priceCents > 0 {
			return priceCents
		}
	}
	return 0
}

// parsePriceComponents 解析 PC 搜索卡片的 sign/integer/decimal 价格组件。
func parsePriceComponents(value any) int64 {
	integerPart := ""
	decimalPart := ""
	for _, componentValue := range sliceValue(value) {
		component := mapValue(componentValue)
		switch stringValue(component["type"]) {
		case "integer":
			integerPart = stringValue(component["text"])
		case "decimal":
			decimalPart = strings.TrimPrefix(stringValue(component["text"]), ".")
		}
	}
	if integerPart == "" {
		return 0
	}
	priceText := integerPart
	if decimalPart != "" {
		priceText += "." + decimalPart
	}
	return parseYuanPriceCents(priceText)
}

// parseSearchOriginalPriceCents 读取划线原价字段。
func parseSearchOriginalPriceCents(result map[string]any) int64 {
	for _, key := range []string{"originalPrice", "originPrice", "marketPrice"} {
		if priceCents := parseYuanPriceCents(firstNonEmptyString(result, key)); priceCents > 0 {
			return priceCents
		}
	}
	return 0
}

// Publish 通过闲鱼 API 完成图片上传、属性推荐、服务配置和正式发布。
func (service *Service) Publish(ctx context.Context, input PublishInput) (PublishResult, error) {
	client, displayName, err := service.loadClient(ctx)
	if err != nil {
		return PublishResult{}, err
	}
	defer func() {
		persistenceContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(persistenceContext, client.CookieHeader(), displayName)
	}()

	var pregetResponse map[string]any
	if err := client.Call(ctx, "mtop.idle.pc.idleitem.preget", "1.0", map[string]any{}, &pregetResponse); err != nil {
		return PublishResult{}, fmt.Errorf("获取闲鱼发布配置失败：%w", err)
	}

	uploadedImages := make([]UploadedImage, 0, len(input.ImagePaths))
	for _, imagePath := range input.ImagePaths {
		uploadedImage, uploadErr := client.UploadImage(ctx, imagePath)
		if uploadErr != nil {
			return PublishResult{}, uploadErr
		}
		uploadedImages = append(uploadedImages, uploadedImage)
	}
	imageInfos := buildImageInfos(uploadedImages)

	recommendRequest := map[string]any{
		"description":     input.Description,
		"title":           input.Description,
		"imageInfos":      imageInfos,
		"currentCardList": []any{},
		"selectedList":    []any{},
		"catId":           "50023914",
		"catName":         "",
		"channelCatId":    "",
		"lockCpv":         false,
		"multiSKU":        false,
		"publishScene":    "mainPublish",
		"scene":           "newPublishChoice",
		"uniqueCode":      uniqueCode(),
	}
	var recommendResponse map[string]any
	if err := client.Call(ctx, "mtop.taobao.idle.kgraph.property.recommend", "2.0", recommendRequest, &recommendResponse); err != nil {
		return PublishResult{}, fmt.Errorf("识别闲鱼商品属性失败：%w", err)
	}

	itemCategory := extractCategory(recommendResponse)
	if stringValue(itemCategory["catId"]) == "" {
		return PublishResult{}, errors.New("闲鱼没有识别出商品分类，请调整标题或描述")
	}
	service.applyOptionalAttributes(ctx, client, recommendResponse, itemCategory, input, imageInfos)
	itemLabels := extractSelectedLabels(recommendResponse)
	payload := buildPublishPayload(input, pregetResponse, imageInfos, itemCategory, itemLabels)

	serviceRequest := map[string]any{
		"cpvList":      mustJSON(recommendResponse["cardList"]),
		"itemInfoJson": mustJSON(payload),
		"param":        `{"multiSkuEditingMode":"false","settingsPreferences":null,"supportDefaultOpen":true}`,
	}
	var serviceResponse map[string]any
	if err := client.Call(ctx, "mtop.idle.item.publish.service.cards.list", "1.0", serviceRequest, &serviceResponse); err != nil {
		return PublishResult{}, fmt.Errorf("获取闲鱼发布服务失败：%w", err)
	}
	payload["userRightsProtocols"] = extractServiceProtocols(serviceResponse)
	payload["uniqueCode"] = uniqueCode()
	payload["sourceId"] = "pcMainPublish"
	payload["bizcode"] = "pcMainPublish"
	payload["publishScene"] = "pcMainPublish"

	var publishResponse struct {
		ItemID any `json:"itemId"`
	}
	if err := client.Call(ctx, "mtop.idle.pc.idleitem.publish", "1.0", payload, &publishResponse); err != nil {
		return PublishResult{}, fmt.Errorf("闲鱼发布接口失败：%w", err)
	}
	itemID := stringValue(publishResponse.ItemID)
	if itemID == "" {
		return PublishResult{}, errors.New("闲鱼发布成功响应缺少商品 ID")
	}

	return PublishResult{
		ItemID: itemID,
		URL:    "https://www.goofish.com/item?id=" + itemID,
	}, nil
}

// applyOptionalAttributes 尽可能补充品牌、成色和鞋码，匹配失败时不阻断发布。
func (service *Service) applyOptionalAttributes(
	ctx context.Context,
	client *Client,
	recommendResponse map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
) {
	requirements := []attributeRequirement{
		{Label: "品牌", PropertyNames: []string{"品牌"}, Values: []string{input.Brand}, MatchMode: attributeMatchBrand},
		{Label: "成色", PropertyNames: []string{"成色", "新旧程度"}, Values: []string{input.Condition}, MatchMode: attributeMatchContains},
	}
	if input.IsFootwear {
		requirements = append(requirements, attributeRequirement{
			Label: "鞋码", PropertyNames: []string{"鞋码", "尺码"}, Values: input.AvailableSizes, MatchMode: attributeMatchSize,
		})
	}

	for _, requirement := range requirements {
		if len(requirement.Values) == 0 || strings.TrimSpace(requirement.Values[0]) == "" {
			continue
		}
		cardData := findAttributeCard(recommendResponse, requirement.PropertyNames)
		if cardData == nil {
			continue
		}
		service.selectOptionalAttributeValues(ctx, client, cardData, itemCategory, input, imageInfos, requirement)
	}
}

// attributeRequirement 描述一个必须明确选择的闲鱼属性。
type attributeRequirement struct {
	Label         string
	PropertyNames []string
	Values        []string
	MatchMode     string
}

const (
	attributeMatchContains = "contains"
	attributeMatchBrand    = "brand"
	attributeMatchSize     = "size"
)

// findAttributeCard 按属性名称查找推荐接口返回的卡片。
func findAttributeCard(recommendResponse map[string]any, propertyNames []string) map[string]any {
	for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
		cardData := mapValue(mapValue(cardValue)["cardData"])
		propertyName := stringValue(cardData["propertyName"])
		for _, expectedName := range propertyNames {
			if strings.Contains(propertyName, expectedName) {
				return cardData
			}
		}
	}
	return nil
}

// selectOptionalAttributeValues 匹配现有选项，搜索或匹配失败时保留已匹配结果。
func (service *Service) selectOptionalAttributeValues(
	ctx context.Context,
	client *Client,
	cardData map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
	requirement attributeRequirement,
) {
	options := sliceValue(cardData["valuesList"])
	for _, optionValue := range options {
		option := mapValue(optionValue)
		option["isClicked"] = "0"
		option["isUserClick"] = "0"
	}

	for _, desiredValue := range requirement.Values {
		matchedOption := findMatchingOption(options, desiredValue, requirement.MatchMode)
		if matchedOption == nil {
			searchedOptions, err := service.searchAttributeOptions(ctx, client, cardData, itemCategory, input, imageInfos, desiredValue)
			if err != nil {
				continue
			}
			for _, searchedOption := range searchedOptions {
				options = append(options, searchedOption)
			}
			matchedOption = findMatchingOption(searchedOptions, desiredValue, requirement.MatchMode)
		}
		if matchedOption == nil {
			continue
		}
		matchedOption["isClicked"] = "1"
		matchedOption["isUserClick"] = "1"
	}
	cardData["valuesList"] = options
}

// searchAttributeOptions 使用当前分类搜索品牌或鞋码选项。
func (service *Service) searchAttributeOptions(
	ctx context.Context,
	client *Client,
	cardData map[string]any,
	itemCategory map[string]any,
	input PublishInput,
	imageInfos []map[string]any,
	searchText string,
) ([]any, error) {
	pictureURL := ""
	if len(imageInfos) > 0 {
		pictureURL = stringValue(imageInfos[0]["imgPath"])
	}
	searchRequest := map[string]any{
		"inputText":    searchText,
		"propertyId":   stringValue(cardData["propertyId"]),
		"description":  input.Description,
		"catId":        itemCategory["catId"],
		"channelCatId": itemCategory["channelCatId"],
		"tbCatId":      itemCategory["tbCatId"],
		"picUrl":       pictureURL,
		"scene":        "mainPublish",
	}
	var searchResponse map[string]any
	if err := client.Call(ctx, "mtop.taobao.idle.kgraph.property.search", "1.0", searchRequest, &searchResponse); err != nil {
		return nil, err
	}
	return sliceValue(searchResponse["searchList"]), nil
}

// findMatchingOption 按品牌、成色或尺码规则匹配闲鱼属性选项。
func findMatchingOption(options []any, desiredValue string, matchMode string) map[string]any {
	for _, optionValue := range options {
		option := mapValue(optionValue)
		optionName := stringValue(option["valueName"])
		if optionName == "" {
			optionName = stringValue(option["text"])
		}
		if attributeValueMatches(optionName, desiredValue, matchMode) {
			return option
		}
	}
	return nil
}

// attributeValueMatches 判断闲鱼选项是否对应源商品属性。
func attributeValueMatches(optionValue string, desiredValue string, matchMode string) bool {
	if matchMode == attributeMatchSize {
		return normalizeSize(optionValue) == normalizeSize(desiredValue)
	}
	if matchMode == attributeMatchBrand {
		return brandMatches(optionValue, desiredValue)
	}
	normalizedOption := normalizeAttributeText(optionValue)
	normalizedDesired := normalizeAttributeText(desiredValue)
	return normalizedOption == normalizedDesired || strings.Contains(normalizedOption, normalizedDesired)
}

// brandMatches 兼容中英文品牌名称。
func brandMatches(optionValue string, desiredValue string) bool {
	normalizedOption := normalizeAttributeText(optionValue)
	normalizedDesired := normalizeAttributeText(desiredValue)
	brandAliases := map[string][]string{
		"nike":       {"nike", "耐克"},
		"lining":     {"lining", "李宁"},
		"adidas":     {"adidas", "阿迪达斯"},
		"newbalance": {"newbalance", "新百伦"},
	}
	for _, aliases := range brandAliases {
		desiredMatched := false
		optionMatched := false
		for _, alias := range aliases {
			desiredMatched = desiredMatched || strings.Contains(normalizedDesired, alias)
			optionMatched = optionMatched || strings.Contains(normalizedOption, alias)
		}
		if desiredMatched && optionMatched {
			return true
		}
	}
	return normalizedOption == normalizedDesired || strings.Contains(normalizedOption, normalizedDesired)
}

// normalizeAttributeText 标准化普通属性文本。
func normalizeAttributeText(value string) string {
	normalizedValue := strings.ToLower(strings.TrimSpace(value))
	replacer := strings.NewReplacer(" ", "", "-", "", "_", "", "/", "", "·", "")
	return replacer.Replace(normalizedValue)
}

// normalizeSize 标准化鞋码文本用于精确比较。
func normalizeSize(value string) string {
	normalizedValue := normalizeAttributeText(value)
	replacer := strings.NewReplacer("鞋码", "", "码", "", "eu", "", "cn", "")
	return replacer.Replace(normalizedValue)
}

// loadClient 解密数据库会话并创建请求客户端。
func (service *Service) loadClient(ctx context.Context) (*Client, string, error) {
	session, err := service.sessionRepository.Get(ctx)
	if errors.Is(err, repository.ErrSessionNotFound) {
		return nil, "", ErrSessionExpired
	}
	if err != nil {
		return nil, "", err
	}
	rawCookie, err := service.sessionCipher.Decrypt(session.EncryptedCookie)
	if err != nil {
		return nil, "", err
	}
	client, err := NewClient(service.config, rawCookie)
	if err != nil {
		return nil, "", err
	}
	if session.EncryptedSearchCredential != "" {
		decryptedCredential, decryptErr := service.sessionCipher.Decrypt(session.EncryptedSearchCredential)
		if decryptErr != nil {
			return nil, "", decryptErr
		}
		searchCredential, decodeErr := DecodeSearchCredential(decryptedCredential)
		if decodeErr != nil {
			return nil, "", decodeErr
		}
		client.SetSearchCredential(searchCredential)
	}
	return client, session.DisplayName, nil
}

// saveConnectedCredential 保存 Cookie，并在 cURL 含搜索安全参数时更新比价凭证。
func (service *Service) saveConnectedCredential(
	ctx context.Context,
	rawCookie string,
	displayName string,
	searchCredential SearchCredential,
) (bool, error) {
	// 普通 cURL 更新登录态时保留已经存在的比价凭证。
	hasSearchCredential := false
	existingSession, existingErr := service.sessionRepository.Get(ctx)
	if existingErr == nil && existingSession.EncryptedSearchCredential != "" {
		hasSearchCredential = true
	}

	encryptedCookie, err := service.sessionCipher.Encrypt(rawCookie)
	if err != nil {
		return false, err
	}
	session := model.XianyuSession{
		Platform:        model.XianyuPlatform,
		EncryptedCookie: encryptedCookie,
		DisplayName:     displayName,
		UpdatedAt:       time.Now(),
	}
	if searchCredential.Complete() {
		encodedCredential, encodeErr := EncodeSearchCredential(searchCredential)
		if encodeErr != nil {
			return false, encodeErr
		}
		session.EncryptedSearchCredential, err = service.sessionCipher.Encrypt(encodedCredential)
		if err != nil {
			return false, err
		}
		hasSearchCredential = true
	}
	if err := service.sessionRepository.Save(ctx, session); err != nil {
		return false, err
	}
	return hasSearchCredential, nil
}

// saveCookie 加密并保存最新 Cookie。
func (service *Service) saveCookie(ctx context.Context, rawCookie string, displayName string) error {
	encryptedCookie, err := service.sessionCipher.Encrypt(rawCookie)
	if err != nil {
		return err
	}
	return service.sessionRepository.Save(ctx, model.XianyuSession{
		Platform:        model.XianyuPlatform,
		EncryptedCookie: encryptedCookie,
		DisplayName:     displayName,
		UpdatedAt:       time.Now(),
	})
}

// buildImageInfos 将上传响应转换为正式发布图片结构。
func buildImageInfos(uploadedImages []UploadedImage) []map[string]any {
	imageInfos := make([]map[string]any, 0, len(uploadedImages))
	for imageIndex, uploadedImage := range uploadedImages {
		width, _ := strconv.Atoi(uploadedImage.Width.String())
		height, _ := strconv.Atoi(uploadedImage.Height.String())
		if uploadedImage.Pix != "" {
			pixParts := strings.SplitN(uploadedImage.Pix, "x", 2)
			if width == 0 && len(pixParts) > 0 {
				width, _ = strconv.Atoi(pixParts[0])
			}
			if height == 0 && len(pixParts) > 1 {
				height, _ = strconv.Atoi(pixParts[1])
			}
		}
		imgPath := uploadedImage.ImgPath
		if imgPath == "" {
			imgPath = uploadedImage.URL
		}
		imageInfos = append(imageInfos, map[string]any{
			"extraInfo":     map[string]string{"isH": "false", "isT": "false", "raw": "false"},
			"heightSize":    height,
			"widthSize":     width,
			"imgPath":       imgPath,
			"url":           uploadedImage.URL,
			"thumbnail":     uploadedImage.URL,
			"major":         imageIndex == 0,
			"isQrCode":      false,
			"labels":        []any{},
			"templateIndex": "0",
			"type":          0,
			"status":        "done",
		})
	}
	return imageInfos
}

// buildPublishPayload 构造闲鱼网页当前版本的正式发布字段。
func buildPublishPayload(
	input PublishInput,
	pregetResponse map[string]any,
	imageInfos []map[string]any,
	itemCategory map[string]any,
	itemLabels []map[string]any,
) map[string]any {
	itemAddress := mapValue(pregetResponse["itemAddrDTO"])
	if len(itemAddress) == 0 {
		itemAddress = mapValue(pregetResponse["defaultItemAddrDTO"])
	}
	if stringValue(itemAddress["divisionId"]) == "" {
		itemAddress = defaultAddressForRegion(input.RegionID)
	}
	return map[string]any{
		"freebies":        false,
		"itemTypeStr":     "b",
		"quantity":        "1",
		"simpleItem":      "true",
		"imageInfoDOList": imageInfos,
		"itemTextDTO": map[string]any{
			"desc":              input.Description,
			"title":             input.Description,
			"titleDescSeparate": false,
		},
		"itemPriceDTO": map[string]any{
			"priceInCent":     strconv.FormatInt(input.PriceCents, 10),
			"origPriceInCent": optionalPrice(input.OriginalPriceCents),
		},
		"itemPostFeeDTO": map[string]any{
			"canFreeShipping": true,
			"supportFreight":  true,
			"onlyTakeSelf":    false,
		},
		"itemAddrDTO":       itemAddress,
		"itemCatDTO":        itemCategory,
		"itemLabelExtList":  itemLabels,
		"itemStatus":        "0",
		"itemTopicParams":   map[string]any{"topicInfos": []any{}},
		"topics":            []any{},
		"itemGroupDTO":      map[string]any{"groupId": ""},
		"itemProperties":    []any{},
		"itemSkuList":       nil,
		"propertyImageList": nil,
		"defaultPrice":      false,
		"aiHostUsed":        false,
		"aigc":              "",
		"aigcRequestId":     "",
		"asyncSecurityInfo": map[string]any{"securityStrategyHitResult": map[string]any{"FORBIDDEN": []any{}, "WARN": []any{}}},
		"yhbItemInfoDTO":    map[string]any{"idleAppraiseScene": "", "settingsPreferences": map[string]string{"assumeRule": "", "tradeRule": ""}, "useYhbService": false},
	}
}

// defaultAddressForRegion 将奥莱地区转换为闲鱼发布所需行政区信息。
func defaultAddressForRegion(regionID string) map[string]any {
	// 各佛罗伦萨小镇对应的默认行政区。
	regionAddresses := map[string]map[string]any{
		"2": {"prov": "天津", "city": "天津", "area": "武清区", "divisionId": "120114"},
		"3": {"prov": "上海", "city": "上海", "area": "浦东新区", "divisionId": "310115"},
		"4": {"prov": "广东省", "city": "佛山市", "area": "南海区", "divisionId": "440605"},
		"5": {"prov": "四川省", "city": "成都市", "area": "郫都区", "divisionId": "510117"},
		"6": {"prov": "湖北省", "city": "鄂州市", "area": "华容区", "divisionId": "420703"},
		"7": {"prov": "重庆", "city": "重庆", "area": "沙坪坝区", "divisionId": "500106"},
	}
	address := regionAddresses[regionID]
	if address == nil {
		address = regionAddresses["3"]
	}
	return map[string]any{
		"prov":       address["prov"],
		"city":       address["city"],
		"area":       address["area"],
		"divisionId": address["divisionId"],
		"gps":        "",
		"poiId":      "",
		"poiName":    "",
	}
}

// extractCategory 读取推荐接口给出的分类。
func extractCategory(recommendResponse map[string]any) map[string]any {
	category := mapValue(recommendResponse["categoryPredictResult"])
	if stringValue(category["catId"]) == "" {
		for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
			cardData := mapValue(mapValue(cardValue)["cardData"])
			if stringValue(cardData["propertyId"]) != "-10000" {
				continue
			}
			for _, optionValue := range sliceValue(cardData["valuesList"]) {
				option := mapValue(optionValue)
				if stringValue(option["isClicked"]) == "1" {
					category = option
					break
				}
			}
		}
	}
	return map[string]any{
		"catId":        category["catId"],
		"catName":      category["catName"],
		"channelCatId": category["channelCatId"],
		"leafId":       category["leafId"],
		"tbCatId":      category["tbCatId"],
	}
}

// extractSelectedLabels 收集属性卡片默认选中的分类和属性。
func extractSelectedLabels(recommendResponse map[string]any) []map[string]any {
	labels := make([]map[string]any, 0)
	for _, cardValue := range sliceValue(recommendResponse["cardList"]) {
		card := mapValue(cardValue)
		cardData := mapValue(card["cardData"])
		propertyID := stringValue(cardData["propertyId"])
		propertyName := stringValue(cardData["propertyName"])
		for _, optionValue := range sliceValue(cardData["valuesList"]) {
			option := mapValue(optionValue)
			if stringValue(option["isClicked"]) != "1" {
				continue
			}
			valueID := stringValue(option["valueId"])
			valueName := stringValue(option["valueName"])
			if propertyID == "-10000" {
				valueID = stringValue(option["channelCatId"])
				valueName = stringValue(option["catName"])
			}
			label := mapValue(option["transportData"])
			if label == nil {
				label = make(map[string]any)
			}
			label["text"] = valueName
			label["isUserClick"] = option["isUserClick"]
			label["properties"] = propertyID + "##" + propertyName + ":" + valueID + "##" + valueName
			labels = append(labels, label)
		}
	}
	return labels
}

// extractServiceProtocols 按闲鱼默认开关生成服务协议。
func extractServiceProtocols(serviceResponse map[string]any) []map[string]any {
	protocols := make([]map[string]any, 0)
	for _, serviceValue := range sliceValue(serviceResponse["services"]) {
		serviceInfo := mapValue(serviceValue)
		serviceCode := stringValue(serviceInfo["code"])
		if serviceCode == "" {
			continue
		}
		protocols = append(protocols, map[string]any{
			"serviceCode": serviceCode,
			"enable":      serviceCode != "AI_SALE" && boolValue(serviceInfo["defaultEnable"]),
		})
	}
	return protocols
}

// readDisplayName 读取登录用户昵称。
func readDisplayName(navigationResponse map[string]any) string {
	module := mapValue(navigationResponse["module"])
	base := mapValue(module["base"])
	return stringValue(base["displayName"])
}

// uniqueCode 生成闲鱼网页格式的请求唯一标识。
func uniqueCode() string {
	return fmt.Sprintf("%d%03d", time.Now().UnixMilli(), time.Now().UnixNano()%1000)
}

// mustJSON 将嵌套参数编码为字符串。
func mustJSON(value any) string {
	encodedValue, _ := json.Marshal(value)
	return string(encodedValue)
}

// mapValue 安全读取动态 JSON 对象。
func mapValue(value any) map[string]any {
	if typedValue, ok := value.(map[string]any); ok {
		return typedValue
	}
	return map[string]any{}
}

// sliceValue 安全读取动态 JSON 数组。
func sliceValue(value any) []any {
	if typedValue, ok := value.([]any); ok {
		return typedValue
	}
	return []any{}
}

// stringValue 将接口动态字段转换为字符串。
func stringValue(value any) string {
	switch typedValue := value.(type) {
	case string:
		return typedValue
	case json.Number:
		return typedValue.String()
	case float64:
		return strconv.FormatInt(int64(typedValue), 10)
	default:
		return ""
	}
}

// boolValue 将接口动态字段转换为布尔值。
func boolValue(value any) bool {
	switch typedValue := value.(type) {
	case bool:
		return typedValue
	case string:
		return typedValue == "true" || typedValue == "1"
	default:
		return false
	}
}

// parseYuanPriceCents 将闲鱼人民币价格转换为分。
func parseYuanPriceCents(value string) int64 {
	normalizedValue := strings.TrimSpace(strings.TrimPrefix(value, "¥"))
	price, err := strconv.ParseFloat(normalizedValue, 64)
	if err != nil || price <= 0 {
		return 0
	}
	return int64(math.Round(price * 100))
}

// optionalPrice 省略无意义的原价字段。
func optionalPrice(priceCents int64) any {
	if priceCents <= 0 {
		return nil
	}
	return strconv.FormatInt(priceCents, 10)
}
