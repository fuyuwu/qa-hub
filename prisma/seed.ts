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
  {
    question: "Vue 3 的 ref 和 reactive 有什麼差別？",
    answer:
      "ref 可以包任何型別的值，內部用 .value 存取（模板中會自動解包）；reactive 只能用於物件類型，直接回傳 Proxy，不需要 .value。reactive 的限制是：整個物件被重新賦值或解構時會失去響應性，需要搭配 toRefs / toRef 保留連結。實務上常以 ref 為主，reactive 用在結構固定的狀態物件。",
    category: "Vue",
    difficulty: "easy",
    source: "https://vuejs.org/guide/essentials/reactivity-fundamentals.html",
    followUp: "為什麼解構 reactive 物件會失去響應性？怎麼解決？",
    tags: ["vue3", "reactivity", "composition-api"],
  },
  {
    question: "computed、watch、watchEffect 有什麼差別？",
    answer:
      "computed 用來產生衍生資料，有快取、只有依賴改變才重新計算，不應該有副作用；watch 需要明確指定監聽來源，可以拿到新舊值，預設是惰性的（不會立刻執行），適合在資料變動時做非同步請求等副作用；watchEffect 會自動收集回呼內用到的響應式依賴，並且立即執行一次，寫起來較簡潔但依賴不夠明確。",
    category: "Vue",
    difficulty: "medium",
    source: "https://vuejs.org/guide/essentials/watchers.html",
    followUp: "watch 的 flush 選項（pre / post / sync）分別代表什麼？",
    tags: ["vue3", "computed", "watch"],
  },
  {
    question: "<script setup> 是什麼？跟一般的 setup() 有什麼不同？",
    answer:
      "<script setup> 是單檔元件（SFC）中的編譯期語法糖，頂層宣告的變數、函式和匯入的元件會自動暴露給模板，不需要手動 return。它使用 defineProps、defineEmits、defineExpose 等編譯器巨集，型別推斷也更好。另外，使用 <script setup> 的元件預設是封閉的，父元件透過 ref 拿不到內部狀態，需要用 defineExpose 明確暴露。",
    category: "Vue",
    difficulty: "easy",
    source: "https://vuejs.org/api/sfc-script-setup.html",
    followUp: "defineProps 為什麼不需要 import？",
    tags: ["vue3", "script-setup", "sfc"],
  },
  {
    question: "Vue 3 的 Teleport 和 Suspense 分別解決什麼問題？",
    answer:
      "Teleport 可以把元件的一部分模板渲染到 DOM 中的其他位置（例如把 modal 掛到 body 底下），避免被父層的 overflow、z-index 或 transform 影響，但邏輯上仍屬於原本的元件，props 與狀態不變。Suspense 用來協調非同步依賴（含 async setup、使用頂層 await 的 <script setup>、非同步元件），在等待期間顯示 #fallback，完成後再顯示 #default。Suspense 在官方文件中長期標示為實驗性功能，使用前建議先確認目前版本的說明。",
    category: "Vue",
    difficulty: "medium",
    source: "https://vuejs.org/guide/built-ins/teleport.html",
    tags: ["vue3", "teleport", "suspense"],
  },
  {
    question: "Vue 3 的 v-model 跟 Vue 2 有什麼不同？",
    answer:
      "Vue 3 的元件 v-model 預設使用 modelValue 這個 prop 和 update:modelValue 事件（Vue 2 是 value / input）。同一個元件可以綁定多個 v-model（例如 v-model:title），也能自訂修飾符。Vue 3.4 之後可以用 defineModel() 巨集，直接得到一個可讀寫的 ref，不用再手動宣告 prop 和 emit。",
    category: "Vue",
    difficulty: "medium",
    source: "https://vuejs.org/guide/components/v-model.html",
    followUp: "defineModel 底層幫你做了什麼？",
    tags: ["vue3", "v-model", "component"],
  },
  {
    question: "Nuxt 3 有哪些渲染模式？",
    answer:
      "預設是 Universal Rendering：伺服器先輸出 HTML，客戶端再 hydration 接管互動。也可以設定 ssr: false 變成純客戶端渲染（SPA）、用 nuxt generate 或 routeRules 的 prerender 做靜態預渲染（SSG），或以 routeRules 對不同路由套用不同策略（Hybrid Rendering），例如 swr / isr 快取、prerender、ssr: false、redirect 等。",
    category: "Nuxt",
    difficulty: "medium",
    source: "https://nuxt.com/docs/guide/concepts/rendering",
    followUp: "routeRules 裡的 swr 和 isr 有什麼差別？",
    tags: ["nuxt3", "ssr", "ssg", "rendering"],
  },
  {
    question: "Nuxt 3 的 useFetch、useAsyncData 和 $fetch 有什麼差別？",
    answer:
      "$fetch 是對 ofetch 的封裝，單純發出請求，在 SSR 時伺服器和客戶端各會打一次，可能造成重複請求。useAsyncData 包裝任何非同步函式，用 key 做去重，並把伺服器端的結果放進 payload 傳給客戶端，hydration 時不會重打，回傳 data、pending、error、refresh 等。useFetch 等於 useAsyncData 加上 $fetch 的語法糖，key 預設由 URL 與選項產生。",
    category: "Nuxt",
    difficulty: "medium",
    source: "https://nuxt.com/docs/getting-started/data-fetching",
    followUp: "在元件 setup 中直接呼叫 $fetch 為什麼會造成重複請求？",
    tags: ["nuxt3", "data-fetching", "useFetch"],
  },
  {
    question: "Nuxt 3 的自動匯入（auto-imports）是怎麼運作的？",
    answer:
      "Nuxt 會在建置時掃描 components/、composables/、utils/ 等目錄，以及 Vue 和 Nuxt 內建的 API（例如 ref、computed、useRoute、useState），讓你不必手動 import。底層由 unimport 在編譯時轉換程式碼，只會打包實際有用到的項目，並產生型別宣告讓 TypeScript 與編輯器能辨識。composables/ 預設只掃描最上層的檔案，子目錄需要重新匯出，或用 imports.dirs 設定。",
    category: "Nuxt",
    difficulty: "easy",
    source: "https://nuxt.com/docs/guide/concepts/auto-imports",
    tags: ["nuxt3", "auto-imports", "composables"],
  },
  {
    question: "Nuxt 3 的 server 目錄和 Nitro 是什麼？",
    answer:
      "Nitro 是 Nuxt 3 的伺服器引擎，底層使用 h3 作為 HTTP 框架，支援檔案式路由，並能針對 Node、Vercel、Cloudflare 等不同環境輸出對應的部署格式（preset）。server/api 放 API 路由（會加上 /api 前綴）、server/routes 放任意路徑的路由、server/middleware 放每個請求都會執行的中介層，另有 server/plugins 與 server/utils。處理函式用 defineEventHandler 定義，檔名可加上 .get、.post 等後綴限制 HTTP 方法。",
    category: "Nuxt",
    difficulty: "medium",
    source: "https://nuxt.com/docs/guide/directory-structure/server",
    followUp: "server/api/users.get.ts 和 server/api/users.ts 的差別是什麼？",
    tags: ["nuxt3", "nitro", "server"],
  },
  {
    question: "Nuxt 3 的 hydration mismatch 是什麼？要怎麼避免？",
    answer:
      "hydration mismatch 是指伺服器渲染出的 HTML 和客戶端第一次渲染的結果不一致，Vue 會在 console 警告，嚴重時畫面會被重新繪製或出現錯亂。常見原因包含使用 Math.random()、Date.now() 這類每次結果不同的值、在渲染階段讀取 window 或 localStorage（伺服器端不存在）、HTML 結構不合法（例如 <p> 內放 <div>），以及依時區或語系格式化日期。解法有：用 useState 讓伺服器與客戶端共用同一份狀態、把只能在瀏覽器執行的邏輯放進 onMounted 或用 <ClientOnly> 包起來、以 import.meta.client 判斷執行環境、固定格式化用的時區。",
    category: "Nuxt",
    difficulty: "hard",
    followUp: "useState 和一般的 ref 差在哪？為什麼 SSR 要用 useState 共享狀態？",
    tags: ["nuxt3", "ssr", "hydration"],
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
