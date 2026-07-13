import type {
  Alokasi,
  AllocationConfirmRequest,
  AllocationSuggestion,
  AuthResponse,
  DashboardSummary,
  Dompet,
  DompetCreateRequest,
  Goal,
  GoalCreateRequest,
  GoalRankingItem,
  InsightResponse,
  Kategori,
  ReceiptExtraction,
  StatementExtractionResponse,
  Transaksi,
  TransaksiCreateRequest,
  User,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response has no JSON body, keep statusText
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function uploadFile<T>(path: string, file: File, token: string): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response has no JSON body, keep statusText
    }
    throw new ApiError(detail, res.status);
  }

  return (await res.json()) as T;
}

export const api = {
  register: (payload: { nama: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: (token: string) => request<{ status: string }>("/api/auth/logout", { method: "POST" }, token),
  me: (token: string) => request<User>("/api/auth/me", {}, token),
  categories: (token: string) => request<Kategori[]>("/api/categories", {}, token),
  transactions: {
    list: (token: string) => request<Transaksi[]>("/api/transactions", {}, token),
    create: (token: string, payload: TransaksiCreateRequest) =>
      request<Transaksi>("/api/transactions", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (token: string, id: string, payload: Partial<TransaksiCreateRequest>) =>
      request<Transaksi>(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),
    remove: (token: string, id: string) =>
      request<void>(`/api/transactions/${id}`, { method: "DELETE" }, token),
  },
  dashboard: {
    summary: (token: string) => request<DashboardSummary>("/api/dashboard/summary", {}, token),
  },
  goals: {
    list: (token: string) => request<Goal[]>("/api/goals", {}, token),
    ranking: (token: string) => request<GoalRankingItem[]>("/api/goals/ranking", {}, token),
    create: (token: string, payload: GoalCreateRequest) =>
      request<Goal>("/api/goals", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (token: string, id: string, payload: Partial<GoalCreateRequest>) =>
      request<Goal>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),
    remove: (token: string, id: string) => request<void>(`/api/goals/${id}`, { method: "DELETE" }, token),
  },
  allocations: {
    suggest: (token: string, payload: { transaksi_id: string }) =>
      request<AllocationSuggestion>("/api/allocations/suggest", { method: "POST", body: JSON.stringify(payload) }, token),
    confirm: (token: string, payload: AllocationConfirmRequest) =>
      request<Alokasi>("/api/allocations/confirm", { method: "POST", body: JSON.stringify(payload) }, token),
  },
  insights: {
    generate: (token: string) => request<InsightResponse>("/api/insights/generate", { method: "POST" }, token),
  },
  receipts: {
    scan: (token: string, file: File) => uploadFile<ReceiptExtraction>("/api/receipts/scan", file, token),
  },
  statements: {
    extract: (token: string, file: File) =>
      uploadFile<StatementExtractionResponse>("/api/statements/extract", file, token),
  },
  wallets: {
    list: (token: string) => request<Dompet[]>("/api/wallets", {}, token),
    create: (token: string, payload: DompetCreateRequest) =>
      request<Dompet>("/api/wallets", { method: "POST", body: JSON.stringify(payload) }, token),
    update: (token: string, id: string, payload: Partial<DompetCreateRequest>) =>
      request<Dompet>(`/api/wallets/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),
    remove: (token: string, id: string) => request<void>(`/api/wallets/${id}`, { method: "DELETE" }, token),
  },
};
