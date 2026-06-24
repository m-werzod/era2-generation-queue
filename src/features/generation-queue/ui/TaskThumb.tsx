import { AudioLines, ImageIcon, MessageSquare, Play, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { GenType } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

const TYPE_ICON: Record<GenType, LucideIcon> = {
  text: MessageSquare,
  image: ImageIcon,
  video: Video,
  audio: AudioLines,
};

/** Image/video read as "media" (striped placeholder); text/audio as glyph tile. */
const isMedia = (type: GenType): boolean => type === "image" || type === "video";

export interface TaskThumbProps {
  type: GenType;
  size?: number;
  className?: string;
}

/**
 * Compact type preview. Media types (image/video) get a diagonal-stripe
 * placeholder standing in for the eventual asset; text/audio get a tinted glyph
 * tile. Decorative — hidden from assistive tech (the row already names the type).
 */
export function TaskThumb({ type, size = 44, className }: TaskThumbProps) {
  const Icon = TYPE_ICON[type];
  const media = isMedia(type);
  const iconSize = Math.round(size * 0.42);

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border",
        media
          ? cn(
              "border-[hsl(var(--border))] text-[#ffb27a]",
              type === "image" ? "era-ph-rust" : "era-ph-ember",
            )
          : "border-primary/18 bg-primary/10 text-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
      {type === "video" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Play size={Math.round(size * 0.3)} className="fill-white/85 text-white/85" strokeWidth={0} />
        </span>
      )}
    </span>
  );
}
