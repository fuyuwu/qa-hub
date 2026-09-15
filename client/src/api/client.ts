export type Difficulty = "easy" | "medium" | "hard";
export type ReviewStatus = "new" | "reviewing" | "mastered";

export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: Difficulty;
  source: string | null;
  followUp: string | null;
  reviewStatus: ReviewStatus;
  practiceCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface QuestionListResponse {
  data: Question[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface QuestionListParams {
  category?: string;
  difficulty?: Difficulty;
  reviewStatus?: ReviewStatus;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface QuestionInput {
  question: string;
  answer: string;
  category: string;
  difficulty?: Difficulty;
  source?: string;
  followUp?: string;
  reviewStatus?: ReviewStatus;
  practiceCount?: number;
  tags?: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; apiKey?: string } = {},
): Promise<T> {
  const { method = "GET", body, apiKey } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      (payload?.error?.fieldErrors && JSON.stringify(payload.error.fieldErrors)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return payload as T;
}

function buildQuery(params: QuestionListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  listQuestions(params: QuestionListParams = {}) {
    return request<QuestionListResponse>(`/api/questions${buildQuery(params)}`);
  },
  getQuestion(id: string) {
    return request<Question>(`/api/questions/${id}`);
  },
  createQuestion(input: QuestionInput, apiKey: string) {
    return request<Question>(`/api/questions`, { method: "POST", body: input, apiKey });
  },
  updateQuestion(id: string, input: Partial<QuestionInput>, apiKey: string) {
    return request<Question>(`/api/questions/${id}`, { method: "PUT", body: input, apiKey });
  },
  deleteQuestion(id: string, apiKey: string) {
    return request<void>(`/api/questions/${id}`, { method: "DELETE", apiKey });
  },
  listCategories() {
    return request<string[]>(`/api/categories`);
  },
  listTags() {
    return request<string[]>(`/api/tags`);
  },
};
