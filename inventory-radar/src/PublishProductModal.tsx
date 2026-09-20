import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Progress, Select } from 'antd';
import { getWarehouseShortName } from './constants';
import { createPublishTask, fetchPublishTask, retryPublishTask } from './xianyuApi';
import type { ProductDetail, ProductSku, ProductSummary, PublishTask, PublishTaskStatus } from './types';

/** 发布任务轮询间隔。 */
const TASK_POLL_INTERVAL = 1500;

/** 闲鱼发布行政区选项。 */
const PUBLISH_REGION_OPTIONS = [
  { value: '3', label: '上海市 / 浦东新区' },
  { value: '2', label: '天津市 / 武清区' },
  { value: '4', label: '广东省佛山市 / 南海区' },
  { value: '5', label: '四川省成都市 / 郫都区' },
  { value: '6', label: '湖北省鄂州市 / 华容区' },
  { value: '7', label: '重庆市 / 沙坪坝区' },
];

/** 闲鱼发布默认行政区，用户可在表单中手动修改。 */
const DEFAULT_PUBLISH_REGION_ID = '3';

/** 发布表单字段。 */
interface PublishFormValues {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  publishRegionId: string;
}

/** 商品实际活动价格，单位为分。 */
function getProductPriceCents(product: ProductSummary): number {
  // 商品活动价格。
  const activityPrice = Number(product?.activity_price ?? product?.act_price ?? 0);
  if (activityPrice > 0) {
    return activityPrice;
  }
  return Number(product?.price ?? 0);
}

/** 按奥莱采购价计算闲鱼默认铺货售价。 */
function getDefaultXianyuPrice(sourcePrice: number): number {
  // 采购价对应的固定加价。
  let markup = 120;
  if (sourcePrice < 500) {
    markup = 40;
  } else if (sourcePrice < 1000) {
    markup = 80;
  }

  // 阶梯加价后的原始售价。
  const pricedAmount = sourcePrice + markup;
  // 有小数的价格统一收为 .9。
  if (!Number.isInteger(pricedAmount)) {
    return Math.floor(pricedAmount) + 0.9;
  }
  return pricedAmount;
}

