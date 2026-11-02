const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit & { token?: string | null };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  return res;
}
