package xianyu

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"
	"sidejob-server/internal/model"
	"strconv"
	"strings"
	"time"
)

const sellerOrderListAPI = "mtop.taobao.idle.trade.merchant.sold.get"

// worryFreeBadgeFile 是已在真实订单页面核对的无忧卖徽标；未知图标不能推断成无忧卖。
const worryFreeBadgeFile = "/O1CN01G5axbb1zp3LBi7OpO_!!6000000006762-2-tps-108-42.png"

var financeItemNoPattern = regexp.MustCompile(`(?i)\b[A-Z]{1,6}[0-9]{3,}[A-Z0-9]*(?:-[A-Z0-9]+)?\b`)

// ListSellerOrders 串行读取所有订单分页，失败时不返回不完整快照。
func (service *Service) ListSellerOrders(ctx context.Context) ([]model.XianyuOrder, error) {
	client, name, err := service.loadClient(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		saveCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		_ = service.saveCookie(saveCtx, client.CookieHeader(), name, client.CredentialVersion())
	}()
	orders := []model.XianyuOrder{}
	seen := map[string]bool{}
	for page := 1; page <= 1000; page++ {
		var response struct {
			Module struct {
				Items []json.RawMessage `json:"items"`
				Total json.RawMessage   `json:"totalCount"`
				Next  json.RawMessage   `json:"nextPage"`
			} `json:"module"`
		}
		if err := client.Call(ctx, sellerOrderListAPI, "1.0", map[string]any{"pageNumber": page, "rowsPerPage": 20, "orderIds": "", "queryCode": "ALL", "orderSearchParam": "{}"}, &response); err != nil {
			return nil, fmt.Errorf("读取订单第%d页：%w", page, err)
		}
		before := len(orders)
		for _, raw := range response.Module.Items {
			order, err := ParseSellerOrder(raw)
			if err != nil {
				return nil, err
			}
			if !seen[order.OrderID] {
				seen[order.OrderID] = true
				orders = append(orders, order)
			}
		}
		total := orderInteger(response.Module.Total)
		if total > 0 && len(orders) >= total {
			return orders, nil
		}
		if len(response.Module.Items) == 0 {
			if total > len(orders) {
				return nil, fmt.Errorf("订单分页不完整：预期%d，实际%d", total, len(orders))
			}
			return orders, nil
		}
		if len(orders) == before {
			return nil, fmt.Errorf("订单分页重复，已停止同步")
		}
		if total == 0 && len(response.Module.Items) < 20 {
			return orders, nil
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Second):
		}
	}
	return nil, fmt.Errorf("订单超过分页上限，同步已停止")
}

// ParseSellerOrder 映射订单及收货信息，保留平台返回的原始脱敏形式。
func ParseSellerOrder(raw json.RawMessage) (model.XianyuOrder, error) {
	var row struct {
		Common struct {
			OrderID, ItemID                         orderIdentifier
			OrderStatus, CreateTime, PaySuccessTime string
		} `json:"commonData"`
		Item struct {
			Title, ItemPicURL, IconURL string
			ItemInfoLines              []struct{ Key, Value string }
		} `json:"itemVO"`
		Buyer struct{ UserNick, Name, Phone, Address string }                     `json:"buyerInfoVO"`
		Price struct{ TotalPrice, ConfirmFee, RefundFee, BuyNum orderIdentifier } `json:"priceVO"`
	}
	if err := json.Unmarshal(raw, &row); err != nil {
		return model.XianyuOrder{}, err
	}
	if row.Common.OrderID == "" {
		return model.XianyuOrder{}, fmt.Errorf("闲鱼返回订单缺少订单编号")
	}
	gross, err := orderYuanCents(string(row.Price.TotalPrice))
	if err != nil {
		return model.XianyuOrder{}, err
	}
	confirmed, err := orderYuanCents(string(row.Price.ConfirmFee))
	if err != nil {
		return model.XianyuOrder{}, err
	}
	refund, err := orderYuanCents(string(row.Price.RefundFee))
	if err != nil {
		return model.XianyuOrder{}, err
	}
	status := model.FinancePending
	switch row.Common.OrderStatus {
	case "交易成功":
		status = model.FinanceCompleted
	case "交易关闭":
		status = model.FinanceClosed
	}
	quantity, _ := strconv.ParseInt(string(row.Price.BuyNum), 10, 64)
	specs := []string{}
	for _, line := range row.Item.ItemInfoLines {
		specs = append(specs, line.Value)
	}
	itemNo := ""
	matches := financeItemNoPattern.FindAllString(row.Item.Title, -1)
	if len(matches) > 0 {
		itemNo = strings.ToUpper(matches[len(matches)-1])
	}
	date := row.Common.CreateTime
	if len(date) >= 10 {
		date = date[:10]
	}
	return model.XianyuOrder{OrderID: string(row.Common.OrderID), ItemID: string(row.Common.ItemID), ItemNo: itemNo, Title: row.Item.Title, ImageURL: row.Item.ItemPicURL, BuyerNickname: row.Buyer.UserNick, RecipientName: row.Buyer.Name, RecipientPhone: row.Buyer.Phone, RecipientAddress: row.Buyer.Address, Size: strings.Join(specs, " / ") + fmt.Sprintf(" · %d件", quantity), Status: status, PlatformStatus: row.Common.OrderStatus, IsWorryFree: isWorryFreeOrderIcon(row.Item.IconURL), TagIconURL: row.Item.IconURL, Date: date, CreatedTime: row.Common.CreateTime, PaidTime: row.Common.PaySuccessTime, GrossCents: gross, ConfirmedCents: confirmed, RefundCents: refund, Quantity: quantity}, nil
}

// isWorryFreeOrderIcon 根据已核对的徽标文件识别，兼容CDN参数。
func isWorryFreeOrderIcon(iconURL string) bool {
	parsed, err := url.Parse(iconURL)
	return err == nil && strings.HasSuffix(parsed.Path, worryFreeBadgeFile)
}

// orderIdentifier 兼容字符串和数字ID，并保留大整数精度。
type orderIdentifier string

func (id *orderIdentifier) UnmarshalJSON(raw []byte) error {
	if string(raw) == "null" {
		*id = ""
		return nil
	}
	if len(raw) > 0 && raw[0] == '"' {
		var value string
		if err := json.Unmarshal(raw, &value); err != nil {
			return err
		}
		*id = orderIdentifier(value)
		return nil
	}
	var value json.Number
	if err := json.Unmarshal(raw, &value); err != nil {
		return err
	}
	*id = orderIdentifier(value.String())
	return nil
}

// orderYuanCents 用整数处理平台字符串元金额，避免浮点误差和静默归零。
func orderYuanCents(value string) (int64, error) {
	if value == "" {
		return 0, nil
	}
	parts := strings.Split(value, ".")
	if len(parts) > 2 {
		return 0, fmt.Errorf("订单金额格式错误")
	}
	yuan, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil || yuan < 0 || yuan > 100000000 {
		return 0, fmt.Errorf("订单金额无效")
	}
	fraction := "00"
	if len(parts) == 2 {
		fraction = parts[1] + "00"
		fraction = fraction[:2]
	}
	cents, err := strconv.ParseInt(fraction, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("订单金额小数无效")
	}
	return yuan*100 + cents, nil
}
func orderInteger(raw json.RawMessage) int {
	var value any
	_ = json.Unmarshal(raw, &value)
	count, _ := strconv.Atoi(stringValue(value))
	return count
}
