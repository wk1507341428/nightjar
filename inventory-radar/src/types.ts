/** 搜索方式。 */
export type SearchMode = 'name' | 'itemNo';

/** 奥莱地区。 */
export interface RegionOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
}

/** 商品规格值。 */
export interface ProductSpecValue {
  spec_name?: string;
  spec_value_name?: string;
}

/** 商品 SKU。 */
export interface ProductSku {
  item_id?: string;
  price?: string;
  activity_price?: string | number;
  act_price?: string | number;
  market_price?: string;
  store?: string | number;
  sales?: string | number;
  approve_status?: string;
  item_spec?: ProductSpecValue[];
  erp_sku_code?: string;
  sku_img_url?: string;
}

/** 商品所属门店。 */
export interface DistributorInfo {
  name?: string;
  shop_code?: string;
  unit_number?: string;
  regionauth_id?: string;
}

/** 商品搜索结果。 */
export interface ProductSummary {
  goods_id?: string;
  item_id?: string;
  default_item_id?: string;
  item_no?: string;
  item_name?: string;
  goods_brand?: string;
  price?: string;
  market_price?: string;
  discount_rate?: string | number;
  activity_price?: string | number;
  act_price?: string | number;
  activity_type?: string;
  promotion_start_time?: string | number;
  promotion_end_time?: string | number;
  seckill_start_time?: string | number;
  seckill_collection_id?: string;
  store?: string | number;
  item_total_store?: string | number;
  sales?: string | number;
  regionauth_id?: string;
  main_img?: string;
  pics?: string[];
  distributor_info?: DistributorInfo;
  spec_items?: ProductSku[];
}

/** 品牌门店筛选项。 */
export interface BrandOption {
  value: string;
  label: string;
  shopCode?: string;
  distributorIdsByRegion?: Record<string, string>;
  distributorIds?: string[];
}

/** 商品详情。 */
export interface ProductDetail extends ProductSummary {
  store_code?: string;
  approve_status?: string;
  audit_status?: string;
  intro?: string;
  service_interest_tag_list?: Array<{
    tagName?: string;
    tagDesc?: string;
  }>;
}

/** 秒杀活动场次。 */
export interface SeckillActivity {
  id: string;
  name: string;
  status: 'ongoing' | 'waiting' | string;
  startTime: number;
  endTime: number;
  regionId: string;
}

/** 秒杀商品聚合接口响应。 */
export interface SeckillProductsResponse {
  regionId: string;
  activities: SeckillActivity[];
  list: ProductSummary[];
  total: number;
}

/** 秒杀专区查询状态。 */
export interface SeckillState {
  products: ProductSummary[];
  activities: SeckillActivity[];
  total: number;
  page: number;
  isLoading: boolean;
  errorMessage: string;
}

/** 列表接口响应。 */
export interface ProductSearchResponse {
  data?: {
    total_count?: number;
    list?: ProductSummary[];
  };
  message?: string;
}

/** 商详接口响应。 */
export interface ProductDetailResponse {
  data?: ProductDetail;
  message?: string;
}

/** 搜索结果状态。 */
export interface ProductSearchState {
  products: ProductSummary[];
  similarProducts: ProductSummary[];
  total: number;
  page: number;
  hasSearched: boolean;
  isLoading: boolean;
  errorMessage: string;
  updatedAt: string;
}

/** 最近查询记录。 */
export interface RecentSearch {
  query: string;
  mode: SearchMode;
  regionId: string;
}

/** 闲鱼账号连接状态。 */
export interface XianyuConnection {
	platform: string;
	status: 'not_connected' | 'waiting_login' | 'connected' | 'verification_required';
	authenticated: boolean;
	lastVerifiedAt?: string;
	message?: string;
}

/** 第三方渠道当前在售商品。 */
export interface MarketplaceListing {
	id: string;
	platform: 'xianyu' | 'taobao' | 'pinduoduo' | string;
	platformItemId: string;
	sourceItemId?: string;
	itemNo?: string;
	title: string;
	priceCents: number;
	imageUrl?: string;
	itemUrl?: string;
	listedAt: string;
	lastSyncedAt: string;
}

/** 渠道当前在售列表响应。 */
export interface MarketplaceListingListResponse {
	list: MarketplaceListing[];
	total: number;
	lastSyncedAt?: string;
}

/** 渠道手动同步响应。 */
export interface MarketplaceSyncResponse {
	platform: string;
	syncedCount: number;
	lastSyncedAt: string;
}

/** 闲鱼发布任务状态。 */
export type PublishTaskStatus =
	| 'queued'
	| 'preparing'
	| 'publishing'
	| 'needs_login'
	| 'succeeded'
	| 'failed';

/** 创建闲鱼发布任务参数。 */
export interface CreatePublishTaskRequest {
	sourceItemId: string;
	itemNo: string;
	title: string;
	description: string;
	priceCents: number;
	originalPriceCents: number;
	imageUrls: string[];
	regionId: string;
	brand: string;
	condition: string;
	availableSizes: string[];
	isFootwear: boolean;
}

/** 闲鱼发布任务。 */
export interface PublishTask {
	id: string;
	status: PublishTaskStatus;
	itemNo: string;
	title: string;
	priceCents: number;
	xianyuItemId?: string;
	xianyuUrl?: string;
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
}
