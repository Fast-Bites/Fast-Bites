export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:8004';
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { authToken?: string | null } = {},
): Promise<ApiResponse<T>> {
  const { authToken, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { error: error.detail || 'Request failed' };
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch {
    return { error: 'Network error' };
  }
}
