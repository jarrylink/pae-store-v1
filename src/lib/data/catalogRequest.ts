// Do not retry mutations: a lost response can still mean the write succeeded.
export async function catalogRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status}). Please try again.`);
  if (data === null) throw new Error('The server returned an invalid response. Please refresh and try again.');
  return data as T;
}
