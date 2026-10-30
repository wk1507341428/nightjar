import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { transformWithOxc } from 'vite';

/** 编译真实模块，替换网络边界，不访问源站或闲鱼。 */
async function loadModule(filename, exportNames, globals = {}) {
  const source = fs.readFileSync(new URL(`../src/${filename}`, import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, filename, { lang: 'ts' });
  const exports = {};
  vm.runInNewContext(code.replace(/^import .*;$/gm, '').replace(/export /g, '') + `\nObject.assign(exports, {${exportNames.join(',')}});`, { exports, URLSearchParams, ...globals });
  return exports;
}
const SyncStatus = { RUNNING: 'running', COMPLETE: 'complete', FAILED: 'failed', INTERRUPTED: 'interrupted' };
const helpers = await loadModule('syncCenterHelpers.ts', ['getPresetSyncScope', 'getSyncProgress', 'getSyncStatusLabel', 'getSyncProgressStatus', 'sortSyncRunsByUpdatedAt', 'getManagedSyncProfileIds'], { SyncStatus });

test('鞋服多规则聚合品牌仅同步一次，未配置规则保留异常，不静默跳过', () => {
  const scope = helpers.getPresetSyncScope({ rules: [
    { brandProfileId: 'adidas', brandName: '鞋' },
    { brandProfileId: 'nike', brandName: 'NIKE' },
    { brandProfileId: 'adidas', brandName: '服' },
    { brandName: '缺配置' },
  ] });
  assert.deepEqual(Array.from(scope.profileIds), ['adidas', 'nike']);
  assert.equal(scope.missingRules.length, 1);
  assert.equal(scope.missingRules[0].brandName, '缺配置');
});

test('全部商详已处理但激活失败时不显示百分之百成功', () => {
  assert.equal(helpers.getSyncProgress({ status: SyncStatus.RUNNING, total: 100, processed: 100 }), 99);
  assert.equal(helpers.getSyncProgress({ status: SyncStatus.FAILED, total: 100, processed: 100 }), 99);
  assert.equal(helpers.getSyncStatusLabel(SyncStatus.FAILED), '同步失败');
  assert.equal(helpers.getSyncProgress({ status: SyncStatus.COMPLETE, total: 0, processed: 0 }), 100);
});

test('搜索仅访问本地API，明确保留false和分页，启动请求用约定字段', async () => {
  const requests = [];
  const api = await loadModule('syncCenterApi.ts', ['searchSyncedSKUs', 'startSourceSync'], {
    SIDEJOB_API_BASE_URL: '/api',
    fetch: async (url, init) => { requests.push({ url, init }); return { ok: true, json: async () => ({ list: [], total: 0 }) }; },
  });
  await api.searchSyncedSKUs({ keyword: 'MT51205', stockOnly: false, page: 2, pageSize: 30 });
  assert.match(requests[0].url, /^\/api\/catalog\/sync-center\/skus\?/);
  assert.ok(requests[0].url.includes('stockOnly=false'));
  assert.ok(requests[0].url.includes('page=2'));
  await api.startSourceSync(['nike', 'adidas']);
  assert.equal(requests[1].init.method, 'POST');
  assert.deepEqual(JSON.parse(requests[1].init.body), { brandProfileIds: ['nike', 'adidas'] });
});

test('后端失败时保留具体错误，不能变成空成功结果', async () => {
  const api = await loadModule('syncCenterApi.ts', ['searchSyncedSKUs'], {
    SIDEJOB_API_BASE_URL: '/api',
    fetch: async () => ({ ok: false, status: 503, json: async () => ({ message: '同步未完成，旧数据保留' }) }),
  });
  await assert.rejects(api.searchSyncedSKUs({ page: 1, pageSize: 30 }), /同步未完成，旧数据保留/);
});

test('原实时入口的搜索品牌品类及商详全部读取本地，商详不再追加购买须知', async () => {
  const requests = [];
  const api = await loadModule('api.ts', ['searchLiveProducts', 'fetchLiveBrandOptions', 'fetchLiveBrandCategories', 'fetchLiveProductDetail', 'fetchProductDetail'], {
    SIDEJOB_API_BASE_URL: '/api', PRODUCT_PAGE_SIZE: 30, URL,
    window: { location: { origin: 'http://localhost:9300' } },
    fetch: async (url) => {
      requests.push(String(url));
      const path = new URL(String(url)).pathname;
      let result = { list: [], total: 0 };
      if (path.endsWith('/brand-stores') || path.endsWith('/source-categories')) result = [];
      if (path.endsWith('/offers/12345')) result = { item_id: '12345', spec_items: [{ item_id: 'sku1', store: 0 }] };
      return { ok: true, json: async () => result };
    },
  });
  await api.searchLiveProducts({ query: 'MT51205', mode: 'article', regionId: '3', page: 1, brandDistributorIds: ['stable-brand-id'] });
  await api.fetchLiveBrandOptions('3');
  await api.fetchLiveBrandCategories('3', '4078');
  await api.fetchLiveProductDetail('12345', '3');
  await api.fetchProductDetail('12345', '3');
  assert.equal(requests.length, 5, '两次详情各只读本地一次，不追加任何购买须知');
  assert.ok(requests.every((url) => url.startsWith('http://localhost:9300/api/catalog/')));
  assert.ok(requests[0].includes('brandStoreId=stable-brand-id'));
  assert.ok(requests[2].includes('/source-categories?regionId=3&distributorId=4078'));
  assert.ok(requests[3].endsWith('/offers/12345?regionId=3'));
  assert.ok(!requests.some((url) => url.includes('itemNotice') || url.includes('fvo2o')));
});


test('完整源数据成功后的稳定度派生失败只警示，不回退成功进度', () => {
  const run = { status: SyncStatus.COMPLETE, total: 50, processed: 50, stabilityError: '日度记录写入超时' };
  assert.equal(helpers.getSyncProgress(run), 100);
  assert.equal(helpers.getSyncProgressStatus(run), 'success');
  assert.equal(helpers.getSyncStatusLabel(run.status), '同步成功');
  assert.equal(helpers.getSyncProgressStatus({ status: SyncStatus.FAILED, error: '源站失败' }), 'exception');
});


test('同步任务按更新时间倒序而非启动时间，轮询变化后重新排序且不修改源数据', () => {
  const rows = [
    { id: 'new-start', startedAt: '2026-10-28T10:00:00Z', updatedAt: '2026-10-28T10:00:01Z' },
    { id: 'old-start', startedAt: '2026-10-28T09:00:00Z', updatedAt: '2026-10-28T10:00:03Z' },
    { id: 'invalid', startedAt: '', updatedAt: '' },
  ];
  assert.deepEqual(Array.from(helpers.sortSyncRunsByUpdatedAt(rows), (row) => row.id), ['old-start', 'new-start', 'invalid']);
  assert.equal(rows[0].id, 'new-start');
  rows[0].updatedAt = '2026-10-28T10:00:05Z';
  assert.equal(helpers.sortSyncRunsByUpdatedAt(rows)[0].id, 'new-start');
});


test('一键同步只处理已加入的品牌，同品牌不按历史任务重复提交', () => {
  const rows = [{ profileId: 'adidas' }, { profileId: 'coach' }, { profileId: 'adidas' }];
  assert.deepEqual(Array.from(helpers.getManagedSyncProfileIds(rows)), ['adidas', 'coach']);
  assert.deepEqual(Array.from(helpers.getManagedSyncProfileIds([])), []);
});

test('品牌列表与删除仅调用本地品牌管理API，删除不触发配置或闲鱼接口', async () => {
  const requests = [];
  const api = await loadModule('syncCenterApi.ts', ['fetchSyncBrands', 'deleteSyncBrand'], {
    SIDEJOB_API_BASE_URL: '/api',
    fetch: async (url, init) => { requests.push({ url, init }); return { ok: true, json: async () => ({ list: [] }) }; },
  });
  await api.fetchSyncBrands();
  assert.equal(requests[0].url, '/api/catalog/sync-center/brands');
  assert.equal(requests[0].init.method, undefined);
  assert.equal(requests.length, 1, '读取品牌不得自动发起同步或删除');
  await api.deleteSyncBrand('profile/id');
  assert.equal(requests[1].url, '/api/catalog/sync-center/brands/profile%2Fid');
  assert.equal(requests[1].init.method, 'DELETE');
  assert.equal(requests.length, 2);
});

test('品牌同步中返回409时保留拒绝原因，删除失败不伪装成功', async () => {
  const api = await loadModule('syncCenterApi.ts', ['deleteSyncBrand'], {
    SIDEJOB_API_BASE_URL: '/api',
    fetch: async () => ({ ok: false, status: 409, json: async () => ({ message: '该品牌正在同步，请完成后再删除' }) }),
  });
  await assert.rejects(api.deleteSyncBrand('adidas'), /正在同步/);
});
