import { useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { createPriceComparison } from './xianyuApi';
import type { PriceComparisonPlatformResult, PriceComparisonProduct, PriceComparisonResponse } from './types';

/** 人民币金额格式化器。 */
const PRICE_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 平台中文名称。 */
const PLATFORM_LABELS: Record<string, string> = {
  xianyu: '闲鱼',
  pinduoduo: '拼多多',
};

/** 格式化候选商品售价。 */
function formatPrice(priceCents: number): string {
  return PRICE_FORMATTER.format(priceCents / 100);
}

/** 将平台错误转换成用户可操作的提示。 */
function getComparisonErrorMessage(platformResult: PriceComparisonPlatformResult): string {
  const message = platformResult.message || '';
  if (message.includes('FAIL_SYS_USER_VALIDATE')) {
    return '闲鱼要求完成安全验证。请在闲鱼网页保持登录后，更新闲鱼连接再试。';
  }
  if (platformResult.platform === 'pinduoduo' && message.includes('尚未连接')) {
    return '尚未连接拼多多 API，请先在平台连接管理中填写拼多多凭证。';
  }
  return message || `暂时无法获取${PLATFORM_LABELS[platformResult.platform] || platformResult.platform}比价结果，请稍后重试。`;
}

/** PriceComparisonModal 在商品详情中展示多平台一键比价结果。 */
export function PriceComparisonModal({
  product,
  onClose,
}: {
  product: PriceComparisonProduct;
  onClose: () => void;
}) {
  // 当前比价返回结果。
  const [comparisonResult, setComparisonResult] = useState<PriceComparisonResponse | null>(null);
  // 远端比价加载状态。
  const [isLoading, setIsLoading] = useState(true);

  /** 查询当前商品在各渠道的候选售价。 */
  async function loadComparisonResult() {
    setIsLoading(true);
    try {
      const result = await createPriceComparison({
        product,
        platforms: ['xianyu', 'pinduoduo'],
        filters: {
          condition: ['new'],
          shipping: 'free',
          maxResultsPerPlatform: 10,
        },
      });
      setComparisonResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setComparisonResult({
        id: '',
        status: 'failed',
        product,
        platformResults: [
          { platform: 'xianyu', status: 'failed', message, candidates: [] },
          { platform: 'pinduoduo', status: 'failed', message, candidates: [] },
        ],
        createdAt: '',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadComparisonResult();
  }, []);

  // 各个平台的比价结果。
  const platformResults = comparisonResult?.platformResults ?? [];

  return (
    <Modal
      open
      centered
      footer={null}
      width={1080}
      onCancel={onClose}
      className="price-comparison-modal"
      title={<><small>PRICE CHECK · MULTI PLATFORM</small><strong>一键比价</strong></>}
    >
      <section className="price-comparison-modal__source">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>SIDEJOB</span>}
        <div><small>{product.brand || 'OUTLET SELECT'}</small><h2>{product.name}</h2><p>货号 {product.itemNo || '未提供'} · 每个平台最多展示 10 条候选。</p></div>
        {product.priceCents && product.priceCents > 0 ? <div className="price-comparison-modal__own-price"><span>本店到手价</span><strong>{formatPrice(product.priceCents)}</strong>{product.originalPriceCents && product.originalPriceCents > product.priceCents ? <del>{formatPrice(product.originalPriceCents)}</del> : null}</div> : null}
        <button type="button" onClick={loadComparisonResult} disabled={isLoading}>{isLoading ? '查询中…' : '重新查询'}</button>
      </section>

      {isLoading ? <div className="price-comparison-modal__loading"><Spin /><span>正在查询闲鱼和拼多多市场价格…</span></div> : null}
      {!isLoading ? platformResults.map((platformResult) => {
        const platformLabel = PLATFORM_LABELS[platformResult.platform] || platformResult.platform;
        return (
          <section className="price-platform-section" key={platformResult.platform}>
            <header><div><small>PLATFORM</small><h3>{platformLabel}</h3></div><span>{platformResult.status === 'completed' ? `${platformResult.candidates.length} 条候选` : '查询失败'}</span></header>
            {platformResult.status === 'failed' ? <div className="notice notice--error">{getComparisonErrorMessage(platformResult)}</div> : null}
            {platformResult.status === 'completed' && platformResult.candidates.length === 0 ? <div className="empty-state"><strong>没有找到符合条件的{platformLabel}商品</strong><p>可以稍后重试，或确认货号是否正确。</p></div> : null}
            {platformResult.candidates.length > 0 ? <div className="price-comparison-modal__results">{platformResult.candidates.map((candidate) => (
              <article className="price-candidate-card" key={`${candidate.platform}-${candidate.platformItemId}`}>
                <div className="price-candidate-card__media">{candidate.imageUrl ? <img src={candidate.imageUrl} alt={candidate.title} loading="lazy" /> : <span>{platformLabel}</span>}<em>{candidate.matchReason}</em></div>
                <div className="price-candidate-card__content"><h3>{candidate.title}</h3><strong>{formatPrice(candidate.priceCents)}</strong><span>{candidate.attributes?.priceType || `匹配度 ${candidate.matchScore}`}{candidate.attributes?.sales ? ` · 已售 ${candidate.attributes.sales}` : ''}</span>{candidate.itemUrl ? <a href={candidate.itemUrl} target="_blank" rel="noreferrer">查看{platformLabel}商品 ↗</a> : null}</div>
              </article>
            ))}</div> : null}
          </section>
        );
      }) : null}
    </Modal>
  );
}
