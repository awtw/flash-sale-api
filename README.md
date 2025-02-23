# flash-sale-api

# **Flash Sale API - Havppen Pre-Interview Assignment**

## **📌 架構概述**

本專案是一個 **高併發限量搶購 API**，使用 **NestJS** + **PostgreSQL** + **Redis** + **RabbitMQ**，確保在高併發環境下，庫存準確無誤，不會發生超賣問題。

---

## **🛠 1. 技術選擇**

- **框架**：NestJS（模組化架構）
- **資料庫**：PostgreSQL（使用 TypeORM）
- **快取系統**：Redis（提升讀取效能）
- **訊息佇列**：RabbitMQ（透過 `amqplib` 進行異步處理）
- **測試**：Jest

---

## **🔹 2. 核心功能**


| API 端點        | 方法    | 描述                     |
| --------------- | ------- | ------------------------ |
| `/purchase`     | `POST`  | 購買商品，確保不超賣     |
| `/products/:id` | `GET`   | 查詢特定商品的庫存       |
| `RabbitMQ`      | `Queue` | 佇列處理請求，避免鎖爭搶 |

---

## **🔹 3. 高併發保護機制**

1. **行鎖**（`SELECT ... FOR UPDATE`）：確保購買請求不會同時操作同一筆庫存
2. **RabbitMQ 非同步處理**：避免高流量直接衝擊資料庫
3. **Redis 快取**：減少頻繁查詢資料庫，提升讀取效能
4. **API Rate Limiting**：防止惡意攻擊

---

## **🚀 1. 安裝與設定**

### **📌 1.1. 安裝相依套件**

```sh
git clone https://github.com/你的GitHub帳號/flash-sale-api.git
cd flash-sale-api
npm install
```

## **架構概述**

1. **技術選擇**
   * **框架**：NestJS（模組化結構）
   * **資料庫**：PostgreSQL（使用 TypeORM）
   * **訊息佇列**：RabbitMQ（透過 `amqplib` 進行異步處理）
   * **測試**：Jest
2. **核心功能**
   * `POST /purchase`：購買商品，確保高併發下不會超賣
   * `GET /products/:id`：查詢商品庫存
   * **RabbitMQ 佇列處理**：確保高流量下請求依序執行，避免資料庫鎖爭搶
   * **高併發保護**：
     * **行鎖**（`SELECT ... FOR UPDATE`）避免競態條件
     * **RabbitMQ 非同步佇列**（避免大量請求直接打 DB）
3. **部署環境**
   * 使用 `docker-compose` 啟動 PostgreSQL 和 RabbitMQ
   * 提供 `README.md` 說明如何運行 API

## 安裝

```sh
# 安裝 Node.js
brew install node

# 安裝 Docker
brew install --cask docker

# 專案安裝
git clone git@github.com:awtw/flash-sale-api.git
cd flash-sale-api

npm install

# 建立環境變數
touch .env
# PostgreSQL 環境變數
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=password
DATABASE_NAME=flash_sale

# Redis 環境變數
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ 環境變數
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# 啟動專案
docker-compose up -d --build
docker ps

```

## 專案結構

```sh
/src
  /controllers
    ├── product.controller.ts       # 處理 API 請求
  /services
    ├── product.service.ts          # 主要業務邏輯（購買、查詢庫存）
    ├── queue.service.ts            # RabbitMQ 訊息佇列處理
  /models
    ├── product.entity.ts           # 商品資料模型（TypeORM）
  /config
    ├── database.config.ts          # 資料庫連線設定
    ├── redis.config.ts             # Redis 設定
    ├── rabbitmq.config.ts          # RabbitMQ 設定
    ├── logger.config.ts            # 日誌管理
  /middleware
    ├── logger.middleware.ts        # 日誌紀錄 Middleware
  /tests
    ├── product.service.spec.ts     # 產品邏輯測試
    ├── product.controller.spec.ts  # API 測試
    ├── queue.service.spec.ts       # RabbitMQ 測試
```
