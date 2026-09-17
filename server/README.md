# SideJob Server

本地 Go-zero 服务，负责加密保存闲鱼会话、调用闲鱼 MTop API 和管理发布任务。发布过程不打开浏览器，也不模拟页面点击。

## 一键启动开发环境

项目根目录执行：

```bash
./scripts/dev.sh
```

脚本会启动 MongoDB、Go-zero API 和 React 开发服务器。

## 全容器启动

项目根目录执行：

```bash
./scripts/container-up.sh
```

启动后访问：

```text
http://127.0.0.1:9300
```

容器结构：

- `sidejob-web`：Nginx + React，对外映射 `9300:80`。
- `sidejob-api`：Go-zero，仅在容器网络监听 `9800`，不映射宿主机端口。
- `sidejob-mongodb`：仅在容器网络监听 `27017`。

停止容器但保留 MongoDB 数据：

```bash
./scripts/container-down.sh
```

## 分别启动

1. 启动 MongoDB：

   ```bash
   cd ../deploy
   docker compose up -d mongodb
   ```

2. 启动 API：

   ```bash
   cd ../server
   go run . -f etc/sidejob-api.yaml
   ```

3. 查询服务状态：

   ```bash
   curl http://127.0.0.1:8888/api/healthz
   ```

在前端右上角点击“连接闲鱼”，粘贴闲鱼网页请求中的完整 Cookie。后端会调用闲鱼用户接口校验并使用本机独立密钥加密保存。连接状态可查询：

```bash
curl http://127.0.0.1:8888/api/xianyu/connection
```

## 发布流程

1. 在商品卡片或商品详情点击“去闲鱼卖”。
2. 调整标题、描述、售价和原价。
3. 点击“确认并发布”。
4. 服务下载最多九张商品图，并依次调用图片上传、属性推荐、服务配置和正式发布 API。
5. 登录过期时任务进入 `needs_login`，重新粘贴 Cookie 后可点击重试。
6. 发布成功后可直接打开闲鱼商品地址，全程不打开发布页面。

发布任务保存在 MongoDB 的 `publish_tasks` 集合中，任务串行执行，降低账号接口并发风险。

## 安全边界

- MongoDB 只绑定 `127.0.0.1`。
- Cookie 使用 AES-256-GCM 加密后存入 MongoDB，密钥独立保存在系统应用配置目录的 `SideJob/session.key`。
- 密钥文件权限为当前用户可读写，不应提交 Git、打包或同步云盘。
- API 和日志不返回 Cookie 明文。
- 发布任务由单消费者串行执行，避免账号接口并发触发风控。
