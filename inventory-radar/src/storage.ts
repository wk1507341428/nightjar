import type { RecentSearch } from './types';

/** 最近搜索缓存键。 */
const RECENT_SEARCHES_KEY = 'sidejob-stock-room:recent-searches:v1';

/** 最近搜索最大保存数量。 */
const MAX_RECENT_SEARCHES = 6;

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
