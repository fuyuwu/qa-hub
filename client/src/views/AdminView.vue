<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { api, type Difficulty, type Question, type QuestionInput } from "../api/client";
import { useApiKey } from "../composables/useApiKey";

const { apiKey } = useApiKey();

const emptyForm = (): QuestionInput => ({
  question: "",
  answer: "",
  category: "",
  difficulty: "medium",
  source: "",
  followUp: "",
  tags: [],
});

const form = reactive<QuestionInput>(emptyForm());
const tagsText = ref("");
const editingId = ref<string | null>(null);
const submitting = ref(false);
const formError = ref("");
const formSuccess = ref("");

const questions = ref<Question[]>([]);
const loading = ref(false);
const listError = ref("");

async function loadQuestions() {
  loading.value = true;
  listError.value = "";
  try {
    const res = await api.listQuestions({ pageSize: 100 });
    questions.value = res.data;
  } catch (err) {
    listError.value = err instanceof Error ? err.message : "載入失敗";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, emptyForm());
  tagsText.value = "";
  editingId.value = null;
  formError.value = "";
}

function startEdit(q: Question) {
  editingId.value = q.id;
  Object.assign(form, {
    question: q.question,
    answer: q.answer,
    category: q.category,
    difficulty: q.difficulty,
    source: q.source ?? "",
    followUp: q.followUp ?? "",
    reviewStatus: q.reviewStatus,
    tags: q.tags,
  });
  tagsText.value = q.tags.join(", ");
  formError.value = "";
  formSuccess.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function submitForm() {
  if (!apiKey.value) {
    formError.value = "請先在上方輸入 API Key";
    return;
  }
  formError.value = "";
  formSuccess.value = "";
  submitting.value = true;

  const payload: QuestionInput = {
    ...form,
    source: form.source ? form.source : undefined,
    followUp: form.followUp ? form.followUp : undefined,
    tags: tagsText.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };

  try {
    if (editingId.value) {
      await api.updateQuestion(editingId.value, payload, apiKey.value);
      formSuccess.value = "已更新題目";
    } else {
      await api.createQuestion(payload, apiKey.value);
      formSuccess.value = "已新增題目";
    }
    resetForm();
    await loadQuestions();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : "送出失敗";
  } finally {
    submitting.value = false;
  }
}

async function removeQuestion(q: Question) {
  if (!apiKey.value) {
    listError.value = "請先在上方輸入 API Key";
    return;
  }
  if (!window.confirm(`確定要刪除「${q.question}」嗎？`)) return;
  try {
    await api.deleteQuestion(q.id, apiKey.value);
    await loadQuestions();
  } catch (err) {
    listError.value = err instanceof Error ? err.message : "刪除失敗";
  }
}

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

onMounted(loadQuestions);
</script>

<template>
  <section>
    <h1>題庫管理</h1>
    <p v-if="!apiKey" class="warning">請先在上方輸入 API Key，才能新增／編輯／刪除題目。</p>

    <form class="form" @submit.prevent="submitForm">
      <h2>{{ editingId ? "編輯題目" : "新增題目" }}</h2>

      <label>
        題目
        <textarea v-model="form.question" required rows="2"></textarea>
      </label>

      <label>
        答案
        <textarea v-model="form.answer" required rows="4"></textarea>
      </label>

      <div class="row">
        <label>
          分類
          <input v-model="form.category" required placeholder="例如 JavaScript、CSS、React" />
        </label>
        <label>
          難度
          <select v-model="form.difficulty">
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </label>
      </div>

      <label>
        追問 / 延伸問題（選填）
        <textarea v-model="form.followUp" rows="2"></textarea>
      </label>

      <label>
        來源連結（選填）
        <input v-model="form.source" type="url" placeholder="https://..." />
      </label>

      <label>
        標籤（用逗號分隔）
        <input v-model="tagsText" placeholder="例如 async, event-loop" />
      </label>

      <p v-if="formError" class="error">{{ formError }}</p>
      <p v-if="formSuccess" class="success">{{ formSuccess }}</p>

      <div class="form-actions">
        <button type="submit" :disabled="submitting">
          {{ editingId ? "更新題目" : "新增題目" }}
        </button>
        <button type="button" class="secondary" @click="resetForm" v-if="editingId">取消編輯</button>
      </div>
    </form>

    <h2 class="list-title">現有題目（{{ questions.length }}）</h2>
    <p v-if="listError" class="error">{{ listError }}</p>
    <p v-else-if="loading" class="muted">載入中…</p>

    <ul class="list">
      <li v-for="q in questions" :key="q.id" class="row-item">
        <div class="row-main">
          <span class="badge" :class="`diff-${q.difficulty}`">{{ q.difficulty }}</span>
          <span class="badge">{{ q.category }}</span>
          <span class="q-text">{{ q.question }}</span>
        </div>
        <div class="row-actions">
          <button @click="startEdit(q)">編輯</button>
          <button class="danger" @click="removeQuestion(q)">刪除</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.warning {
  color: var(--color-medium);
}

.form {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 32px;
}

.form h2 {
  margin: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
}

input,
textarea,
select {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  resize: vertical;
}

.row {
  display: flex;
  gap: 14px;
}

.row label {
  flex: 1;
}

.error {
  color: var(--color-danger);
}

.success {
  color: var(--color-easy);
}

.muted {
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-weight: 600;
}

.form-actions .secondary {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.list-title {
  margin-bottom: 12px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.row-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.q-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-text-muted);
  flex-shrink: 0;
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

.row-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.row-actions button {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
}

.row-actions .danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
