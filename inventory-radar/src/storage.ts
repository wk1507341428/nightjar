import type { BrandOption, RecentSearch } from './types';

/** 最近搜索缓存键。 */
const RECENT_SEARCHES_KEY = 'sidejob-stock-room:recent-searches:v1';

/** 最近搜索最大保存数量。 */
const MAX_RECENT_SEARCHES = 6;

/** 地区品牌缓存键前缀。 */
const BRAND_OPTIONS_CACHE_PREFIX = 'sidejob-stock-room:brand-options:v5:';

/** 地区品牌缓存有效期。 */
const BRAND_OPTIONS_CACHE_TTL_MS = 30 * 60 * 1000;

/** 地区品牌缓存读取结果。 */
export interface CachedBrandOptions {
  options: BrandOption[];
  isFresh: boolean;
}

/** 读取最近查询记录。 */
export function loadRecentSearches(): RecentSearch[] {
  try {
    // 本地缓存内容。
    const storedValue = localStorage.getItem(RECENT_SEARCHES_KEY);

    if (!storedValue) {
      return [];
    }

    // 解析后的查询记录。
    const parsedValue = JSON.parse(storedValue) as RecentSearch[];

    return Array.isArray(parsedValue) ? parsedValue.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

/** 保存一条最近查询记录。 */
export function saveRecentSearch(
  currentSearches: RecentSearch[],
  nextSearch: RecentSearch,
): RecentSearch[] {
  // 去重后的查询记录。
  const deduplicatedSearches = currentSearches.filter(
    (search) =>
      search.query !== nextSearch.query ||
      search.mode !== nextSearch.mode ||
      search.regionId !== nextSearch.regionId,
  );
  // 更新后的查询记录。
  const updatedSearches = [nextSearch, ...deduplicatedSearches].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
  } catch {
    // 隐私模式或空间不足时仍允许继续查询。
  }

  return updatedSearches;
}

/** 读取指定地区的品牌门店缓存。 */
export function loadCachedBrandOptions(regionId: string): CachedBrandOptions | null {
  try {
    // 地区品牌缓存内容。
    const storedValue = localStorage.getItem(`${BRAND_OPTIONS_CACHE_PREFIX}${regionId}`);
    if (!storedValue) {
      return null;
    }

    // 解析后的地区品牌缓存。
    const cachedValue = JSON.parse(storedValue) as { savedAt?: number; options?: BrandOption[] };
    if (!Array.isArray(cachedValue?.options)) {
      return null;
    }

    return {
      options: cachedValue.options,
      isFresh: Date.now() - Number(cachedValue?.savedAt ?? 0) < BRAND_OPTIONS_CACHE_TTL_MS,
    };
  } catch {
    return null;
  }
}

/** 保存指定地区的品牌门店缓存。 */
export function saveCachedBrandOptions(regionId: string, options: BrandOption[]): void {
  try {
    localStorage.setItem(
      `${BRAND_OPTIONS_CACHE_PREFIX}${regionId}`,
      JSON.stringify({ savedAt: Date.now(), options }),
    );
  } catch {
    // 隐私模式或空间不足时仍允许继续使用品牌筛选。
  }
}
