import { cn } from "@/shared/lib/utils";
import { formatPercent } from "../lib/formatEta";

export interface ProgressBarProps {
  /** 0..100 */
  value: number;
  /** Render the rounded "%" to the right of the track. */
  showValue?: boolean;
  /** Layer a moving sheen over the fill (running tasks). Off for reduced motion. */
  animated?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Accent progress bar. Width animates smoothly (disabled under
 * `prefers-reduced-motion`); the running sheen is purely decorative and also
 * respects reduced motion.
 */
export function ProgressBar({
  value,
  showValue = false,
  animated = false,
  className,
  "aria-label": ariaLabel = "Прогресс генерации",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={cn(
            "h-full rounded-full",
            "bg-[linear-gradient(90deg,#E85420_0%,#ff7a3d_100%)]",
            "transition-[width] duration-500 ease-out motion-reduce:transition-none",
          )}
          style={{ width: `${clamped}%` }}
        >
          {animated && (
            <span
              aria-hidden
              className={cn(
                "block h-full w-full",
                "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]",
                "bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]",
                "motion-reduce:animate-none motion-reduce:bg-none",
              )}
            />
          )}
        </div>
      </div>
      {showValue && (
        <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-foreground/80">
          {formatPercent(clamped)}
        </span>
      )}
    </div>
  );
}
