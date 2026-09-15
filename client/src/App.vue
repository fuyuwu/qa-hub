<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useApiKey } from "./composables/useApiKey";

const { apiKey } = useApiKey();
</script>

<template>
  <header class="topbar">
    <nav class="nav">
      <RouterLink to="/" class="brand">QA Hub</RouterLink>
      <RouterLink to="/">瀏覽</RouterLink>
      <RouterLink to="/practice">練習</RouterLink>
      <RouterLink to="/admin">管理</RouterLink>
    </nav>
    <input
      v-model="apiKey"
      class="api-key-input"
      type="password"
      placeholder="API Key（練習標記 / 管理功能需要）"
      autocomplete="off"
    />
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

.api-key-input {
  width: 260px;
  max-width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
