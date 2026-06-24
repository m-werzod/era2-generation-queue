import { RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/shared/ui/button";

export interface ErrorStateProps {
  onRetry: () => void;
}

/** Shown when the initial load fails (simulated via `?failInit=1`). */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span
        className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-[hsl(var(--destructive))]"
        aria-hidden
      >
        <WifiOff size={24} strokeWidth={1.8} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">Не удалось загрузить очередь</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Что-то пошло не так при загрузке задач. Проверьте соединение и попробуйте ещё раз.
      </p>
      <Button variant="ghost" size="sm" onClick={onRetry} className="mt-5">
        <RotateCcw />
        Повторить
      </Button>
    </div>
  );
}