/** 从商品图文详情 HTML 中提取图片地址。 */
function extractDetailImageURLs(detailHTML?: string): string[] {
  if (!detailHTML) {
    return [];
  }

  // 商品图文详情文档。
  const detailDocument = new DOMParser().parseFromString(detailHTML, 'text/html');
  // 图文详情中的远程图片地址。
  const detailImageURLs = Array.from(detailDocument.querySelectorAll('img'))
    .map((imageElement) => imageElement.getAttribute('src') ?? '')
    .filter((imageURL) => /^https?:\/\//.test(imageURL));

  return Array.from(new Set(detailImageURLs));
}

/** 汇总轮播图和图文详情图，去重后最多九张。 */
function getPublishImageURLs(product: ProductDetail, detailImageURLs: string[]): string[] {
  // 商品主图、轮播图和图文详情图候选项。
  const imageCandidates = [
    product?.main_img ?? '',
    ...(product?.pics ?? []),
    ...detailImageURLs,
  ].filter(Boolean);
  return Array.from(new Set(imageCandidates)).slice(0, 9);
}

/** 读取 SKU 最适合展示的尺码或型号。 */
function getSkuVariantLabel(sku: ProductSku): string {
  // 优先展示尺码、鞋码、型号或规格字段。
  const preferredSpec = sku?.item_spec?.find((spec) => /尺码|鞋码|型号|规格/.test(spec?.spec_name ?? ''));
  if (preferredSpec?.spec_value_name) {
    return preferredSpec.spec_value_name;
  }

  // 没有标准尺码字段时合并已有规格值。
  return sku?.item_spec
    ?.map((spec) => spec?.spec_value_name ?? '')
    .filter(Boolean)
    .join(' / ') ?? '';
}

/** 汇总库存大于零的尺码或型号。 */
function getInStockVariantLabels(product: ProductDetail): string[] {
  // 有库存的规格集合。
  const inStockVariantLabels = new Set<string>();

  product?.spec_items?.forEach((sku) => {
    // 当前 SKU 库存。
    const stock = Number(sku?.store ?? 0);
    // 当前 SKU 展示规格。
    const variantLabel = getSkuVariantLabel(sku);
    if (stock <= 0 || !variantLabel || sku?.approve_status === 'offsale') {
      return;
    }

    inStockVariantLabels.add(variantLabel);
  });

  if (inStockVariantLabels.size === 0) {
    return [];
  }

  return Array.from(inStockVariantLabels);
}

/** 生成有库存规格的描述文案。 */
function getInStockVariantText(variantLabels: string[]): string {
  if (variantLabels.length === 0) {
    return '';
  }
  return `有货尺码/型号：${variantLabels.join('、')}`;
}

/** 判断当前商品是否属于鞋靴类。 */
function isFootwearProduct(product: ProductDetail): boolean {
  return /鞋|靴|sneaker|loafer|boot/i.test(product?.item_name ?? '');
}

/** 返回发布任务对应的进度百分比。 */
function getTaskProgress(status: PublishTaskStatus): number {
  if (status === 'queued') {
    return 12;
  }
  if (status === 'preparing') {
    return 32;
  }
  if (status === 'needs_login') {
    return 45;
  }
  if (status === 'publishing') {
    return 72;
  }
  return 100;
}

/** 返回发布任务对应的中文状态。 */
function getTaskLabel(status: PublishTaskStatus): string {
  const statusLabels: Record<PublishTaskStatus, string> = {
    queued: '已进入发布队列',
    preparing: '正在准备商品图片',
    needs_login: '请重新连接闲鱼 API',
    publishing: '正在调用闲鱼发布接口',
    succeeded: '发布成功',
    failed: '发布失败',
  };
  return statusLabels[status];
}

/** 商品发布确认与进度面板。 */
export function PublishProductModal({
  product,
  onClose,
  onPublished,
}: {
  product: ProductDetail;
  onClose: () => void;
  onPublished: () => void;
}) {
  // Ant Design 发布表单实例。
  const [form] = Form.useForm<PublishFormValues>();
  // 当前发布任务。
  const [publishTask, setPublishTask] = useState<PublishTask | null>(null);
  // 创建任务请求状态。
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 发布请求错误。
  const [errorMessage, setErrorMessage] = useState('');
  // 是否已通知父页面刷新渠道状态。
  const hasNotifiedPublished = useRef(false);
  // 商品图文详情图片。
  const detailImageURLs = extractDetailImageURLs(product?.intro);
  // 当前商品全部发布图片。
  const imageURLs = getPublishImageURLs(product, detailImageURLs);
  // 实际选入的图文详情图片数量。
  const selectedDetailImageCount = imageURLs.filter((imageURL) => detailImageURLs.includes(imageURL)).length;
  // 当前商品默认闲鱼售价。
  const defaultPrice = getDefaultXianyuPrice(getProductPriceCents(product) / 100);
  // 当前商品市场原价。
  const defaultOriginalPrice = Number(product?.market_price ?? 0) / 100;
  // 带全新标识的默认闲鱼标题。
  const defaultTitle = `【全新】${product?.item_name ?? ''}`;
  // 有库存的尺码或型号。
  const inStockVariantLabels = getInStockVariantLabels(product);
  // 有库存的尺码或型号文案。
  const inStockVariantText = getInStockVariantText(inStockVariantLabels);
  // 当前商品是否属于鞋靴类。
  const isFootwear = isFootwearProduct(product);
  // 商品实际发货仓库地区。
  const shippingRegionID = product?.regionauth_id ?? product?.distributor_info?.regionauth_id;
  // 商品实际发货城市简称。
  const shippingRegionName = getWarehouseShortName(shippingRegionID);
  // 商品品牌名称，用于生成尺码提示。
  const productBrandName = product?.goods_brand ?? '对应品牌';
  // 购买说明模板，控制在闲鱼描述字数限制内。
  const purchaseNoticeLines = [
    ' ',
    '购买说明',
    '拍下商品即表示已阅读并接受以下说明：',
    '',
    '1. 正品保障',
    '商品均来自奥特莱斯正规渠道，全新未穿，支持提供发票或购买凭证（隐私信息会适当遮挡），也支持得物等正规平台鉴定，请放心购买。',
    '',
    '2. 库存说明',
    '部分尺码为现货，部分需要到店采购。奥莱库存变化较快，下单前请先联系确认尺码和库存；如遇临时缺货，会第一时间沟通。',
    '',
    '3. 商品品相',
    '奥莱商品可能存在轻微线头、溢胶、试穿痕迹或鞋盒挤压等情况，通常不影响正常穿着。明显瑕疵会提前告知并提供实拍，细节要求较高请确认后再购买。',
    '',
    '4. 发货时效',
    '现货一般下单后24小时内发出，代购商品通常24—48小时内发出。如遇门店调货或库存变化，会及时沟通；急用请提前确认。',
    '',
    '5. 快递说明',
    '默认普通快递包邮，新疆、西藏及其他偏远地区请提前咨询。商品会用纸箱加固寄出，如需顺丰可补差价升级。',
    '',
    '6. 价格说明',
    '奥莱活动、库存和不同尺码的采购价格可能调整，售价也会随之变化。商品成交后不提供保价或补差价服务。',
    '',
    '7. 尺码与售后',
    `可根据脚长和日常穿着习惯协助推荐尺码，但脚型和穿着感受因人而异，请以自己常穿的${productBrandName}鞋码为主要参考。售后按闲鱼平台规则处理；如有质量问题或与描述明显不符，请保留商品、鞋盒及外包装并及时联系。`,
    '',
    '购买前如需查看鞋标、鞋盒、发票或其他细节，欢迎私聊，我会尽量提供清晰实拍。感谢理解，祝购物愉快！',
  ];
  // 发布描述默认内容行。
  const defaultDescriptionLines = [
    `全新 ${product?.item_name ?? ''}`,
    `货号：${product?.item_no ?? '—'}`,
    inStockVariantText,
    `发货地区：${shippingRegionName}`,
    '奥莱正品，支持验货。库存实时变化，下单前请先确认。',
    ...purchaseNoticeLines,
  ].filter(Boolean);
  // 发布描述默认内容。
  const defaultDescription = defaultDescriptionLines.join('\n');
  // 当前任务是否已经结束。
  const isTaskFinished = publishTask?.status === 'succeeded' || publishTask?.status === 'failed';

  /** 刷新当前发布任务状态。 */
  async function refreshPublishTask(taskId: string) {
    try {
      // 最新发布任务。
      const nextTask = await fetchPublishTask(taskId);
      setPublishTask(nextTask);
      setErrorMessage('');
      if (nextTask.status === 'succeeded' && !hasNotifiedPublished.current) {
        hasNotifiedPublished.current = true;
        onPublished();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '读取发布进度失败');
    }
  }

  /** 校验表单并创建发布任务。 */
  async function handleSubmitPublish(values: PublishFormValues) {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // 新建的发布任务。
      const nextTask = await createPublishTask({
        sourceItemId: product?.default_item_id ?? product?.item_id ?? product?.goods_id ?? '',
        itemNo: product?.item_no ?? '',
        title: values.title,
        description: values.description,
        priceCents: Math.round(values.price * 100),
        originalPriceCents: Math.round((values.originalPrice ?? 0) * 100),
        imageUrls: imageURLs,
        regionId: values.publishRegionId,
        brand: product?.goods_brand ?? product?.distributor_info?.name ?? '',
        condition: '全新',
        availableSizes: isFootwear ? inStockVariantLabels : [],
        isFootwear,
      });
      setPublishTask(nextTask);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '创建发布任务失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  /** 将当前失败任务重新加入发布队列。 */
  async function handleRetryPublish() {
    if (!publishTask) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // 重新排队后的任务。
      const retriedTask = await retryPublishTask(publishTask.id);
      setPublishTask(retriedTask);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '重新发布失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!publishTask || isTaskFinished) {
      return undefined;
    }

    // 发布过程中的任务状态轮询计时器。
    const pollTimer = window.setInterval(() => {
      void refreshPublishTask(publishTask.id);
    }, TASK_POLL_INTERVAL);

    return () => window.clearInterval(pollTimer);
  }, [publishTask?.id, isTaskFinished]);

  return (
    <Modal
      open
      width={720}
      className="publish-modal"
      title={<div className="publish-modal__title"><small>GOOFISH PUBLISH</small><strong>发布到闲鱼</strong></div>}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div className="publish-product-strip">
        <div className="publish-product-gallery">
          {imageURLs.map((imageURL, imageIndex) => (
            <img key={`${imageURL}-${imageIndex}`} src={imageURL} alt={`待发布商品图 ${imageIndex + 1}`} />
          ))}
        </div>
        <div className="publish-product-strip__copy">
          <span>{product?.goods_brand ?? '奥莱商品'}</span>
          <strong>{product?.item_name}</strong>
          <small>货号 {product?.item_no ?? '—'} · 共 {imageURLs.length} 张图{selectedDetailImageCount > 0 ? ` · 含 ${selectedDetailImageCount} 张图文详情图` : ''}</small>
        </div>
      </div>

      {!publishTask ? (
        <Form<PublishFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            title: defaultTitle,
            description: defaultDescription,
            price: defaultPrice,
            originalPrice: defaultOriginalPrice,
            publishRegionId: DEFAULT_PUBLISH_REGION_ID,
          }}
          onFinish={handleSubmitPublish}
        >
          <Form.Item label="商品标题" name="title" rules={[{ required: true, message: '请输入商品标题' }, { max: 120, message: '最多 120 个字符' }]}>
            <Input showCount maxLength={120} />
          </Form.Item>
          <Form.Item label="商品描述" name="description" rules={[{ required: true, message: '请输入商品描述' }, { max: 1500, message: '最多 1500 个字符' }]}>
            <Input.TextArea showCount maxLength={1500} autoSize={{ minRows: 5, maxRows: 9 }} />
          </Form.Item>
          <div className="publish-price-grid">
            <Form.Item label="闲鱼售价" name="price" rules={[{ required: true, message: '请输入售价' }]}>
              <InputNumber min={0.01} precision={2} prefix="¥" controls={false} />
            </Form.Item>
            <Form.Item label="商品原价" name="originalPrice">
              <InputNumber min={0} precision={2} prefix="¥" controls={false} />
            </Form.Item>
          </div>
          <Form.Item label="发布地区" name="publishRegionId" rules={[{ required: true, message: '请选择发布地区' }]}>
            <Select options={PUBLISH_REGION_OPTIONS} />
          </Form.Item>
          {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
          <div className="publish-modal__actions">
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>确认并发布</Button>
          </div>
        </Form>
      ) : (
        <div className="publish-progress">
          <Progress
            type="circle"
            percent={getTaskProgress(publishTask.status)}
            status={publishTask.status === 'failed' ? 'exception' : undefined}
            size={112}
          />
          <div className="publish-progress__copy">
            <small>任务 {publishTask.id.slice(-8).toUpperCase()}</small>
            <strong>{getTaskLabel(publishTask.status)}</strong>
            {publishTask.status === 'needs_login' ? <p>请在页面右上角重新连接闲鱼 API，然后点击重新发布。</p> : null}
            {publishTask.errorMessage ? <Alert type="error" showIcon message={publishTask.errorMessage} /> : null}
            {errorMessage ? <Alert type="warning" showIcon message={errorMessage} /> : null}
            {publishTask.xianyuUrl ? <Button type="primary" href={publishTask.xianyuUrl} target="_blank">查看闲鱼商品</Button> : null}
            {publishTask.status === 'failed' ? <Button type="primary" loading={isSubmitting} onClick={handleRetryPublish}>重新发布</Button> : null}
            {isTaskFinished ? <Button onClick={onClose}>完成</Button> : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
