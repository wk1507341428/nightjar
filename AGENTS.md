# SideJob 项目说明

## 项目用途

SideJob 是一个本地商品运营工作台，核心功能是：

- 读取佛罗伦萨小镇小程序的品牌、商品、SKU、价格和库存；
- 将小程序商品发布到闲鱼；
- 对比小程序货源与闲鱼在售商品；
- 更新闲鱼商品的价格、库存、规格、图片和描述；
- 恢复历史下架商品，保留原闲鱼链接的收藏和流量；
- 将小程序已无货的商品加入闲鱼下架队列；
- 保存价格趋势、品牌品类归属和最近 10 天货源稳定度；
- 管理多个闲鱼账号及各自队列。

项目通过后端接口操作闲鱼，不依赖浏览器自动点击。

## 数据来源

### 佛罗伦萨小镇小程序

```text
API: https://aiopro.fvo2o.com/api/h5app/wxapp
AppID: wx8fa740aa841dafb4
代码: server/internal/catalog/
```

从这里读取地区、品牌门店、商品列表、商品详情、货号、品类、价格、SKU、库存和图片。

### 闲鱼

```text
MTop: https://h5api.m.goofish.com/h5
代码: server/internal/xianyu/
      server/internal/marketplace/
```

- 普通闲鱼会话：发布、编辑、恢复商品及部分查询；
- 商家工作台会话：读取完整在售/下架列表和执行批量下架。

### 本地存储

- MongoDB：商品库、品牌关系、价格趋势、稳定度、闲鱼商品快照和发布任务；
- Redis：小程序商详缓存，默认 30 分钟；
- `runtime/session.key`：闲鱼会话加密密钥。

## 目录说明

| 目录 | 作用 |
| --- | --- |
| `inventory-radar/` | React 前端，包含商品库、发布中心、下架中心、渠道上架、品牌维护和价格趋势页面。 |
| `server/` | Go 后端，负责外部接口、数据存储和任务队列。 |
| `deploy/` | 前端、API、MongoDB、Redis 的 Docker Compose 配置。 |
| `scripts/` | 项目启动和停止脚本。 |
| `runtime/` | 本地运行数据和密钥，不要提交或删除。 |
| `sourceCode/` | 小程序和闲鱼商家后台的反编译/抓取参考代码，默认只读。 |

### 反编译参考项目

`sourceCode/` 不是 SideJob 正式源码，只用于查找第三方接口、参数和字段。

| 目录 | 来源与用途 |
| --- | --- |
| `佛罗伦萨小镇奥莱商品_wx8fa740aa841dafb4_反编译/` | 当前主要货源小程序。用于分析品牌门店、商品列表、商详、SKU、库存、价格和图片接口。 |
| `闲鱼_wx9882f2a891880616_反编译/` | 闲鱼小程序。用于辅助理解闲鱼商品、账号和交易相关接口。 |
| `拼多多_wx32540bd863b27570_反编译/` | 拼多多小程序。主要用于比价功能的接口和字段参考。 |
| `seller-goofish-frontend-web/` | 闲鱼商家工作台抓取的静态页面、路由和接口记录。用于分析在售、下架、编辑、商品数据和超级擦亮等商家能力。 |

第三方代码可能经过压缩、混淆或反编译，不能直接复制到正式代码。需要先确认真实接口请求，再在 `server/` 中重新实现。

### 前端核心文件

| 文件 | 作用 |
| --- | --- |
| `src/App.tsx` | 主布局、导航和页面入口。 |
| `src/PublishCenterPage.tsx` | 发布中心和任务队列。 |
| `src/OfflineCenterPage.tsx` | 下架中心。 |
| `src/MarketplacePage.tsx` | 闲鱼在售商品和稳定度。 |
| `src/BrandMaintenancePage.tsx` | 聚合品牌维护。 |
| `src/api.ts` | 小程序商品接口。 |
| `src/xianyuApi.ts` | 闲鱼和发布中心接口。 |

### 后端核心目录

| 目录 | 作用 |
| --- | --- |
| `internal/catalog/` | 小程序商品、商品库、价格趋势、品类归属和稳定度。 |
| `internal/xianyu/` | 闲鱼发布、编辑、恢复、下架和图片处理。 |
| `internal/marketplace/` | 闲鱼商家后台在售/下架快照。 |
| `internal/publish/` | 发布任务队列和执行器。 |
| `internal/handler/` | HTTP 接口和业务流程入口，路由在 `routes.go`。 |
| `internal/repository/` | MongoDB 数据读写。 |
| `internal/model/` | 数据库模型。 |
| `internal/types/` | 前后端接口结构。 |
| `internal/svc/` | 服务依赖装配。 |
| `internal/security/` | 闲鱼会话加密。 |

后端启动入口是 `server/sidejob.go`。

## 核心数据流程

```text
读取小程序品牌全部商品
  → 按货号合并多个地区货源
  → 读取实时商详和 SKU
  → 对比闲鱼在售及历史商品
  → 生成发布、修改、恢复或下架任务
  → 按闲鱼账号串行执行
```

判断缺货时必须检查聚合品牌的所有地区。只要任意地区仍有可售库存，就不能下架闲鱼商品。

## 注意事项

- 不要提交或删除 `runtime/`；
- 不要输出 Cookie、Token、签名和 `session.key`；
- `sourceCode/` 只用于分析第三方接口；
- 网络失败或小程序数据不完整时，不能判断商品已下架；
- 闲鱼数据必须按 `accountId` 隔离。
