import type { BrandOption } from './types';

/** 品牌筛选下拉项，统一展示品牌 Logo 与可售数量。 */
export function BrandSelectOption({ brandOption }: { brandOption: BrandOption }) {
  // 全部品牌选项使用独立视觉标识。
  const isAllBrands = brandOption.value === 'all';
  // 实时品牌使用 live 前缀，本地品牌继续展示本地同步语义。
  const isLiveBrand = brandOption.value.startsWith('live:');
  // 品牌档案选项表示跨地区聚合品牌。
  const isProfileBrand = Boolean(brandOption.brandProfileId);
  // 无 Logo 时使用品牌首字母占位。
  const brandInitial = brandOption.label.trim().slice(0, 1).toUpperCase() || 'B';
  // 品牌来源说明。
  let brandSourceLabel = '本地同步品牌';
  if (isProfileBrand) brandSourceLabel = '跨地区聚合品牌';
  else if (isLiveBrand) brandSourceLabel = '小程序实时品牌';

  return (
    <div className={isAllBrands ? 'brand-select-option brand-select-option--all' : 'brand-select-option'}>
      <span className="brand-select-option__logo">
        {brandOption.logoUrl ? <img src={brandOption.logoUrl} alt="" loading="lazy" /> : <i>{isAllBrands ? 'ALL' : brandInitial}</i>}
      </span>
      <span className="brand-select-option__copy"><strong>{brandOption.label}</strong>{!isAllBrands ? <small>{brandSourceLabel}</small> : <small>查看当前仓库全部货源</small>}</span>
      {!isAllBrands && brandOption.onlineGoodsCount !== undefined ? <em><b>{brandOption.onlineGoodsCount.toLocaleString('zh-CN')}</b> 件可售</em> : null}
    </div>
  );
}
