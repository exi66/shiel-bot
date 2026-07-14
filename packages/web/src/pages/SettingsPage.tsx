import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSelect, type CatalogItem } from "@/components/ItemSelect";

interface Item {
  id: number;
  lvl: number;
}

interface UserSettings {
  link: { token: string; expiredAt: number };
  user: { notifyCoupons: boolean; notifyQueue: boolean };
  items: Item[];
}

export default function SettingsPage({ token }: { token: string }) {
  const [data, setData] = useState<UserSettings | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [busy, setBusy] = useState(false); // мутация в полёте — форма дизейблится
  const [saving, setSaving] = useState(false);

  // Тихий рефетч: не трогает «первичный» рендер, только обновляет данные.
  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/user/${token}`);
    if (!res.ok) {
      // Ссылка не найдена или истекла — уводим на главную (replace, без записи в историю).
      window.location.replace("/");
      return;
    }
    const json: UserSettings = await res.json();
    setData(json);
    setItems(json.items);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Каталог предметов грузим один раз.
  useEffect(() => {
    fetch("/api/items")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  async function toggle(kind: "coupons" | "queue") {
    if (busy) return;
    const key = kind === "coupons" ? "notifyCoupons" : "notifyQueue";
    // Оптимистично переключаем сразу, чтобы свитч не «догонял» ответ сервера.
    setData((prev) =>
      prev ? { ...prev, user: { ...prev.user, [key]: !prev.user[key] } } : prev,
    );
    setBusy(true);
    try {
      await fetch(`/api/user/${token}/toggle-${kind}`, { method: "POST" });
      await fetchData();
    } finally {
      setBusy(false);
    }
  }

  async function saveItems() {
    setBusy(true);
    setSaving(true);
    try {
      await fetch(`/api/user/${token}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      await fetchData();
    } finally {
      setBusy(false);
      setSaving(false);
    }
  }

  // Есть ли несохранённые изменения в списке предметов (без учёта порядка).
  const itemsDirty = useMemo(() => {
    const dbKeys = new Set((data?.items ?? []).map((i) => `${i.id}-${i.lvl}`));
    const localKeys = new Set(items.map((i) => `${i.id}-${i.lvl}`));
    if (dbKeys.size !== localKeys.size) return true;
    for (const k of localKeys) if (!dbKeys.has(k)) return true;
    return false;
  }, [items, data]);

  // Первичная загрузка (и момент перед редиректом при ошибке) — скелетоны.
  if (!data) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-lg font-semibold">Настройки уведомлений</h1>

        {/* Тумблеры подписок */}
        <section className="space-y-2">
          <ToggleRow
            label="Уведомления о купонах"
            active={data.user.notifyCoupons}
            onToggle={() => toggle("coupons")}
          />
          <ToggleRow
            label="Уведомления об очереди"
            active={data.user.notifyQueue}
            onToggle={() => toggle("queue")}
          />
        </section>

        {/* Отслеживаемые предметы */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Отслеживаемые предметы</h2>

          <ItemSelect catalog={catalog} value={items} onChange={setItems} />

          <div className="flex justify-end">
            <Button onClick={saveItems} disabled={saving || !itemsDirty}>
              Сохранить
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  active,
  disabled,
  onToggle,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer">
      <span className="font-medium text-sm">{label}</span>
      <Switch checked={active} disabled={disabled} onCheckedChange={onToggle} />
    </label>
  );
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-lg font-semibold">Настройки уведомлений</h1>

        <section className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Отслеживаемые предметы</h2>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 flex-1" />
            <div className="max-h-[18.35rem] overflow-y-auto rounded-md border divide-y">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 odd:bg-muted/30 h-12"
                ></div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
        </section>
      </div>
    </div>
  );
}
