import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { transformWithOxc } from 'vite';

/** 编译真实 API，替换 fetch 后测试本地请求与并发去重。 */
async function loadCategoryAPI(fetch) {
  const source = fs.readFileSync(new URL('../src/api.ts', import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, 'api.ts', { lang: 'ts' });
  const moduleExports = {};
  vm.runInNewContext(code.replace(/^import .*;$/gm, '').replace(/export /g, '') + '\nexports.fetchSyncedProfileCategories = fetchSyncedProfileCategories;', {
    exports: moduleExports, URL, URLSearchParams, SIDEJOB_API_BASE_URL: '/api', PRODUCT_PAGE_SIZE: 30,
    window: { location: { origin: 'http://localhost:9300' } }, fetch,
  });
  return moduleExports;
}

test('同一品牌并发读取只发一条 profile 请求，保留全部品类原始 ID 和图片', async () => {
  const requests = [];
  let release;
  const pendingResponse = new Promise((resolve) => { release = resolve; });
  const categories = [{ id: '27', name: '运动鞋靴', sourceIds: ['27', '326'], imageUrl: 'saved.png' }];
  const api = await loadCategoryAPI(async (url) => {
    requests.push(String(url));
    await pendingResponse;
    return { ok: true, json: async () => categories };
  });
  const first = api.fetchSyncedProfileCategories('adidas');
  const second = api.fetchSyncedProfileCategories('adidas');
  assert.equal(first, second);
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0]).search, '?brandProfileId=adidas');
  release();
  const result = await first;
  assert.equal(result[0].id, categories[0].id);
  assert.deepEqual(Array.from(result[0].sourceIds), categories[0].sourceIds);
  assert.equal(result[0].imageUrl, categories[0].imageUrl);
  await api.fetchSyncedProfileCategories('adidas');
  assert.equal(requests.length, 2, '完成后下一次编辑必须读取最新快照，不能永久缓存');
});

test('地区同名品类只展示一次，保存展开所有 ID，图片可以由其他地区补足', async () => {
  const api = await loadCategoryAPI(async () => ({ ok: true, json: async () => [
    { id: '27', name: '运动鞋靴' },
    { id: '326', name: '运动鞋靴', imageUrl: 'saved.png' },
    { id: '777', name: '运动鞋靴', sourceIds: ['777', '888'] },
  ] }));
  const categories = await api.fetchSyncedProfileCategories('nike');
  assert.equal(categories.length, 1);
  assert.deepEqual(Array.from(categories[0].sourceIds), ['27', '326', '777', '888']);
  assert.equal(categories[0].imageUrl, 'saved.png');
});

test('未同步错误不被吞为暂无品类，并允许再次请求成功空品类', async () => {
  let requestCount = 0;
  const api = await loadCategoryAPI(async () => {
    requestCount += 1;
    if (requestCount === 1) return { ok: false, status: 409, json: async () => ({ message: '该品牌尚未完成同步，请先到同步中心同步' }) };
    return { ok: true, json: async () => [] };
  });
  await assert.rejects(api.fetchSyncedProfileCategories('coach'), /尚未完成同步/);
  assert.deepEqual(Array.from(await api.fetchSyncedProfileCategories('coach')), []);
  assert.equal(requestCount, 2);
});

test('发布中心和方案编辑不得触发实时品牌维护或逐门店品类读取', () => {
  for (const filename of ['PublishCenterPage.tsx', 'PublishPresetDrawer.tsx']) {
    const source = fs.readFileSync(new URL(`../src/${filename}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /fetchBrandMaintenance/);
    assert.doesNotMatch(source, /members\.map\([^\n]*fetchLiveBrandCategories/);
    assert.match(source, /fetchSyncedProfileCategories/);
    assert.match(source, /暂无品类/);
    assert.doesNotMatch(source, /正在聚合品类/);
  }
});
