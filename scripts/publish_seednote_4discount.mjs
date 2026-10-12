#!/usr/bin/env node

/**
 * 将佛罗伦萨小镇实时货源按既定规则发布到种草相册。
 *
 * 默认仅预览；加入 --execute 才会实际上传图片和创建商品。
 * 会话从 sidejob-redis 的 sidejob:seednote:session 读取，发布进度写入 runtime/。
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const statePath = path.join(projectDir, "runtime", "seednote_publish_4discount_state.json");
const liveApi = "https://aiopro.fvo2o.com/api/h5app/wxapp";
const seednoteApi = "https://www.wsxcme.com";
const appId = "wxdae25860edcf5e1a";
const regionNames = { "2": "京津", "3": "上海", "4": "广佛", "5": "成都", "6": "武汉", "7": "重庆" };

const selectedProfiles = [
  { name: "NIKE-多地区", categories: null },
  { name: "ADIDAS-合并", categories: ["27", "125", "215", "133"] },
  { name: "ANTA KIDS - 聚合", categories: ["27", "215"] },
  { name: "ANTA - 聚合", categories: ["27", "215"] },
  { name: "中国李宁-合并", categories: ["27", "215", "133", "125"] },
  { name: "NEW BALANCE - 合并", categories: null },
];

const argv = new Set(process.argv.slice(2));
const execute = argv.has("--execute");
const reportOnly = argv.has("--report");
const parsedLimit = Number([...argv].find((value) => value.startsWith("--limit="))?.slice(8));
const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : Number.POSITIVE_INFINITY;
const reportStats = { highPriceItems: new Map() };

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const toYuan = (cents) => Number(cents ?? 0) / 100;
const firstPositive = (...values) => values.map(Number).find((value) => Number.isFinite(value) && value > 0) ?? 0;
const unique = (items) => [...new Set(items.filter(Boolean))];

function readSeednoteSession() {
  const raw = execFileSync("docker", ["exec", "sidejob-redis", "redis-cli", "GET", "sidejob:seednote:session"], { encoding: "utf8" }).trim();
  if (!raw) throw new Error("种草相册会话不存在或已过期，请先刷新本机会话。");
  const session = JSON.parse(raw);
  if (!session.token || !session.shopId) throw new Error("种草相册会话不完整。");
  return session;
}

async function requestJson(url, options = {}, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(attempt * 500);
    }
  }
  throw lastError;
}

async function concurrentMap(items, worker, concurrency = 6) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

function listUrl(member, page, categoryId) {
  const url = new URL(`${liveApi}/goods/items`);
  url.searchParams.set("company_id", "1");
  url.searchParams.set("regionauth_id", member.regionId);
  url.searchParams.set("distributor_id", member.distributorId);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("approve_status", "onsale,only_show");
  url.searchParams.set("item_type", "normal");
  url.searchParams.set("is_point", "false");
  if (categoryId) url.searchParams.set("main_category", categoryId);
  return url.toString();
}

async function fetchMemberProducts(member, categoryId) {
  const first = await requestJson(listUrl(member, 1, categoryId));
  const firstList = first?.data?.list ?? [];
  const pageCount = Math.max(1, Math.ceil(Number(first?.data?.total_count ?? firstList.length) / 50));
  const pages = Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
  const rest = await concurrentMap(pages, async (page) => {
    const response = await requestJson(listUrl(member, page, categoryId));
    return response?.data?.list ?? [];
  }, 5);
  return firstList.concat(rest.flat());
}

function stockForProduct(product) {
  const directStock = Number(product.item_total_store ?? product.store ?? 0);
  if (directStock > 0) return directStock;
  return (product.spec_items ?? []).reduce((sum, sku) => sum + Math.max(0, Number(sku.store ?? 0)), 0);
}

function categoryName(product, selectedCategoryIds) {
  const categories = product.item_category_main ?? [];
  return categories.find((category) => selectedCategoryIds?.includes(String(category.category_id)))?.category_name ?? categories.at(-1)?.category_name ?? "未分类";
}

function variantLabel(sku) {
  const values = (sku.item_spec ?? [])
    .map((spec) => ({ name: String(spec.spec_name ?? ""), value: String(spec.spec_custom_value_name || spec.spec_value_name || "").trim() }))
    .filter((spec) => spec.value && !(spec.name.includes("颜色") && spec.value === "颜色如图"));
  return values.map((spec) => spec.value).join(" / ");
}

function createCandidate(profile, products) {
  const itemsByNo = new Map();
  for (const product of products) {
    const itemNo = String(product.item_no ?? "").trim();
    const sourcePrice = toYuan(firstPositive(product.activity_price, product.act_price, product.price));
    const originalPrice = toYuan(product.market_price);
    const stock = stockForProduct(product);
    if (itemNo && originalPrice >= 100 && stock > 0 && sourcePrice >= 1000) {
      const discountRate = sourcePrice / originalPrice;
      const observed = reportStats.highPriceItems.get(itemNo) ?? { hasDiscountBelow4: false, hasDiscountAtOrAbove4: false, minDiscountRate: discountRate };
      observed.minDiscountRate = Math.min(observed.minDiscountRate, discountRate);
      if (discountRate < 0.4) observed.hasDiscountBelow4 = true;
      else observed.hasDiscountAtOrAbove4 = true;
      reportStats.highPriceItems.set(itemNo, observed);
    }
    if (!itemNo || sourcePrice <= 0 || originalPrice < 100 || stock <= 0) continue;
    const discountRate = sourcePrice / originalPrice;
    if (discountRate >= 0.4) continue;
    const existing = itemsByNo.get(itemNo) ?? {
      brand: profile.name,
      itemNo,
      title: String(product.item_name ?? ""),
      originalPrice,
      sourcePrice,
      discountRate,
      stock: 0,
      regions: new Set(),
      categories: new Set(),
      sourceProducts: [],
      variants: new Map(),
    };
    existing.stock += stock;
    existing.regions.add(regionNames[String(product.regionauth_id ?? "")] ?? String(product.regionauth_id ?? ""));
    existing.categories.add(categoryName(product, profile.categories));
    existing.sourceProducts.push(product);
    for (const sku of product.spec_items ?? []) {
      const skuStock = Number(sku.store ?? 0);
      const label = variantLabel(sku);
      if (skuStock > 0 && label) existing.variants.set(label, (existing.variants.get(label) ?? 0) + skuStock);
    }
    if (sourcePrice < existing.sourcePrice) {
      existing.title = String(product.item_name ?? existing.title);
      existing.sourcePrice = sourcePrice;
      existing.originalPrice = originalPrice;
      existing.discountRate = discountRate;
      existing.primaryProduct = product;
    }
    itemsByNo.set(itemNo, existing);
  }
  return [...itemsByNo.values()]
    .map((item) => ({ ...item, regions: [...item.regions].sort(), categories: [...item.categories].sort(), variants: [...item.variants.entries()].map(([label, stock]) => ({ label, stock })).slice(0, 32) }))
    .sort((left, right) => left.discountRate - right.discountRate || left.sourcePrice - right.sourcePrice || left.itemNo.localeCompare(right.itemNo));
}

async function collectCandidates() {
  const profileData = await requestJson("http://127.0.0.1:9300/api/catalog/brand-maintenance");
  const profiles = profileData.profiles ?? [];
  const output = [];
  for (const config of selectedProfiles) {
    const profile = profiles.find((candidate) => candidate.name === config.name);
    if (!profile) throw new Error(`找不到品牌配置：${config.name}`);
    const jobs = (profile.members ?? []).flatMap((member) => (config.categories ?? [null]).map((categoryId) => ({ member, categoryId })));
    const groups = await concurrentMap(jobs, ({ member, categoryId }) => fetchMemberProducts(member, categoryId), 6);
    const deduped = new Map();
    for (const product of groups.flat()) {
      const key = `${product.regionauth_id}:${product.distributor_id}:${product.item_id ?? product.default_item_id ?? product.goods_id}`;
      deduped.set(key, product);
    }
    output.push(...createCandidate({ ...config, name: profile.name }, [...deduped.values()]));
  }
  return output;
}

function cleanTitle(title, itemNo) {
  let value = String(title ?? "").trim().replace(/^【全新】\s*/, "").replace(/^全新\s*/, "");
  if (itemNo && value.toUpperCase().endsWith(itemNo.toUpperCase())) value = value.slice(0, -itemNo.length).trim();
  return value;
}

