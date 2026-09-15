import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const env = (globalThis as any).process?.env;

const adapter = new PrismaBetterSqlite3({
  url: env?.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const questions = [
  {
    question: "什麼是事件循環（Event Loop）？",
    answer:
      "JavaScript 是單執行緒語言，Event Loop 負責協調呼叫堆疊（call stack）、微任務佇列（microtask queue，如 Promise）與巨集任務佇列（macrotask queue，如 setTimeout）的執行順序。每次呼叫堆疊清空後，會先清空所有微任務，再取出下一個巨集任務執行。",
    category: "JavaScript",
    difficulty: "medium",
    followUp: "Promise.then 跟 setTimeout(fn, 0) 哪個先執行？為什麼？",
    tags: ["event-loop", "async"],
  },
  {
    question: "解釋 CSS 的 BFC（Block Formatting Context）",
    answer:
      "BFC 是一個獨立的渲染區域，內部元素的排版不會影響外部元素，常用來清除浮動、避免 margin collapse。可透過 overflow: hidden、display: flow-root 等方式觸發。",
    category: "CSS",
    difficulty: "medium",
    tags: ["bfc", "layout"],
  },
  {
    question: "React 的 key 屬性為什麼重要？",
    answer:
      "key 幫助 React 在 reconciliation（協調）過程中識別哪些元素改變、新增或移除，讓 diff 演算法更準確有效率。使用陣列 index 當 key 在元素順序會變動時可能導致渲染錯誤或 state 錯亂。",
    category: "React",
    difficulty: "easy",
    followUp: "為什麼不建議用 index 當 key？",
    tags: ["react", "reconciliation"],
  },
  {
    question: "說明瀏覽器從輸入網址到畫面顯示的完整流程",
    answer:
      "大致流程：DNS 解析 →建立 TCP 連線（含 TLS 握手）→ 發送 HTTP 請求 → 伺服器回應 → 瀏覽器解析 HTML 建立 DOM、解析 CSS 建立 CSSOM → 合併成 Render Tree → Layout（計算位置與大小）→ Paint（繪製像素）→ Composite（合成圖層顯示）。",
    category: "Browser",
    difficulty: "hard",
    source: "https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work",
    tags: ["browser", "rendering", "network"],
  },
  {
    question: "什麼是 CSRF？如何防範？",
    answer:
      "CSRF（跨站請求偽造）是攻擊者誘導使用者在已登入狀態下，向目標網站發送非預期的請求。常見防範方式包含 CSRF Token、SameSite Cookie 屬性、驗證 Referer/Origin 標頭。",
    category: "Security",
    difficulty: "medium",
    tags: ["security", "csrf"],
  },
  {
    question: "Vue 的響應式原理是什麼？",
    answer:
      "Vue 2 使用 Object.defineProperty 對資料屬性做 getter/setter 攔截；Vue 3 改用 ES6 Proxy，能更完整地攔截物件操作（如新增屬性、刪除屬性、陣列變化），並搭配依賴收集（dep）與觸發更新（trigger）機制實現響應式。",
    category: "Vue",
    difficulty: "medium",
    followUp: "Vue 3 用 Proxy 解決了 Vue 2 的哪些限制？",
    tags: ["vue", "reactivity"],
  },
];

async function main() {
  for (const { tags, ...data } of questions) {
    await prisma.question.create({
      data: {
        ...data,
        tags: {
          create: tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
    });
  }
  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .catch((err) => {
    console.error(err);
    (globalThis as any).process?.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
