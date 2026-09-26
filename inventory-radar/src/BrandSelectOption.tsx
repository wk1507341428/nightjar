import type { BrandOption } from './types';

/** 品牌筛选下拉项，统一展示品牌 Logo 与可售数量。 */
export function BrandSelectOption({ brandOption }: { brandOption: BrandOption }) {
  // 全部品牌选项使用独立视觉标识。
  const isAllBrands = brandOption.value === 'all';
  // 实时品牌使用 live 前缀，本地品牌继续展示本地同步语义。
  const isLiveBrand = brandOption.value.startsWith('live:');
  // 无 Logo 时使用品牌首字母占位。
  const brandInitial = brandOption.label.trim().slice(0, 1).toUpperCase() || 'B';

  return (
    <div className={isAllBrands ? 'brand-select-option brand-select-option--all' : 'brand-select-option'}>
      <span className="brand-select-option__logo">
        {brandOption.logoUrl ? <img src={brandOption.logoUrl} alt="" loading="lazy" /> : <i>{isAllBrands ? 'ALL' : brandInitial}</i>}
      </span>
      <span className="brand-select-option__copy"><strong>{brandOption.label}</strong>{!isAllBrands ? <small>{isLiveBrand ? '小程序实时品牌' : '本地同步品牌'}</small> : <small>查看当前仓库全部货源</small>}</span>
      {!isAllBrands && brandOption.onlineGoodsCount !== undefined ? <em><b>{brandOption.onlineGoodsCount.toLocaleString('zh-CN')}</b> 件可售</em> : null}
    </div>
  );
}
