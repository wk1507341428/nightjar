package model

const MarketplaceStatusUnknown = "unknown"

// ObservedMarketplaceStatus never interprets an undocumented platform state as a reusable offline item.
func ObservedMarketplaceStatus(remote string) string {
	switch remote {
	case "0":
		return "onsale"
	case "-2", "-12", "-3", "-11", "1":
		return "off_shelf"
	default:
		return MarketplaceStatusUnknown
	}
}
