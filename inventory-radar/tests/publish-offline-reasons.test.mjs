import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { transformWithOxc } from 'vite';

// 编译真实页面格式逻辑，不调用任何网络或队列操作。
const source = fs.readFileSync(new URL('../src/PublishCenterPage.tsx', import.meta.url), 'utf8');
const { code } = await transformWithOxc(source, 'PublishCenterPage.tsx', { lang: 'tsx', jsx: { runtime: 'automatic' } });
const moduleExports = {};
vm.runInNewContext(code.replace(/^import .*;$/gm, '').replace(/export /g, '') + '\nexports.formatOfflineCandidateReason = formatOfflineCandidateReason;', { exports: moduleExports });

test('按后端库存证据显示原因，不用统一缺货文案覆盖', () => {
  assert.equal(moduleExports.formatOfflineCandidateReason(['全部地区可售库存为 0', '已核验 6 个地区']), '全部地区可售库存为 0；已核验 6 个地区');
});

test('旧预览缺失或空白原因时明确待核验，不误称无货', () => {
  for (const reasons of [undefined, [], ['', '  ']]) {
    assert.equal(moduleExports.formatOfflineCandidateReason(reasons), '下架原因待核验，请重新生成预览');
  }
});
