import { getToken } from "@/lib/client-auth";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: T }> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => null)) as T;
  return { status: res.status, body };
}
