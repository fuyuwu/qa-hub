import { ref, watch } from "vue";

const STORAGE_KEY = "qa-hub:api-key";

const apiKey = ref(localStorage.getItem(STORAGE_KEY) ?? "");

watch(apiKey, (value) => {
  if (value) localStorage.setItem(STORAGE_KEY, value);
  else localStorage.removeItem(STORAGE_KEY);
});

export function useApiKey() {
  return { apiKey };
}
