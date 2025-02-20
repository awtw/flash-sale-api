# flash-sale-api

Havppen pre interview assignment

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
