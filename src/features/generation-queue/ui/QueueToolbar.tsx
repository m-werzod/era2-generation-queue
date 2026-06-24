import { useEffect, useState } from "react";
import { ArrowDownUp, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/shared/ui/era";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useQueueActions, useQueueState } from "../model/useQueue";
import type { SortOrder, StatusFilter, TypeFilter } from "../model/types";

const SEARCH_DEBOUNCE_MS = 250;

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "status", label: "По статусу" },
  { value: "progress", label: "По прогрессу" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Все типы" },
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображения" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" },
];

export function QueueToolbar() {
  const { filters } = useQueueState();
  const { setStatusFilter, setTypeFilter, setSort, setSearch } = useQueueActions();

  // Debounced search: `draft` is the input value, pushed to the store after a pause.
  const [draft, setDraft] = useState(filters.search);
  useEffect(() => {
    const id = setTimeout(() => setSearch(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draft, setSearch]);
  // Reflect external resets (e.g. "reset filters") back into the input.
  useEffect(() => {
    setDraft(filters.search);
  }, [filters.search]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label;
  const typeLabel = TYPE_OPTIONS.find((o) => o.value === filters.type)?.label;

  return (
    <div className="space-y-3">
      {/* Status chips — horizontally scrollable on mobile */}
      <div
        className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Фильтр по статусу"
      >
        {STATUS_CHIPS.map((chip) => (
          <Chip
            key={chip.value}
            aria-pressed={filters.status === chip.value}
            active={filters.status === chip.value}
            onClick={() => setStatusFilter(chip.value)}
            className="shrink-0"
          >
            {chip.label}
          </Chip>
        ))}
      </div>

      {/* Search + facets */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Поиск по промпту</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Поиск по промпту или модели…"
            className={cn(
              "h-10 w-full rounded-full border border-[hsl(var(--border))] bg-card pl-10 pr-9 text-sm",
              "text-foreground placeholder:text-muted-foreground",
              "transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40",
            )}
          />
          {draft && (
            <button
              type="button"
              onClick={() => setDraft("")}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          <FacetMenu
            icon={<SlidersHorizontal className="size-4" />}
            label={typeLabel}
            value={filters.type}
            options={TYPE_OPTIONS}
            onSelect={(v) => setTypeFilter(v as TypeFilter)}
            ariaLabel="Фильтр по типу"
          />
          <FacetMenu
            icon={<ArrowDownUp className="size-4" />}
            label={sortLabel}
            value={filters.sort}
            options={SORT_OPTIONS}
            onSelect={(v) => setSort(v as SortOrder)}
            ariaLabel="Сортировка"
          />
        </div>
      </div>
    </div>
  );
}

interface FacetMenuProps {
  icon: React.ReactNode;
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  ariaLabel: string;
}

/** Compact radio dropdown used for both the type facet and the sort order. */
function FacetMenu({ icon, label, value, options, onSelect, ariaLabel }: FacetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label={ariaLabel}>
          {icon}
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
