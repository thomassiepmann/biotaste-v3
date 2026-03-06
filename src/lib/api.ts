const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || '';

export type HealthResponse = {
  status: string;
  key_set?: boolean;
  projects?: number;
  version?: string;
};

export type BackendAuthStatus = {
  authenticated: boolean;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

export type BackendReview = {
  id: string | number;
  user_id?: string | number;
  rating?: number;
  comment?: string;
  created_at?: string;
};

export type BackendLotteryStatus = {
  status?: string;
  is_open?: boolean;
  current_week?: string;
  entries?: number;
  message?: string;
};

export type EnterLotteryResponse = {
  success?: boolean;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  responseText: string;

  constructor(message: string, status: number, responseText = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseText = responseText;
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL ist nicht gesetzt.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch (error) {
    console.error('[apiFetch] Netzwerkfehler:', error);
    throw new Error('Backend nicht erreichbar. Prüfe URL/Netzwerk.');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[apiFetch] HTTP Fehler', response.status, text);
    throw new ApiError(`Backend-Fehler (${response.status})`, response.status, text);
  }

  return response;
}

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetchJson<HealthResponse>('/api/health');
}

export async function getAuthStatus(): Promise<BackendAuthStatus> {
  return apiFetchJson<BackendAuthStatus>('/api/auth/me');
}

export async function getReviews(): Promise<BackendReview[]> {
  return apiFetchJson<BackendReview[]>('/api/reviews');
}

export async function getLotteryStatus(): Promise<BackendLotteryStatus> {
  return apiFetchJson<BackendLotteryStatus>('/api/lottery/status');
}

export async function enterLottery(): Promise<EnterLotteryResponse> {
  return apiFetchJson<EnterLotteryResponse>('/api/lottery/enter', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
