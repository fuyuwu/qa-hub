import { ref } from "vue";
import { api, ApiError } from "../api/client";

const STORAGE_KEY = "qa-hub:api-key";

// Earlier versions kept the key in localStorage; drop any leftover copy.
localStorage.removeItem(STORAGE_KEY);

/** The verified key; views read this to authorize writes. */
const apiKey = ref(sessionStorage.getItem(STORAGE_KEY) ?? "");
const draft = ref("");
const submitting = ref(false);
const error = ref("");

async function submit() {
  const value = draft.value.trim();
  if (!value || submitting.value) return;

  submitting.value = true;
  error.value = "";
  try {
    await api.verifyApiKey(value);
    apiKey.value = value;
    sessionStorage.setItem(STORAGE_KEY, value);
    draft.value = "";
  } catch (e) {
    error.value = e instanceof ApiError && e.status === 401 ? "API Key 不正確" : "無法驗證，請稍後再試";
  } finally {
    submitting.value = false;
  }
}

function logout() {
  apiKey.value = "";
  sessionStorage.removeItem(STORAGE_KEY);
}

export function useApiKey() {
  return { apiKey, draft, submitting, error, submit, logout };
}
