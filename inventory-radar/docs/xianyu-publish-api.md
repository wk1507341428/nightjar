# 闲鱼网页版发布流程接口记录

记录日期：2026-09-16

> 以下接口来自闲鱼网页版实际发布流程，仅记录接口名称、版本和用途。动态 `sign`、Cookie、Token、时间戳等登录凭证不落盘。网页私有接口可能随时变更，正式产品优先使用闲鱼官方 ISV 或已授权 SaaS 接口。

## 基础地址

```text
https://h5api.m.goofish.com/h5/{api}/{version}/
```

公共查询参数包含：

```text
jsv=2.7.2
appKey=34839810
v={version}
type=originaljson
accountSite=xianyu
dataType=json
timeout=20000
api={api}
sessionOption=AutoLoginOnly
```

`t` 和 `sign` 为每次请求动态生成，不能复用。

## 1. 商品属性智能推荐

```http
POST /h5/mtop.taobao.idle.kgraph.property.recommend/2.0/
```

接口名：

```text
mtop.taobao.idle.kgraph.property.recommend
```

用途：根据图片、描述和分类推荐品牌、成色、性别、季节等发布属性。

## 2. 发布服务卡片

```http
POST /h5/mtop.idle.item.publish.service.cards.list/1.0/
```

接口名：

```text
mtop.idle.item.publish.service.cards.list
```

用途：查询发布页面可用的服务、保障和发货配置。

## 3. 正式发布闲置商品

```http
POST /h5/mtop.idle.pc.idleitem.publish/1.0/
```

接口名：

```text
mtop.idle.pc.idleitem.publish
```

用途：提交网页版完整商品发布表单。

当前请求依赖：

- 已登录的闲鱼网页 Cookie
- 动态 MTop 签名
- 当前时间戳
- `sessionOption=AutoLoginOnly`
- 商品图片上传后的远程图片地址
- 分类与属性 ID

## 已验证发布

| 货号 | 闲鱼商品 ID | 售价 | 结果 |
|---|---:|---:|---|
| HQ0028-001 | 1084524065943 | ¥186 | 成功 |
| HQ2592-700 | 1082579403763 | ¥949 | 成功 |

## 当前项目接入方式

SideJob 采用 Go 后端直接调用接口，不使用浏览器填写或点击发布页面：

1. 前端录入用户主动复制的闲鱼 Cookie；
2. 后端调用 `mtop.idle.web.user.page.nav` 验证登录态；
3. Cookie 使用本机独立密钥进行 AES-256-GCM 加密后保存；
4. 商品图片上传到 `https://stream-upload.goofish.com/api/upload.api`；
5. 依次调用属性推荐、服务卡片和正式发布接口；
6. `_m_h5_tk` 更新后由 Go 客户端自动更新签名 Token；
7. 前端只访问 SideJob API，因此没有闲鱼跨域问题。

这些接口属于闲鱼网页私有接口，字段可能发生变化。实际发布由用户自行验证；后端不得在日志或 API 响应中输出 Cookie 明文。
