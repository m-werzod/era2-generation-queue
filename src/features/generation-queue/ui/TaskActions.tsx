import { Copy, Download, MoreHorizontal, RotateCcw, Trash2, X } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

/** Callbacks wired by the list — keeps rows/cards fully presentational. */
export interface TaskHandlers {
  onCancel(id: string): void;
  onRetry(id: string): void;
  onDownload(task: GenerationTask): void;
  onRemove(id: string): void;
  onCopyPrompt(task: GenerationTask): void;
}

export interface TaskActionsProps {
  task: GenerationTask;
  handlers: TaskHandlers;
  /** Stretch the primary action to fill its container (mobile cards). */
  stretch?: boolean;
  className?: string;
}

const PRIMARY_BTN = "gap-1.5";

export function TaskActions({ task, handlers, stretch = false, className }: TaskActionsProps) {
  const { status } = task;
  const canCancel = status === "queued" || status === "running";
  const canRetry = status === "failed" || status === "canceled";
  const canDownload = status === "done";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {canCancel && (
        <Button
          variant="quiet"
          size="sm"
          onClick={() => handlers.onCancel(task.id)}
          className={cn(PRIMARY_BTN, "hover:text-[hsl(var(--destructive))]", stretch && "flex-1")}
          aria-label="Отменить генерацию"
        >
          <X />
          Отмена
        </Button>
      )}

      {canRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onRetry(task.id)}
          className={cn(PRIMARY_BTN, stretch && "flex-1")}
          aria-label="Повторить генерацию"
        >
          <RotateCcw />
          Повторить
        </Button>
      )}

      {canDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlers.onDownload(task)}
          className={cn(PRIMARY_BTN, stretch && "flex-1")}
          aria-label="Скачать результат"
        >
          <Download />
          Скачать
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="quiet"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            aria-label="Ещё действия"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => handlers.onCopyPrompt(task)}>
            <Copy />
            Копировать промпт
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handlers.onRemove(task.id)}
            className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
          >
            <Trash2 />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
