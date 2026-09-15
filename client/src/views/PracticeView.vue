<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { api, type Difficulty, type Question, type ReviewStatus } from "../api/client";
import { useApiKey } from "../composables/useApiKey";

const { apiKey } = useApiKey();

const categories = ref<string[]>([]);
const category = ref("");
const difficulty = ref<Difficulty | "">("");

const pool = ref<Question[]>([]);
const order = ref<number[]>([]);
const currentIndex = ref(0);
const revealed = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const statusMessage = ref("");

const current = computed<Question | null>(() => {
  if (order.value.length === 0) return null;
  const poolIndex = order.value[currentIndex.value];
  return pool.value[poolIndex] ?? null;
});

function shuffle(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadPool() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await api.listQuestions({
      category: category.value || undefined,
      difficulty: difficulty.value || undefined,
      pageSize: 100,
    });
    pool.value = res.data;
    order.value = shuffle(res.data.length);
    currentIndex.value = 0;
    revealed.value = false;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "載入失敗";
  } finally {
    loading.value = false;
  }
}

async function reveal() {
  revealed.value = true;
  const q = current.value;
  if (!q || !apiKey.value) return;
  try {
    const updated = await api.updateQuestion(q.id, { practiceCount: q.practiceCount + 1 }, apiKey.value);
    const idx = pool.value.findIndex((item) => item.id === q.id);
    if (idx !== -1) pool.value[idx] = updated;
  } catch {
    // Practice count is a nice-to-have; don't block the flow if the key is wrong.
  }
}

async function mark(status: ReviewStatus) {
  const q = current.value;
  if (!q) return;
  if (!apiKey.value) {
    statusMessage.value = "請先在上方輸入 API Key 才能記錄複習狀態";
    return;
  }
  statusMessage.value = "";
  try {
    const updated = await api.updateQuestion(q.id, { reviewStatus: status }, apiKey.value);
    const idx = pool.value.findIndex((item) => item.id === q.id);
    if (idx !== -1) pool.value[idx] = updated;
  } catch (err) {
    statusMessage.value = err instanceof Error ? err.message : "更新失敗";
    return;
  }
  next();
}

function next() {
  revealed.value = false;
  if (currentIndex.value < order.value.length - 1) {
    currentIndex.value++;
  } else {
    statusMessage.value = "已經是最後一題了，可以重新洗牌再練一輪";
  }
}

async function loadMeta() {
  categories.value = await api.listCategories();
}

watch([category, difficulty], loadPool);

onMounted(() => {
  loadMeta();
  loadPool();
});
</script>

<template>
  <section>
    <h1>練習模式</h1>

    <div class="filters">
      <select v-model="category">
        <option value="">全部分類</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="difficulty">
        <option value="">全部難度</option>
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
      </select>
      <button @click="loadPool">重新洗牌</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="loading" class="muted">載入中…</p>
    <p v-else-if="!current" class="muted">沒有符合條件的題目</p>

    <template v-else>
      <p class="progress muted">
        第 {{ currentIndex + 1 }} / {{ order.length }} 題
        <span v-if="!apiKey">（未輸入 API Key，僅瀏覽不記錄進度）</span>
      </p>

      <div class="flashcard">
        <div class="badges">
          <span class="badge" :class="`diff-${current.difficulty}`">{{ current.difficulty }}</span>
          <span class="badge">{{ current.category }}</span>
          <span class="badge">練習次數 {{ current.practiceCount }}</span>
        </div>

        <p class="question">{{ current.question }}</p>

        <button v-if="!revealed" class="reveal-btn" @click="reveal">顯示答案</button>

        <div v-else class="answer-block">
          <p class="answer">{{ current.answer }}</p>
          <p v-if="current.followUp" class="follow-up">追問：{{ current.followUp }}</p>
          <a v-if="current.source" :href="current.source" target="_blank" rel="noopener">參考來源</a>
        </div>
      </div>

      <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>

      <div class="actions">
        <button @click="mark('reviewing')">還要複習</button>
        <button @click="mark('mastered')">已經熟悉</button>
        <button class="skip" @click="next">跳過</button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters select,
.filters button {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.muted {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-danger);
}

.progress {
  margin-bottom: 12px;
}

.flashcard {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  padding: 28px 24px;
  text-align: center;
}

.badges {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
}

.badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.diff-easy {
  color: var(--color-easy);
}
.diff-medium {
  color: var(--color-medium);
}
.diff-hard {
  color: var(--color-hard);
}

.question {
  font-size: 20px;
  font-weight: 600;
  margin: 12px 0 24px;
  line-height: 1.5;
}

.reveal-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-weight: 600;
}

.answer-block {
  text-align: left;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  margin-top: 8px;
}

.answer {
  white-space: pre-wrap;
  line-height: 1.6;
}

.follow-up {
  color: var(--color-text-muted);
  font-size: 14px;
}

.status-message {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 12px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.actions .skip {
  color: var(--color-text-muted);
}
</style>
