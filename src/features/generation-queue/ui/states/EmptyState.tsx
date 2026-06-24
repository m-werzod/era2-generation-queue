import { Inbox, Plus, SearchX } from "lucide-react";
import { Button } from "@/shared/ui/button";

export interface EmptyStateProps {
  /** "filtered" = filters hid everything; "empty" = the queue is truly empty. */
  variant: "empty" | "filtered";
  onReset?: () => void;
  onCreate?: () => void;
}

export function EmptyState({ variant, onReset, onCreate }: EmptyStateProps) {
  const filtered = variant === "filtered";
  const Icon = filtered ? SearchX : Inbox;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span
        className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary"
        aria-hidden
      >
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">
        {filtered ? "Ничего не найдено" : "Очередь пуста"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {filtered
          ? "Под выбранные фильтры нет задач. Попробуйте изменить условия поиска."
          : "Здесь появятся ваши генерации. Запустите первую — и следите за прогрессом в реальном времени."}
      </p>
      <div className="mt-5">
        {filtered ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Сбросить фильтры
          </Button>
        ) : (
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus />
              Новая генерация
            </Button>
          )
        )}
      </div>
    </div>
  );
}
