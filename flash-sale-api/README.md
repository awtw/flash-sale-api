# flash-sale-api  
> Havppen pre interview assignment  
---
# 題目
## **高併發限量搶購 API**

**📌 目標**

請設計並實作一個 限量商品搶購 API，確保在高併發環境下：

具有基本測試（Unit Test & Integration Test）

不會發生超賣（Overselling）

可以運行於本地環境，並可透過 README.md 進行安裝與測試

程式碼需放置於 GitHub，並提供 API 測試方式

**📜 作業說明**

你需要開發一個簡單的 **商品庫存管理與購買 API**，並確保在高併發情境下，庫存數量正確，且 API 具備測試覆蓋率。

**📌 需求**

**POST /purchase**

接收一個 product_id，代表要購買的商品

必須扣減該商品庫存

如果庫存不足，應回傳適當錯誤

**GET /products/:id**

查詢特定商品的當前庫存數量

**高併發測試**

你的設計應該允許大量請求同時購買同一個商品時，確保庫存不會被超賣

**📌 進階要求（加分項）**

**Redis 快取**：使用 **Redis** 來提升效能，避免過度查詢資料庫

**使用佇列（如 SQS, RabbitMQ）**：確保搶購過程異步處理，提高可擴展性

**API Rate Limiting**：實作 **限流機制**，避免過度頻繁請求

**🛠 技術規範**

**開發語言**：TypeScript

**框架**：Express.js 或 Nest.js（自由選擇）

**資料庫**：PostgreSQL（可使用 SQLite 來模擬）

**快取**（可選擇加分）：Redis

**測試框架**：Jest / Mocha / Vitest + Supertest

**專案結構建議**：

/src
  /controllers
  /services
  /models
  /tests

**📌 作業提交方式**

**將程式碼上傳至 GitHub**

**提供 README.md，說明如何執行與測試**

**提供 API 測試方式（可用 Postman、cURL 或 Jest 測試）**

**確保專案可通過 npm test**

**⏳ 預期完成時間**

本作業應在 **6 小時內** 完成，你可以適當簡化功能，但重點是：

**確保不會超賣**

**API 具備測試**

**程式碼清晰、可維護**


## **架構概述**

1. **技術選擇**
   * **框架**：NestJS（模組化結構）
   * **資料庫**：PostgreSQL（使用 TypeORM）
   * **訊息佇列**：RabbitMQ（透過 `amqplib` 進行異步處理）
   * **測試**：Jest + Supertest
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

---