function priceMarkup(sourcePrice) {
  // 已确认规则：小程序售价低于 ¥500 的商品加 ¥40。
  if (sourcePrice < 500) return 40;
  if (sourcePrice < 1000) return 60;
  return 80;
}

function formatPrice(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function buildDescription(candidate, suggestedPrice) {
  const variantLine = candidate.variants.length ? `\n有货尺码/型号：${candidate.variants.map((variant) => variant.label).join("、")}` : "";
  return `全新 ${cleanTitle(candidate.title, candidate.itemNo)} ${candidate.itemNo}\n\n货号：${candidate.itemNo}\n原价：¥${formatPrice(candidate.originalPrice)}\n售价：¥${formatPrice(suggestedPrice)}${variantLine}\n发货地区：${candidate.regions.join("、")}\n奥莱正品，支持验货。库存实时变化，下单前请先确认。\n\n【正品保障】商品均来自奥特莱斯正规渠道，全新未穿，支持验货及正规平台鉴定。\n\n【发货时效】商品一般在下单后48小时内发出，最迟不超过72小时。\n\n【快递说明】默认使用顺丰或京东快递包邮，具体以实际发货安排为准。商品均使用纸箱加固包装。`;
}

function apiContext(session) {
  const query = () => new URLSearchParams({ client_type: "miniapp", token: session.token, platform: "ios", platformType: "mac", minicodeBuckup: "1", version: "3491" });
  const headers = { "wego-albumid": session.shopId, "wego-channel": "miniapp", "wego-version": "3491", miniAppId: appId, Cookie: `token=${session.token}` };
  return { query, headers };
}

async function fetchSeednoteDetail(candidate) {
  const source = candidate.primaryProduct ?? candidate.sourceProducts[0];
  const itemId = String(source.item_id ?? source.default_item_id ?? source.goods_id ?? "");
  const regionId = String(source.regionauth_id ?? "");
  if (!itemId || !regionId) return source;
  try {
    const url = new URL(`${liveApi}/goods/items/${encodeURIComponent(itemId)}`);
    url.searchParams.set("company_id", "1");
    url.searchParams.set("regionauth_id", regionId);
    return (await requestJson(url.toString()))?.data ?? source;
  } catch {
    return source;
  }
}

function sourceImages(source) {
  const intro = [...String(source.intro ?? "").matchAll(/https?:\/\/[^"<> ]+/g)].map((match) => match[0].replace(/&amp;/g, "&"));
  return unique([source.main_img, ...(source.pics ?? []), ...intro]).slice(0, 9);
}

class SeednotePublisher {
  constructor(session) {
    this.session = session;
    this.context = apiContext(session);
    this.qiniu = null;
    this.formatIds = new Map();
  }

  async getQiniu() {
    if (this.qiniu && this.qiniu.expiredAt > Date.now() + 60_000) return this.qiniu;
    const response = await requestJson(`${seednoteApi}/common/api/v3/oss/qiniu/wsxcWeb/getToken?${this.context.query()}`, { headers: this.context.headers });
    if (response.errcode !== 0) throw new Error(`获取图片上传凭证失败：${response.errmsg ?? response.errcode}`);
    const result = response.result ?? response;
    this.qiniu = {
      token: result.sessionToken ?? result.uptoken,
      folder: String(result.folder ?? "").replace(/\/?$/, "/"),
      domain: String(result.mappingDomain ?? "https://xcimg.szwego.com").replace(/\/?$/, "/"),
      expiredAt: Number(result.expiredTime ?? 0) * 1000,
    };
    if (!this.qiniu.token) throw new Error("图片上传凭证为空。");
    return this.qiniu;
  }

  async uploadImages(urls, itemNo) {
    const config = await this.getQiniu();
    const uploaded = [];
    for (let index = 0; index < urls.length; index += 1) {
      const image = await fetch(urls[index]);
      if (!image.ok) continue;
      const bytes = await image.arrayBuffer();
      const contentType = (image.headers.get("content-type") ?? "image/jpeg").split(";")[0];
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const key = `${config.folder}sidejob/${Date.now()}-${itemNo}-${index + 1}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const form = new FormData();
      form.append("token", config.token);
      form.append("key", key);
      form.append("name", `${itemNo}-${index + 1}.${ext}`);
      form.append("file", new Blob([bytes], { type: contentType }), `${itemNo}-${index + 1}.${ext}`);
      const response = await fetch("https://upload.qiniup.com/", { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.error) throw new Error(`第${index + 1}张图片上传失败：${payload.error ?? response.status}`);
      uploaded.push(config.domain + (payload.key ?? key));
    }
    if (!uploaded.length) throw new Error("没有可用商品图片，已跳过发布。");
    return uploaded;
  }

  async ensureFormatIds(labels) {
    const pending = unique(labels).filter((label) => !this.formatIds.has(label));
    if (!pending.length) return labels.map((label) => ({ formatName: label, formatId: this.formatIds.get(label) }));
    const fields = { formats: JSON.stringify(pending.map((formatName) => ({ formatName }))) };
    const sign = await this.complianceSign(fields);
    const response = await requestJson(`${seednoteApi}/service/album/album_theme_format_operation.jsp?act=save_format_list&wego_hg_sign=${encodeURIComponent(sign)}&${this.context.query()}`, {
      method: "POST",
      headers: { ...this.context.headers, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
    });
    if (response.errcode !== 0) throw new Error(`创建规格失败：${response.errmsg ?? response.errcode}`);
    for (const format of response.result?.formats ?? []) this.formatIds.set(String(format.formatName), String(format.formatId));
    const missing = pending.filter((label) => !this.formatIds.has(label));
    if (missing.length) throw new Error(`规格创建结果不完整：${missing.join("、")}`);
    return labels.map((label) => ({ formatName: label, formatId: this.formatIds.get(label) }));
  }

  async complianceSign(checkContent) {
    const response = await requestJson(`${seednoteApi}/commodity/api/v3/compliance/sign?${this.context.query()}`, {
      method: "POST",
      headers: { ...this.context.headers, "content-type": "application/json" },
      body: JSON.stringify({ checkContent }),
    });
    if (response.errcode !== 0 || response.result?.state !== 1 || !response.result?.wego_hg_sign) throw new Error(`内容合规校验失败：${response.errmsg ?? response.result?.state ?? response.errcode}`);
    return response.result.wego_hg_sign;
  }

  async alreadyPublished(itemNo) {
    const now = Date.now();
    const form = new URLSearchParams({ albumId: this.session.shopId, searchValue: itemNo, searchImg: "", requestDataType: "itemName", searchQuerySource: "0", searchSource: "", personalTab: "all", page: "1", digitalWatermarkCnt: "0", isDefaultSort: "1", slipType: "1", timestamp: String(now) });
    const response = await requestJson(`${seednoteApi}/commoditysearch/api/v3/search/personal?${this.context.query()}`, {
      method: "POST",
      headers: { ...this.context.headers, "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    return (response.result?.items ?? []).some((item) => String(item.goodsNum ?? "").toUpperCase() === itemNo.toUpperCase());
  }

  async publish(candidate) {
    const markup = priceMarkup(candidate.sourcePrice);
    const suggestedPrice = Number((candidate.sourcePrice + markup).toFixed(2));
    if (await this.alreadyPublished(candidate.itemNo)) return { status: "skipped", reason: "种草相册已有同货号" };
    const source = await fetchSeednoteDetail(candidate);
    const images = await this.uploadImages(sourceImages(source), candidate.itemNo);
    const formats = await this.ensureFormatIds(candidate.variants.map((variant) => variant.label));
    const stockByLabel = new Map(candidate.variants.map((variant) => [variant.label, variant.stock]));
    const skus = formats.map((format) => ({ id: String(format.formatId), name: format.formatName, cname: format.formatName, quantity: 0, stock: String(stockByLabel.get(format.formatName) ?? 0), formatNum: "", weight: "", status: 0, img: images[0] }));
    const title = buildDescription(candidate, suggestedPrice);
    const priceArr = [{ id: "", value: suggestedPrice, priceType: 2, permission: 0, sort: 1, priceName: "售价", tagIds: [] }];
    const payload = { id: "", title, themeType: 0, mainImgs: images, videoUrl: "", videoImg: "", sourceList: [], personal: 0, sources: [], commodityDetailId: "", commodityDetailList: [], goodsNum: candidate.itemNo, subTitle: "", commodityWeight: "", totalStock: String(candidate.stock), formats, colors: [], commodityCampaign: {}, priceActivity: [], skuPriceActivityMap: {}, stockRemarkContent: "", stockRemarkImageUrl: "", scheduleConfigStr: {}, commodityWeightUnit: 0, tags: "", groups: "", groupTags: "", priceArr, wordsPriceArr: [], skus, requestTimeGap: 500 };
    const signCommodity = { itemFormatList: formats, itemName: title, itemPhotoList: images, skus, goodsNum: candidate.itemNo };
    const sign = await this.complianceSign({ commodity: JSON.stringify(signCommodity), checkContentType: 1 });
    const response = await requestJson(`${seednoteApi}/commodity/api/v3/item/save?wego_hg_sign=${encodeURIComponent(sign)}&${this.context.query()}`, {
      method: "POST",
      headers: { ...this.context.headers, "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.errcode !== 0) throw new Error(`保存商品失败：${response.errmsg ?? response.errcode}`);
    const item = response.result?.commodity ?? response.result?.miniappCommodity ?? {};
    return { status: "published", itemId: item.selfGoodsId ?? item.goods_id ?? "", suggestedPrice, imageCount: images.length, skuCount: skus.length };
  }
}

async function loadState() {
  try { return JSON.parse(await fs.readFile(statePath, "utf8")); } catch { return { startedAt: new Date().toISOString(), published: {}, skipped: {}, failed: {} }; }
}

async function saveState(state) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  const temporary = `${statePath}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(state, null, 2));
  await fs.rename(temporary, statePath);
}

async function main() {
  const candidates = await collectCandidates();
  const summary = candidates.reduce((accumulator, candidate) => {
    accumulator[candidate.brand] = (accumulator[candidate.brand] ?? 0) + 1;
    return accumulator;
  }, {});
  const priceBands = candidates.reduce((bands, candidate) => {
    if (candidate.sourcePrice < 100) bands.below100 += 1;
    else if (candidate.sourcePrice < 500) bands.from100To499 += 1;
    else if (candidate.sourcePrice < 1000) bands.from500To999 += 1;
    else bands.from1000 += 1;
    return bands;
  }, { below100: 0, from100To499: 0, from500To999: 0, from1000: 0 });
  const highPriceStats = [...reportStats.highPriceItems.values()].reduce((summary, item) => {
    if (item.hasDiscountBelow4) summary.discountBelow4 += 1;
    if (!item.hasDiscountBelow4 && item.hasDiscountAtOrAbove4) summary.onlyDiscountAtOrAbove4 += 1;
    if (item.minDiscountRate < 0.5) summary.from4To5 += 1;
    else if (item.minDiscountRate < 0.6) summary.from5To6 += 1;
    else if (item.minDiscountRate < 0.7) summary.from6To7 += 1;
    else summary.from7AndAbove += 1;
    return summary;
  }, { sourcePriceAtLeast1000: reportStats.highPriceItems.size, discountBelow4: 0, onlyDiscountAtOrAbove4: 0, from4To5: 0, from5To6: 0, from6To7: 0, from7AndAbove: 0 });
  console.log(JSON.stringify({ mode: reportOnly ? "report" : execute ? "execute" : "dry-run", totalCandidates: candidates.length, byBrand: summary, priceBands, highPriceStats, limit }, null, 2));
  if (reportOnly) return;
  if (!execute) {
    console.log("预览完成。确认执行请运行：node scripts/publish_seednote_4discount.mjs --execute");
    return;
  }
  const session = readSeednoteSession();
  const publisher = new SeednotePublisher(session);
  const state = await loadState();
  let processed = 0;
  for (const candidate of candidates) {
    if (processed >= limit) break;
    if (state.published[candidate.itemNo] || state.skipped[candidate.itemNo]) continue;
    processed += 1;
    try {
      const result = await publisher.publish(candidate);
      if (result.status === "published") state.published[candidate.itemNo] = { ...result, brand: candidate.brand, updatedAt: new Date().toISOString() };
      else state.skipped[candidate.itemNo] = { ...result, brand: candidate.brand, updatedAt: new Date().toISOString() };
      delete state.failed[candidate.itemNo];
      console.log(JSON.stringify({ index: processed, itemNo: candidate.itemNo, brand: candidate.brand, ...result }));
    } catch (error) {
      state.failed[candidate.itemNo] = { brand: candidate.brand, error: error instanceof Error ? error.message : String(error), updatedAt: new Date().toISOString() };
      console.error(JSON.stringify({ index: processed, itemNo: candidate.itemNo, brand: candidate.brand, status: "failed", error: state.failed[candidate.itemNo].error }));
    }
    await saveState(state);
    await sleep(450);
  }
  console.log(JSON.stringify({ finished: true, published: Object.keys(state.published).length, skipped: Object.keys(state.skipped).length, failed: Object.keys(state.failed).length, statePath }));
}

await main();
