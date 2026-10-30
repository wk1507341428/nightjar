import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { transformWithOxc } from 'vite';

const source = fs.readFileSync(new URL('../src/SyncCenterPage.tsx', import.meta.url), 'utf8');
const { code } = await transformWithOxc(source, 'SyncCenterPage.tsx', { lang: 'tsx', jsx: { runtime: 'automatic' } });

// 渲染真实页面与事件处理，所有同步和删除调用都替换为 mock。
function renderPage(profiles, startSourceSync, brands = [], deleteSyncBrand = async () => ({})) {
  const exports = {};
  const updates = [];
  let hookIndex = 0;
  const element = (type, props) => ({ type, props });
  const context = {
    exports, Error, jsx: element, jsxs: element, _jsx: element, _jsxs: element,
    useState: (initial) => {
      const index = hookIndex++;
      let value = initial;
      if (index === 0) value = profiles;
      if (index === 1) value = brands;
      if (index === 4) value = ['a']; // 当前新增选择不能限制列表一键同步。
      if (index === 12) value = false;
      return [value, (next) => updates.push({ index, next })];
    },
    useRef: (current) => ({ current }), useEffect: () => {},
    useXianyuAccount: () => ({ currentAccountId: 'default', currentAccount: {} }),
    REGION_OPTIONS: [],
    SyncStage: { LISTS: 'lists', DETAILS: 'details', ACTIVATE: 'activate' },
    SyncStatus: { COMPLETE: 'complete', RUNNING: 'running', FAILED: 'failed', INTERRUPTED: 'interrupted' },
    startSourceSync, deleteSyncBrand,
    fetchSyncProfiles: async () => profiles,
    fetchSyncBrands: async () => ({ list: brands }),
    searchSyncedSKUs: async () => ({ list: [], total: 0 }),
    sortSyncRunsByUpdatedAt: (rows) => rows,
    getManagedSyncProfileIds: (rows) => [...new Set(rows.map((row) => row.profileId).filter(Boolean))],
    ...Object.fromEntries(['Alert', 'Button', 'Checkbox', 'Empty', 'Popconfirm', 'Progress', 'Select', 'Space', 'Table', 'Tag', 'Tooltip'].map((name) => [name, name])),
    Input: { Search: 'Input.Search' },
  };
  vm.runInNewContext(code.replace(/^import .*;$/gm, '').replace(/export /g, '') + '\nexports.SyncCenterPage = SyncCenterPage;', context);
  return { tree: exports.SyncCenterPage(), updates };
}

/** 读取真实渲染树，不触发按钮。 */
function findNode(node, matches) {
  if (!node || typeof node !== 'object') return undefined;
  if (matches(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = findNode(child, matches);
    if (found) return found;
  }
  return undefined;
}
const findButton = (tree, label) => findNode(tree, (node) => node.type === 'Button' && node.props.children === label);
const findBrandTable = (tree) => findNode(tree, (node) => node.type === 'Table' && node.props.columns.some((column) => column.title === '操作'));
const profiles = [
  { id: 'a', name: 'ADIDAS', members: [] },
  { id: 'b', name: 'COACH', members: [] },
  { id: 'c', name: 'FILA', members: [] },
];
const managedBrands = [{ id: 'a', profileId: 'a', status: 'complete' }, { id: 'b', profileId: 'b', status: 'failed' }];
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('一键同步只提交已加入列表的品牌，快速重复点击仅提交一次', async () => {
  const requests = [];
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const { tree } = renderPage(profiles, async (ids) => { requests.push([...ids]); return pending; }, managedBrands);
  const button = findButton(tree, '一键同步');
  assert.equal(button.props.disabled, false);
  button.props.onClick(); button.props.onClick();
  assert.deepEqual(requests, [['a', 'b']], '未加入列表的 FILA 不应自动同步');
  finish({ list: [] }); await flush();
});

test('仅有配置但尚无同步品牌时禁用，提交失败显示具体错误并可重试', async () => {
  assert.equal(findButton(renderPage(profiles, async () => { throw new Error('must not submit'); }).tree, '一键同步').props.disabled, true);
  let attempts = 0;
  const { tree, updates } = renderPage(profiles, async () => { attempts += 1; throw new Error('同步接口暂不可用'); }, managedBrands);
  const button = findButton(tree, '一键同步');
  button.props.onClick(); await flush();
  assert.ok(updates.some(({ index, next }) => index === 15 && next === '同步接口暂不可用'));
  button.props.onClick(); await flush(); assert.equal(attempts, 2);
});

test('失败行重试只提交本品牌，成功行显示同步，运行行禁用同步和删除', async () => {
  const calls = [];
  const failed = { id: 'b', profileId: 'b', status: 'failed' };
  const { tree } = renderPage(profiles, async (ids) => { calls.push([...ids]); return { list: [] }; }, [failed]);
  const actions = findBrandTable(tree).props.columns.find((column) => column.title === '操作');
  const retry = findButton(actions.render(null, failed), '重试');
  assert.equal(retry.props.disabled, false);
  retry.props.onClick(); retry.props.onClick(); await flush();
  assert.deepEqual(calls, [['b']]);
  assert.ok(findButton(actions.render(null, { ...failed, status: 'complete' }), '同步'));
  const runningActions = actions.render(null, { ...failed, status: 'running' });
  assert.equal(findButton(runningActions, '同步').props.disabled, true);
  assert.equal(findButton(runningActions, '删除').props.disabled, true);
});

test('删除必须经过二次确认，仅提交本品牌删除并刷新SKU，不触发同步', async () => {
  const deleted = [];
  const brand = { id: 'b', profileId: 'b', profileName: 'COACH', status: 'complete' };
  const { tree, updates } = renderPage(profiles, async () => { throw new Error('must not sync'); }, [brand], async (id) => { deleted.push(id); });
  const actions = findBrandTable(tree).props.columns.find((column) => column.title === '操作').render(null, brand);
  const confirm = findNode(actions, (node) => node.type === 'Popconfirm');
  assert.deepEqual(deleted, []);
  assert.match(confirm.props.description, /商品、SKU、同步元数据/);
  assert.match(confirm.props.description, /品牌维护配置和闲鱼商品不会删除/);
  await confirm.props.onConfirm();
  assert.deepEqual(deleted, ['b']);
  assert.ok(updates.some(({ index, next }) => index === 10 && Array.isArray(next) && next.length === 0), '删除后清理并刷新SKU表');
});

test('同步失败保留旧完整快照的本地商品SKU数量，不混为本次失败进度', () => {
  const brand = { id: 'b', profileId: 'b', status: 'failed', processed: 2, total: 10, skuCount: 3, lastSyncedAt: '2026-10-28T00:00:00Z', snapshotProductCount: 100, snapshotSKUCount: 250 };
  const { tree } = renderPage(profiles, async () => {}, [brand]);
  const snapshotColumn = findBrandTable(tree).props.columns.find((column) => column.key === 'snapshot');
  const row = snapshotColumn.render(null, brand);
  assert.equal(row.props.children[0].props.children, '100 条地区商品 · 250 个 SKU');
});
