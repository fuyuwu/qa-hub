# QA Hub

自己在用的前端面試題庫工具：瀏覽 / 篩選題目、洗牌抽卡練習、追蹤複習進度、管理題庫。後端 Express API + 前端 Vue 3 SPA，資料存在 SQLite。

## 功能

- **瀏覽**：依分類、難度、標籤篩選，關鍵字搜尋題目與答案
- **練習模式**：洗牌抽卡（flashcard），翻答案、看追問，標記「還要複習 / 已經熟悉」，記錄練習次數；沒有 API Key 也能瀏覽，只是不會記錄進度
- **管理**：新增 / 編輯 / 刪除題目，寫入操作都需要 API Key，避免公開的題庫被亂改

## 技術棧

| | |
|---|---|
| Backend | Express 5、Prisma 7（SQLite）、Zod 4、TypeScript |
| Frontend | Vue 3（`<script setup>`）、Vue Router 4、Vite、TypeScript |

## 專案結構

```
qa-hub/
├── src/                  # Express API
│   ├── index.ts          # 入口，掛載路由、錯誤處理
│   ├── routes/
│   │   ├── questions.ts  # 題目 CRUD + 分頁/篩選/搜尋
│   │   └── meta.ts       # 分類、標籤清單
│   ├── middleware/
│   │   └── apiKeyAuth.ts # 寫入操作的 API Key 驗證
│   ├── schemas/
│   │   └── question.ts   # Zod 輸入驗證
│   └── lib/prisma.ts     # Prisma client 單例
├── prisma/
│   ├── schema.prisma     # Question / Tag / TagsOnQuestions
│   └── seed.ts           # 灌入一批前端面試題當範例資料
└── client/                # Vue 3 SPA
    └── src/
        ├── views/         # BrowseView / PracticeView / AdminView
        ├── api/client.ts  # 打 API 的 typed client
        └── composables/useApiKey.ts
```

## 資料模型

- `Question`：題目、解答、分類、難度（easy/medium/hard）、追問、來源連結、複習狀態（new/reviewing/mastered）、練習次數
- `Tag` / `TagsOnQuestions`：多對多標籤關聯

## API

| Method | Path | 說明 | 需要 API Key |
|---|---|---|---|
| GET | `/health` | 健康檢查 | |
| GET | `/api/questions` | 列表（支援 `category`/`difficulty`/`reviewStatus`/`tag`/`q`/`page`/`pageSize`） | |
| GET | `/api/questions/:id` | 單筆 | |
| POST | `/api/questions` | 新增 | ✓ |
| PUT | `/api/questions/:id` | 更新（部分欄位即可） | ✓ |
| DELETE | `/api/questions/:id` | 刪除 | ✓ |
| GET | `/api/categories` | 現有的分類清單 | |
| GET | `/api/tags` | 現有的標籤清單 | |

需要 API Key 的路由要帶 `x-api-key` header。

## 本機啟動

**後端**

```bash
npm install
cp .env.example .env   # 填 API_KEY
npm run prisma:migrate
npm run seed            # 灌一批範例題目
npm run dev              # http://localhost:3000
```

**前端**（另開一個終端機）

```bash
cd client
npm install
cp .env.example .env   # VITE_API_BASE_URL 指到後端網址
npm run dev              # http://localhost:5173
```

## License

MIT
