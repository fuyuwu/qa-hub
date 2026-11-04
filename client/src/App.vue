<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useApiKey } from "./composables/useApiKey";

const { apiKey, draft, submitting, error, submit, logout } = useApiKey();
</script>

<template>
  <header class="topbar">
    <nav class="nav">
      <RouterLink to="/" class="brand">QA Hub</RouterLink>
      <RouterLink to="/">瀏覽</RouterLink>
      <RouterLink to="/practice">練習</RouterLink>
      <RouterLink to="/admin">管理</RouterLink>
    </nav>
    <div v-if="apiKey" class="api-key-status">
      <span class="authorized">已授權</span>
      <button type="button" class="api-key-button" @click="logout">登出</button>
    </div>
    <form v-else class="api-key-form" @submit.prevent="submit">
      <div class="api-key-row">
        <input
          v-model="draft"
          class="api-key-input"
          type="password"
          placeholder="API Key（練習標記 / 管理功能需要）"
          autocomplete="new-password"
          :aria-invalid="!!error"
        />
        <button type="submit" class="api-key-button" :disabled="!draft.trim() || submitting">Submit</button>
      </div>
      <p v-if="error" class="api-key-error" role="alert">{{ error }}</p>
    </form>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 2px;
  border-bottom: 2px solid transparent;
}

.nav a.router-link-exact-active {
  color: var(--color-text);
  border-bottom-color: var(--color-accent);
}

.brand {
  font-weight: 700;
  color: var(--color-text) !important;
  font-size: 16px;
  margin-right: 4px;
}

.api-key-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-key-row,
.api-key-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-input {
  width: 260px;
  max-width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.api-key-input[aria-invalid="true"] {
  border-color: var(--color-danger);
}

.api-key-button {
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.api-key-button[type="submit"] {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

.api-key-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.authorized {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-easy);
}

.api-key-error {
  margin: 0;
  font-size: 13px;
  color: var(--color-danger);
}
</style>
