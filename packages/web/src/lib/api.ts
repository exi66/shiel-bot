import type { CatalogItem, SelectedItem } from "@/components/ItemSelect";

export interface NotifySettings {
  notifyCoupons: boolean;
  notifyQueue: boolean;
}

export interface UserSettings {
  link: { token: string; expiredAt: number };
  user: NotifySettings;
  items: SelectedItem[];
}

// Ошибка API с HTTP-статусом (404 — ссылка не найдена или истекла).
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body
      ? { "Content-Type": "application/json", ...init.headers }
      : init?.headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  return res.json();
}

const userUrl = (token: string, ...rest: string[]) =>
  ["/api/user", encodeURIComponent(token), ...rest].join("/");

export const api = {
  catalog: () => request<CatalogItem[]>("/api/items"),

  user: (token: string) => request<UserSettings>(userUrl(token)),

  saveItems: (token: string, items: SelectedItem[]) =>
    request<{ ok: true }>(userUrl(token, "items"), {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  updateSettings: (token: string, patch: Partial<NotifySettings>) =>
    request<{ ok: true; user: NotifySettings }>(userUrl(token, "settings"), {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};
