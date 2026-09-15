<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { api, type Difficulty, type Question } from "../api/client";

const categories = ref<string[]>([]);
const tags = ref<string[]>([]);

const category = ref("");
const difficulty = ref<Difficulty | "">("");
const tag = ref("");
const keyword = ref("");

const page = ref(1);
const pageSize = 10;
const total = ref(0);
const totalPages = ref(1);

const questions = ref<Question[]>([]);
const expandedId = ref<string | null>(null);
const loading = ref(false);
const errorMessage = ref("");

async function loadMeta() {
  const [cats, tagList] = await Promise.all([api.listCategories(), api.listTags()]);
  categories.value = cats;
  tags.value = tagList;
}

async function loadQuestions() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await api.listQuestions({
      category: category.value || undefined,
      difficulty: difficulty.value || undefined,
      tag: tag.value || undefined,
      q: keyword.value || undefined,
      page: page.value,
      pageSize,
    });
    questions.value = res.data;
    total.value = res.pagination.total;
    totalPages.value = res.pagination.totalPages;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "載入失敗";
  } finally {
    loading.value = false;
  }
}

let debounceHandle: ReturnType<typeof setTimeout> | undefined;
function onKeywordInput() {
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    page.value = 1;
    loadQuestions();
  }, 300);
}

watch([category, difficulty, tag], () => {
  page.value = 1;
  loadQuestions();
});

watch(page, loadQuestions);

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

onMounted(() => {
  loadMeta();
  loadQuestions();
});
</script>

<template>
  <section>
    <h1>題庫瀏覽</h1>

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

      <select v-model="tag">
        <option value="">全部標籤</option>
        <option v-for="t in tags" :key="t" :value="t">{{ t }}</option>
      </select>

      <input
        v-model="keyword"
        type="search"
        placeholder="搜尋題目或答案關鍵字"
        @input="onKeywordInput"
      />
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="loading" class="muted">載入中…</p>
    <p v-else-if="questions.length === 0" class="muted">沒有符合條件的題目</p>

    <ul class="list">
      <li v-for="qItem in questions" :key="qItem.id" class="card">
        <button class="card-header" @click="toggleExpand(qItem.id)">
          <span class="q-text">{{ qItem.question }}</span>
          <span class="badges">
            <span class="badge" :class="`diff-${qItem.difficulty}`">{{ qItem.difficulty }}</span>
            <span class="badge">{{ qItem.category }}</span>
          </span>
        </button>

        <div v-if="expandedId === qItem.id" class="card-body">
          <p class="answer">{{ qItem.answer }}</p>
          <p v-if="qItem.followUp" class="follow-up">追問：{{ qItem.followUp }}</p>
          <a v-if="qItem.source" :href="qItem.source" target="_blank" rel="noopener">參考來源</a>
          <div class="tag-list">
            <span v-for="t in qItem.tags" :key="t" class="tag">#{{ t }}</span>
          </div>
        </div>
      </li>
    </ul>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--">上一頁</button>
      <span class="muted">第 {{ page }} / {{ totalPages }} 頁（共 {{ total }} 題）</span>
      <button :disabled="page >= totalPages" @click="page++">下一頁</button>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filters select,
.filters input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.filters input {
  flex: 1;
  min-width: 200px;
}

.muted {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-danger);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  overflow: hidden;
}

.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  text-align: left;
  color: var(--color-text);
}

.q-text {
  font-weight: 500;
}

.badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-text-muted);
  white-space: nowrap;
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

.card-body {
  padding: 0 16px 16px;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}

.answer {
  white-space: pre-wrap;
  line-height: 1.6;
}

.follow-up {
  color: var(--color-text-muted);
  font-size: 14px;
}

.tag-list {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: var(--color-accent);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
