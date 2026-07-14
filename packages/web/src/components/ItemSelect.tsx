import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, declOfNum } from "@/lib/utils";

const ICON_BASE = "https://cdn.bdolytics.com/img/";
const ROW_HEIGHT = 40;

// Сырой формат каталога (public/all.json старого проекта).
export interface CatalogItem {
  id: number;
  enhancement_level: number;
  name: string;
  icon: string;
  grade: number;
}

export interface SelectedItem {
  id: number;
  lvl: number;
}

interface Option extends SelectedItem {
  key: string;
  name: string;
  icon: string;
  grade: number;
  label: string;
  search: string;
}

function gradeText(grade: number): string {
  if (grade === 5) return "text-purple-500";
  if (grade === 4) return "text-orange-500";
  if (grade === 3) return "text-yellow-500";
  return "";
}

function keyOf(item: SelectedItem): string {
  return `${item.id}-${item.lvl}`;
}

export function ItemSelect({
  catalog,
  value,
  onChange,
  disabled,
}: {
  catalog: CatalogItem[];
  value: SelectedItem[];
  onChange: (next: SelectedItem[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo<Option[]>(
    () =>
      catalog.map((e) => {
        const label = `${e.enhancement_level}: ${e.name}`;
        return {
          key: `${e.id}-${e.enhancement_level}`,
          id: e.id,
          lvl: e.enhancement_level,
          name: e.name,
          icon: e.icon,
          grade: e.grade,
          label,
          search: label.toLowerCase(),
        };
      }),
    [catalog],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.search.includes(q));
  }, [options, query]);

  const byKey = useMemo(
    () => new Map(options.map((o) => [o.key, o])),
    [options],
  );
  const selectedKeys = useMemo(() => new Set(value.map(keyOf)), [value]);

  function toggle(opt: Option) {
    if (selectedKeys.has(opt.key)) {
      onChange(value.filter((v) => keyOf(v) !== opt.key));
    } else {
      onChange([...value, { id: opt.id, lvl: opt.lvl }]);
    }
  }

  function remove(item: SelectedItem) {
    onChange(value.filter((v) => keyOf(v) !== keyOf(item)));
  }

  const count = value.length;

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            {count > 0
              ? `${count} ${declOfNum(count, ["предмет", "предмета", "предметов"])}`
              : "Выберите предметы…"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск…"
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Нет совпадений
            </div>
          ) : (
            // Монтируется заново при каждом открытии — виртуализатор всегда видит свой scroll-элемент.
            <VirtualItemList
              options={filtered}
              selectedKeys={selectedKeys}
              onToggle={toggle}
            />
          )}
        </PopoverContent>
      </Popover>

      {/* Выбранные предметы */}
      {count > 0 && (
        <div className="max-h-[18.35rem] overflow-y-auto rounded-md border divide-y">
          {value.map((v) => {
            const opt = byKey.get(keyOf(v));
            return (
              <div
                key={keyOf(v)}
                className="flex items-center gap-2 p-2 odd:bg-muted/30"
              >
                <ItemIcon icon={opt?.icon} grade={opt?.grade ?? 0} />
                <span
                  className={cn("text-sm truncate", gradeText(opt?.grade ?? 0))}
                >
                  {opt ? opt.label : `${v.lvl}: ${v.id}`}
                </span>
                <Button
                  size="icon"
                  variant="destructive"
                  className="ml-auto shrink-0 size-8"
                  disabled={disabled}
                  onClick={() => remove(v)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VirtualItemList({
  options,
  selectedKeys,
  onToggle,
}: {
  options: Option[];
  selectedKeys: Set<string>;
  onToggle: (opt: Option) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Высота под содержимое, но не выше 288px — дальше скроллим.
  const listHeight = Math.min(options.length * ROW_HEIGHT, 288);

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto p-1"
      style={{ height: listHeight }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((row) => {
          const opt = options[row.index];
          return (
            <button
              type="button"
              key={opt.key}
              onClick={() => onToggle(opt)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: row.size,
                transform: `translateY(${row.start}px)`,
              }}
              className="flex items-center gap-2 rounded-sm ps-1 pe-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ItemIcon icon={opt.icon} grade={opt.grade} />
              <span className={cn("truncate", gradeText(opt.grade))}>
                {opt.label}
              </span>
              <Check
                className={cn(
                  "ml-auto h-4 w-4 shrink-0",
                  selectedKeys.has(opt.key) ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ItemIcon({ icon, grade }: { icon?: string; grade: number }) {
  if (!icon) {
    return <div className="h-8 w-8 shrink-0 rounded-sm border bg-muted" />;
  }
  return (
    <img
      src={ICON_BASE + icon}
      alt=""
      loading="lazy"
      className={cn(
        "h-8 w-8 shrink-0 rounded-sm border object-contain",
        grade === 5 && "border-purple-500/60",
        grade === 4 && "border-orange-500/60",
        grade === 3 && "border-yellow-500/60",
      )}
    />
  );
}
