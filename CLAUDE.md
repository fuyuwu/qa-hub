# qa-hub

面試題庫管理平台。後端 Express API + 前端 Vue 3 SPA，用 SQLite 儲存題目。

## 架構

- **Backend** (`/`): Express 5 + Prisma (SQLite) + Zod + TypeScript
- **Frontend** (`/client`): Vue 3 + Vue Router + TypeScript + Vite

## 技術棧

### 後端
- Express 5, TypeScript, tsx (dev), Prisma 7, Zod 4, SQLite (`dev.db`)

### 前端
- Vue 3 + TypeScript, Vue Router 4, Vite 8

## 常用指令

```bash
# 後端（根目錄）
npm run dev            # tsx watch 啟動
npm run build          # tsc 編譯
npm run prisma:migrate # 資料庫 migrate
npm run prisma:studio  # Prisma Studio GUI
npm run seed           # 填充測試資料

# 前端（client/）
npm run dev            # Vite 開發伺服器
npm run build          # vue-tsc + vite build
```

## 專案結構

```
src/
  index.ts            # Express 入口
  routes/
    questions.ts      # 題目 CRUD API
    meta.ts           # 分類/難度 metadata
  middleware/         # Express middleware
  schemas/            # Zod 驗證 schema
  lib/
    prisma.ts         # Prisma client 單例

prisma/
  schema.prisma       # 資料模型（Question, Tag, TagsOnQuestions）

client/
  src/
    views/            # 頁面元件
    router/           # 路由設定
    api/              # API 呼叫函式
    composables/      # 共用邏輯
```

## 資料模型

- `Question`: 題目、解答、分類、難度、追蹤狀態（new/reviewing/mastered）
- `Tag`: 標籤
- `TagsOnQuestions`: 多對多關聯

## 開發慣例

- Zod schema 放在 `src/schemas/`，用於 API 輸入驗證
- Prisma client 用 `src/lib/prisma.ts` 統一匯出
- 後端跑在預設 port，前端 dev 時 proxy 到後端
