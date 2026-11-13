import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ItemSelect,
  keyOf,
  type CatalogItem,
  type SelectedItem,
} from "@/components/ItemSelect";
import {
  api,
  ApiError,
  type NotifySettings,
  type UserSettings,
} from "@/lib/api";

// Ссылка не найдена или истекла — уводим на главную (replace, без записи в историю).
function leaveIfExpired(e: unknown): boolean {
  if (e instanceof ApiError && e.status === 404) {
    window.location.replace("/");
    return true;
  }
  return false;
}

export default function SettingsPage({ token }: { token: string }) {
  const [data, setData] = useState<UserSettings | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [busy, setBusy] = useState(false); // мутация в полёте — форма дизейблится
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .user(token)
      .then((json) => {
        setData(json);
        setItems(json.items);
      })
      .catch((e) => {
        if (!leaveIfExpired(e)) setError("Не удалось загрузить настройки.");
      });
  }, [token]);

  // Каталог предметов грузим один раз.
  useEffect(() => {
    api
      .catalog()
      .then(setCatalog)
      .catch(() => setError("Не удалось загрузить каталог предметов."));
  }, []);

  // Явно задаём значение (а не «переключаем»), поэтому повторный запрос безопасен.
  // Обновляем только флаги — несохранённый список предметов не трогаем.
  async function setNotify(key: keyof NotifySettings, value: boolean) {
    if (!data || busy) return;
    const prev = data.user;
    setData({ ...data, user: { ...prev, [key]: value } }); // оптимистично
    setBusy(true);
    setError(null);
    try {
      const res = await api.updateSettings(token, { [key]: value });
      setData((d) => (d ? { ...d, user: res.user } : d));
    } catch (e) {
      if (leaveIfExpired(e)) return;
      setData((d) => (d ? { ...d, user: prev } : d)); // откат
      setError("Не удалось сохранить настройку.");
    } finally {
      setBusy(false);
    }
  }

  async function saveItems() {
    setBusy(true);
    setError(null);
    try {
      await api.saveItems(token, items);
      setData((d) => (d ? { ...d, items } : d));
    } catch (e) {
      if (!leaveIfExpired(e)) setError("Не удалось сохранить предметы.");
    } finally {
      setBusy(false);
    }
  }

  // Есть ли несохранённые изменения в списке предметов (без учёта порядка).
  const itemsDirty = useMemo(() => {
    const saved = new Set((data?.items ?? []).map(keyOf));
    const local = new Set(items.map(keyOf));
    if (saved.size !== local.size) return true;
    for (const k of local) if (!saved.has(k)) return true;
    return false;
  }, [items, data]);

  // Первичная загрузка (и момент перед редиректом при ошибке) — скелетоны.
  if (!data) {
    return error ? <ErrorScreen message={error} /> : <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-lg font-semibold">Настройки уведомлений</h1>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {/* Тумблеры подписок */}
        <section className="space-y-2">
          <ToggleRow
            label="Уведомления о купонах"
            active={data.user.notifyCoupons}
            disabled={busy}
            onChange={(v) => setNotify("notifyCoupons", v)}
          />
          <ToggleRow
            label="Уведомления об очереди"
            active={data.user.notifyQueue}
            disabled={busy}
            onChange={(v) => setNotify("notifyQueue", v)}
          />
        </section>

        {/* Отслеживаемые предметы */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Отслеживаемые предметы</h2>

          <ItemSelect
            catalog={catalog}
            value={items}
            onChange={setItems}
            disabled={busy}
          />

          <div className="flex justify-end">
            <Button onClick={saveItems} disabled={busy || !itemsDirty}>
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
  onChange,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer">
      <span className="font-medium text-sm">{label}</span>
      <Switch checked={active} disabled={disabled} onCheckedChange={onChange} />
    </label>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    </div>
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
          <h2 className="text-lg font-semibold">Отслеживаемые предметы</h2>
          <div className="space-y-2">
            <Skeleton className="h-9 flex-1" />
            <div className="max-h-[18.35rem] overflow-y-auto rounded-md border divide-y">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 odd:bg-muted/30 h-12"
                />
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
