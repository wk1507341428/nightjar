#!/usr/bin/env node

// 用法：设置 DEWU_PASSPORT_TOKEN、DEWU_SK 和可选的 DEWU_COOKIE 后运行本脚本。
// 脚本只调用查询接口，结果支持缓存续跑；遇到得物 HTTP 485 会立即停止。

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const CATALOG_API = 'https://aiopro.fvo2o.com/api/h5app/wxapp';
const DEWU_API = 'https://stark.dewu.com/api/v1/h5';
const CATALOG_APP_ID = 'wx8fa740aa841dafb4';
const DEWU_SIGN_SALT = '048a9c4943398714b356a696503d2d36';

const NIKE_STORES = [
  { regionId: '2', distributorId: '1574', regionName: '京津' },
  { regionId: '3', distributorId: '178', regionName: '上海' },
  { regionId: '4', distributorId: '4175', regionName: '广佛' },
  { regionId: '5', distributorId: '3636', regionName: '成都' },
  { regionId: '6', distributorId: '3566', regionName: '武汉' },
  { regionId: '7', distributorId: '614', regionName: '重庆' },
];

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    const next = argv[index + 1];
    values[key] = next && !next.startsWith('--') ? (index += 1, next) : true;
  }
  return values;
}

const args = parseArgs(process.argv.slice(2));
const outputPath = path.resolve(String(args.output || 'outputs/nike-dewu-profit-data.json'));
const cachePath = path.resolve(String(args.cache || 'runtime/dewu-nike-profit-cache.json'));
const concurrency = Math.max(1, Math.min(12, Number(args.concurrency || process.env.DEWU_CONCURRENCY || 6)));
const dewuRequestDelay = Math.max(0, Number(process.env.DEWU_REQUEST_DELAY_MS || 200));
const passportToken = process.env.DEWU_PASSPORT_TOKEN || '';
const securityKey = process.env.DEWU_SK || '';
const sysCode = process.env.DEWU_SYS_CODE || 'DEWU_MERCHANT_PLATFORM_DU_USER_T';

if (!passportToken || !securityKey) {
  throw new Error('请设置 DEWU_PASSPORT_TOKEN 和 DEWU_SK');
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJSON(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20_000) });
      const payload = await response.json();
      if (response.status === 485) {
        const rateLimitError = new Error('HTTP 485：得物触发人机校验，请提供新的完整 curl 后继续');
        rateLimitError.code = 'DEWU_RATE_LIMIT';
        throw rateLimitError;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(attempt * 800);
    }
  }
  throw lastError;
}

