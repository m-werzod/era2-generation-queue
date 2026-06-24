import { Ban, Check, CircleAlert, Clock, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  /** Spin the icon (running only), disabled under reduced-motion. */
  spin?: boolean;
}

const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  queued: {
    label: "В очереди",
    icon: Clock,
    className: "bg-secondary text-muted-foreground border-[hsl(var(--border))]",
  },
  running: {
    label: "Идёт",
    icon: Loader2,
    className: "bg-accent text-[#ff7a3d] border-primary/40",
    spin: true,
  },
  done: {
    label: "Готово",
    icon: Check,
    className: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  failed: {
    label: "Ошибка",
    icon: CircleAlert,
    className:
      "bg-destructive/12 text-[hsl(var(--destructive))] border-destructive/30",
  },
  canceled: {
    label: "Отменено",
    icon: Ban,
    className: "bg-muted text-muted-foreground/80 border-[hsl(var(--border))]",
  },
};

export interface StatusBadgeProps {
  status: TaskStatus;
  /** Hide the text label, keep only the icon (compact contexts). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Task status pill — color, icon and label per `TaskStatus`. Distinct from the
 * platform `StatusBadge` (NEW/TOP/BETA), which is a marketing label.
 */
export function TaskStatusBadge({ status, iconOnly = false, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 leading-none",
        "text-[12px] font-medium whitespace-nowrap",
        config.className,
        className,
      )}
      role="status"
      aria-label={`Статус: ${config.label}`}
    >
      <Icon
        className={cn("size-3.5 shrink-0", config.spin && "animate-spin motion-reduce:animate-none")}
        strokeWidth={2}
        aria-hidden
      />
      {!iconOnly && <span>{config.label}</span>}
    </span>
  );
}

export { STATUS_CONFIG };
