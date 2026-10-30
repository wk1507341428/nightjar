import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { transformWithOxc } from 'vite';

// 编译真实调度实现，隔离 UI 依赖，测试不会访问发布或闲鱼接口。
const source = fs.readFileSync(new URL('../src/PublishPresetRunner.tsx', import.meta.url), 'utf8');
const { code: compiled } = await transformWithOxc(source, 'PublishPresetRunner.tsx', { lang: 'tsx', jsx: { runtime: 'automatic' } });
const moduleExports = {};
vm.runInNewContext(compiled.replace(/^import .*;$/gm, '').replace(/export /g, '') + '\nexports.runPresetPreviewWorkers = runPresetPreviewWorkers; exports.confirmPresetRule = confirmPresetRule;', { exports: moduleExports, Error });
const { runPresetPreviewWorkers } = moduleExports;

/** 可控异步请求，模拟各品牌响应速度不同。 */
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

/** 等待当前一批 Promise 回调完成。 */
async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
}

test('慢规则不阻塞下一条规则，始终最多两路，逐条报告完成', async () => {
  const pending = Array.from({ length: 4 }, deferred);
  const started = [];
  const completed = [];
  let active = 0;
  let maxActive = 0;
  const run = runPresetPreviewWorkers([0, 1, 2, 3], async (rule) => {
    started.push(rule);
    active += 1;
    maxActive = Math.max(maxActive, active);
    try { return await pending[rule].promise; } finally { active -= 1; }
  }, (index, result) => completed.push([index, result.status]), () => true);
  assert.deepEqual(started, [0, 1]);
  pending[1].resolve('brand 1');
  await flush();
  assert.deepEqual(started, [0, 1, 2]);
  assert.deepEqual(completed, [[1, 'fulfilled']]);
  pending[2].resolve('brand 2');
  await flush();
  assert.deepEqual(started, [0, 1, 2, 3]);
  pending[3].resolve('brand 3');
  pending[0].resolve('brand 0');
  await run;
  assert.equal(maxActive, 2);
  assert.equal(completed.length, 4);
});

test('某条规则失败仍保留其他成功结果并处理剩余规则', async () => {
  const outcomes = [];
  await runPresetPreviewWorkers([0, 1, 2], async (rule) => {
    if (rule === 1) throw new Error('上游读取失败');
    return { selected: rule + 1 };
  }, (index, result) => outcomes.push({ index, result }), () => true);
  assert.equal(outcomes.filter(({ result }) => result.status === 'fulfilled').length, 2);
  assert.equal(outcomes.find(({ index }) => index === 1).result.reason.message, '上游读取失败');
  assert.equal(outcomes.find(({ index }) => index === 2).result.value.selected, 3);
});

test('切换方案后旧请求不再报告结果或领取后续规则', async () => {
  const pending = [deferred(), deferred()];
  const started = [];
  const settled = [];
  let current = true;
  const run = runPresetPreviewWorkers([0, 1, 2, 3], (rule) => {
    started.push(rule);
    return pending[rule].promise;
  }, (index) => settled.push(index), () => current);
  current = false;
  pending[0].resolve({});
  pending[1].reject(new Error('旧请求失败'));
  await run;
  assert.deepEqual(started, [0, 1]);
  assert.deepEqual(settled, []);
});

test('同轮规则共享快照 ID，主动再次生成会换新 ID', async () => {
  const rules = Array.from({ length: 4 }, (_, index) => ({
    id: String(index), brandStoreId: String(index), sourceType: 'live', brandName: `品牌 ${index}`,
    categoryIds: [], categoryNames: [], actionMode: 'full', limit: 5,
  }));
  // 最小 Hook 容器，只运行真实事件处理；不加载账号、不发接口请求。
  const slots = [[{ id: 'preset', name: '方案', rules }], 'preset'];
  let slotIndex = 0;
  let snapshotSequence = 0;
  const requests = [];
  const jsx = (type, props) => ({ type, props });
  const componentExports = {};
  vm.runInNewContext(compiled.replace(/^import .*;$/gm, '').replace(/export /g, '') + '\nexports.PublishPresetRunner = PublishPresetRunner;', {
    exports: componentExports,
    _jsx: jsx, _jsxs: jsx, _Fragment: 'fragment',
    Alert: 'Alert', Button: 'Button', Empty: 'Empty', Progress: 'Progress', Select: 'Select', Switch: 'Switch', Tag: 'Tag',
    useEffect: () => {}, useMemo: (create) => create(),
    useState: (initial) => {
      const index = slotIndex++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = value; }];
    },
    useRef: (initial) => {
      const index = slotIndex++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    crypto: { randomUUID: () => `snapshot-${++snapshotSequence}` },
    previewPublishOperation: async (storeId, settings) => {
      requests.push({ storeId, settings });
      return { selected: 1, skipped: [] };
    },
  });
  function render() {
    slotIndex = 0;
    return componentExports.PublishPresetRunner({ accountId: 'account', remainingCapacity: 100 });
  }
  function findGenerateButton(element) {
    if (!element || typeof element !== 'object') return undefined;
    if (element.type === 'Button' && element.props.children === '生成方案预览') return element;
    const children = [element.props?.children].flat(Infinity);
    return children.map(findGenerateButton).find(Boolean);
  }
  findGenerateButton(render()).props.onClick();
  await flush();
  assert.equal(requests.length, 4);
  assert.deepEqual(requests.map(({ settings }) => settings.sourceSnapshotId), Array(4).fill('snapshot-1'));
  findGenerateButton(render()).props.onClick();
  await flush();
  assert.deepEqual(requests.slice(4).map(({ settings }) => settings.sourceSnapshotId), Array(4).fill('snapshot-2'));
});


test('确认时空规则不阻断后续品牌，过期和网络错误仍抛出', async () => {
  const confirmed = [];
  for (const rule of ['NIKE', 'ADIDAS-empty', '李宁', 'ADIDAS-clothes']) {
    const result = await moduleExports.confirmPresetRule(async () => {
      if (rule === 'ADIDAS-empty') throw new Error('当前品牌没有可发布商品');
      return { id: rule };
    });
    if (result) confirmed.push(result.id);
  }
  assert.deepEqual(confirmed, ['NIKE', '李宁', 'ADIDAS-clothes']);
  for (const message of ['预览已过期或已提交，请重新生成', '网络读取失败']) {
    await assert.rejects(moduleExports.confirmPresetRule(async () => { throw new Error(message); }), { message });
  }
});