function catalogURL(route, query) {
  const url = new URL(`${CATALOG_API}${route}`);
  for (const [key, value] of Object.entries({ ...query, company_id: '1' })) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchCatalogPage(store, page, pageSize = 50) {
  const payload = await fetchJSON(catalogURL('/goods/items', {
    regionauth_id: store.regionId,
    distributor_id: store.distributorId,
    page,
    pageSize,
    keywords: '',
    approve_status: 'onsale,only_show',
    item_type: 'normal',
    is_point: 'false',
  }), { headers: { Accept: 'application/json', 'authorizer-appid': CATALOG_APP_ID } });
  if (payload?.data?.status_code >= 400) throw new Error(payload.data.message || '小程序商品列表读取失败');
  return { list: payload?.data?.list || [], total: Number(payload?.data?.total_count || 0) };
}

async function fetchCatalogStore(store) {
  const firstPage = await fetchCatalogPage(store, 1);
  const pageCount = Math.ceil(firstPage.total / 50);
  const pages = [firstPage.list];
  for (let page = 2; page <= pageCount; page += 1) pages.push((await fetchCatalogPage(store, page)).list);
  return pages.flat().map((product) => ({ ...product, _regionId: store.regionId, _regionName: store.regionName }));
}

function dewuValue(value) {
  if (value === undefined || value === null || value === '') return '';
  if (Array.isArray(value)) {
    return value.map((entry) => typeof entry === 'object' ? JSON.stringify(entry) : String(entry)).join(',');
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function signedBody(body) {
  const source = Object.keys(body).sort().map((key) => `${key}${dewuValue(body[key])}`).join('') + DEWU_SIGN_SALT;
  return { ...body, sign: crypto.createHash('md5').update(source).digest('hex') };
}

const dewuHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
  Origin: 'https://stark.dewu.com',
  Referer: 'https://stark.dewu.com/main/businessApp/opportunitySearch',
  SK: securityKey,
  appid: 'h5',
  channel: 'pc',
  clientId: 'stark',
  passportToken,
  platform: 'h5',
  sysCode,
  Cookie: `sk=${securityKey}; clientId=stark; sysCode=${sysCode}; channel=pc; mchToken=${passportToken}`,
};

if (process.env.DEWU_COOKIE) dewuHeaders.Cookie = process.env.DEWU_COOKIE;

async function postDewu(route, body) {
  const payload = await fetchJSON(`${DEWU_API}${route}`, {
    method: 'POST',
    headers: dewuHeaders,
    body: JSON.stringify(signedBody(body)),
  });
  if (payload?.code !== 200) throw new Error(payload?.msg || `得物接口返回 ${payload?.code}`);
  return payload.data;
}

async function loadCache() {
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(cache));
}

function normalizedItemNo(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizedSpec(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/⅓/g, '1/3')
    .replace(/⅔/g, '2/3');
}

function firstPositive(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function skuSpecs(rawSKU) {
  return Array.isArray(rawSKU?.item_spec) ? rawSKU.item_spec : [];
}

function skuSize(rawSKU) {
  const specs = skuSpecs(rawSKU);
  const preferred = specs.find((entry) => /尺码|尺寸|型号|规格/.test(String(entry?.spec_name || '')));
  const fallback = specs.find((entry) => !/颜色/.test(String(entry?.spec_name || '')));
  return String((preferred || fallback)?.spec_value_name || '').trim();
}

function skuColor(rawSKU) {
  return String(skuSpecs(rawSKU).find((entry) => /颜色/.test(String(entry?.spec_name || '')))?.spec_value_name || '').trim();
}

function sourceRows(products) {
  const rows = [];
  for (const product of products) {
    const itemNo = normalizedItemNo(product.item_no);
    if (!itemNo) continue;
    const productPrice = firstPositive(product.activity_price, product.act_price, product.price);
    for (const sku of Array.isArray(product.spec_items) ? product.spec_items : []) {
      const stock = Number(sku.store || 0);
      if (stock <= 0 || !['onsale', 'instock'].includes(String(sku.approve_status || '').toLowerCase())) continue;
      rows.push({
        itemNo,
        title: String(product.item_name || '').trim(),
        category: (product.item_category_main || []).map((entry) => entry.category_name).filter(Boolean).join('/'),
        sourceSize: skuSize(sku),
        sourceColor: skuColor(sku),
        sourcePriceCents: firstPositive(sku.activity_price, sku.act_price, sku.price, productPrice),
        sourceMarketPriceCents: firstPositive(sku.market_price, product.market_price),
        sourceStock: stock,
        regionId: product._regionId,
        regionName: product._regionName,
        sourceSKUId: String(sku.item_id || ''),
        imageURL: String(sku.sku_img_url || product.main_img || ''),
      });
    }
  }
  return rows;
}

function mergeSourceRows(rows) {
  const merged = new Map();
  for (const row of rows) {
    const key = `${row.itemNo}\u0000${normalizedSpec(row.sourceSize)}\u0000${normalizedSpec(row.sourceColor)}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...row, regions: [row.regionName], sourceStock: row.sourceStock });
      continue;
    }
    existing.sourceStock += row.sourceStock;
    if (!existing.regions.includes(row.regionName)) existing.regions.push(row.regionName);
    if (row.sourcePriceCents < existing.sourcePriceCents) {
      existing.sourcePriceCents = row.sourcePriceCents;
      existing.regionId = row.regionId;
      existing.regionName = row.regionName;
      existing.sourceSKUId = row.sourceSKUId;
    }
  }
  return [...merged.values()];
}

function dewuSKUs(detail) {
  return (detail?.commodityInfo?.skuPropInfos || []).map((sku) => ({
    dewuSKUId: String(sku.skuId || ''),
    dewuSize: String((sku.props || []).find((entry) => entry.name === '尺码')?.value || sku.fullProp || '').trim(),
    platformMinPriceCents: Number(sku.platformMinPrice || 0),
    estimatedNetCents: Number(sku.estimateNetPrice || 0),
    monthlySales: Number(sku.payOrderCntTotalL30d?.value || 0),
    biddingAuth: sku.biddingAuth !== false,
    dewuTags: (sku.skuTags || []).map((tag) => tag.tagName).filter(Boolean),
  }));
}

async function queryDewuItem(itemNo) {
  if (dewuRequestDelay > 0) await wait(dewuRequestDelay);
  const search = await postDewu('/merchant-tools/productSelect/search/getSearchProductPage', {
    keyword: itemNo,
    biddingType: '0',
    sortCode: 'comprehensive',
    pageCode: 'SEARCH',
    pageNum: 1,
    pageSize: 14,
  });
  const exact = (search.contents || []).find((product) => normalizedItemNo(product.articleNumber) === itemNo);
  if (!exact) return { status: 'product_not_found', candidates: (search.contents || []).map((entry) => entry.articleNumber) };
  const detail = await postDewu('/biz/bid/merchant/aggregate/query/bidConfirmToBp', {
    spuId: exact.spuId,
    bizSceneCode: 110,
    bidTypes: ['0', '1', '15', '5'],
  });
  return {
    status: 'ok',
    spuId: String(exact.spuId),
    dewuTitle: String(exact.productName || ''),
    totalMonthlySales: Number(exact.platSalesCnt30d || 0),
    skus: dewuSKUs(detail),
  };
}

async function mapConcurrent(values, worker, limit) {
  const results = new Array(values.length);
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
  return results;
}

function compareRows(sourceSKU, dewuResult) {
  if (dewuResult?.status === 'error') {
    return { ...sourceSKU, matchStatus: '得物接口受限', error: dewuResult.error || '', profitable: false };
  }
  if (!dewuResult || dewuResult.status !== 'ok') {
    return { ...sourceSKU, matchStatus: '得物无精确商品', profitable: false };
  }
  const normalizedSourceSize = normalizedSpec(sourceSKU.sourceSize);
  const match = dewuResult.skus.find((sku) => normalizedSpec(sku.dewuSize) === normalizedSourceSize);
  if (!match) {
    return { ...sourceSKU, spuId: dewuResult.spuId, dewuTitle: dewuResult.dewuTitle, totalMonthlySales: dewuResult.totalMonthlySales, matchStatus: '得物尺码未匹配', profitable: false };
  }
  const grossProfitCents = match.estimatedNetCents - sourceSKU.sourcePriceCents;
  let matchStatus = '可卖但不盈利';
  if (!match.platformMinPriceCents) matchStatus = '得物该尺码缺货';
  else if (!match.biddingAuth) matchStatus = '得物不可出价';
  else if (grossProfitCents > 0) matchStatus = '可卖且盈利';
  return {
    ...sourceSKU,
    ...match,
    spuId: dewuResult.spuId,
    dewuTitle: dewuResult.dewuTitle,
    totalMonthlySales: dewuResult.totalMonthlySales,
    grossProfitCents,
    profitRate: sourceSKU.sourcePriceCents > 0 ? grossProfitCents / sourceSKU.sourcePriceCents : null,
    matchStatus,
    profitable: matchStatus === '可卖且盈利',
  };
}

console.log('读取 NIKE 六地区实时货源...');
const storeResults = await Promise.all(NIKE_STORES.map(async (store) => {
  const products = await fetchCatalogStore(store);
  console.log(`${store.regionName}: ${products.length} 个商品`);
  return products;
}));
const products = storeResults.flat();
const mergedSKUs = mergeSourceRows(sourceRows(products));
const itemNos = [...new Set(mergedSKUs.map((row) => row.itemNo))].sort();
console.log(`实时商品 ${products.length} 个，合并后 ${itemNos.length} 个货号、${mergedSKUs.length} 个货源 SKU`);

const cache = await loadCache();
let cacheSave = Promise.resolve();
let completed = 0;
await mapConcurrent(itemNos, async (itemNo) => {
  if (!cache[itemNo] || (cache[itemNo].status === 'error' && !args['skip-errors']) || args.refresh) {
    try {
      cache[itemNo] = await queryDewuItem(itemNo);
    } catch (error) {
      if (error.code === 'DEWU_RATE_LIMIT') throw error;
      cache[itemNo] = { status: 'error', error: error.message };
    }
    cacheSave = cacheSave.then(() => saveCache(cache));
    await cacheSave;
  }
  completed += 1;
  if (completed % 10 === 0 || completed === itemNos.length) console.log(`得物查询进度 ${completed}/${itemNos.length}`);
}, concurrency);

const rows = mergedSKUs.map((row) => compareRows(row, cache[row.itemNo]));
rows.sort((left, right) => Number(right.profitable) - Number(left.profitable) || (right.grossProfitCents || -Infinity) - (left.grossProfitCents || -Infinity) || right.monthlySales - left.monthlySales || left.itemNo.localeCompare(right.itemNo));
const generatedAt = new Date().toISOString();
const result = {
  generatedAt,
  methodology: '毛利=得物预计到手-小程序当前采购价；得物费用已包含在预计到手中',
  sourceStores: NIKE_STORES.map((store, index) => ({ ...store, productCount: storeResults[index].length })),
  summary: {
    productCount: products.length,
    uniqueItemCount: itemNos.length,
    sourceSKUCount: rows.length,
    matchedSKUCount: rows.filter((row) => row.dewuSKUId).length,
    profitableSKUCount: rows.filter((row) => row.profitable).length,
    profitableItemCount: new Set(rows.filter((row) => row.profitable).map((row) => row.itemNo)).size,
    dewuProductNotFoundCount: new Set(rows.filter((row) => row.matchStatus === '得物无精确商品').map((row) => row.itemNo)).size,
  },
  rows,
};
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
console.log(`数据已保存：${outputPath}`);
