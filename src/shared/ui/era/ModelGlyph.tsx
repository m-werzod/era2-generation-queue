import {
  Bot, MessageCircle, Image as ImageIcon, Video, Mic, Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "@lobehub/icons";

/*
 * Import each brand glyph straight from its `components/Mono|Color` module
 * instead of the package barrel — the barrel's combined export also wires up
 * `Combine`, which pulls in `@lobehub/ui` + `antd` we don't otherwise need.
 */
import OpenAIMono from "@lobehub/icons/es/OpenAI/components/Mono";
import ClaudeMono from "@lobehub/icons/es/Claude/components/Mono";
import GeminiColor from "@lobehub/icons/es/Gemini/components/Color";
import GoogleColor from "@lobehub/icons/es/Google/components/Color";
import MidjourneyMono from "@lobehub/icons/es/Midjourney/components/Mono";
import NanoBananaInner from "@lobehub/icons/es/NanoBanana/components/Inner";
import SoraInner from "@lobehub/icons/es/Sora/components/Inner";
import KlingColor from "@lobehub/icons/es/Kling/components/Color";
import SunoMono from "@lobehub/icons/es/Suno/components/Mono";
import ElevenLabsMono from "@lobehub/icons/es/ElevenLabs/components/Mono";
import DeepSeekMono from "@lobehub/icons/es/DeepSeek/components/Mono";
import GrokMono from "@lobehub/icons/es/Grok/components/Mono";
import PerplexityMono from "@lobehub/icons/es/Perplexity/components/Mono";
import QwenMono from "@lobehub/icons/es/Qwen/components/Mono";
import AlibabaMono from "@lobehub/icons/es/Alibaba/components/Mono";
import FluxMono from "@lobehub/icons/es/Flux/components/Mono";
import ByteDanceMono from "@lobehub/icons/es/ByteDance/components/Mono";
import RunwayMono from "@lobehub/icons/es/Runway/components/Mono";
import HailuoColor from "@lobehub/icons/es/Hailuo/components/Color";
import ViduMono from "@lobehub/icons/es/Vidu/components/Mono";
import HedraMono from "@lobehub/icons/es/Hedra/components/Mono";

/** Real brand logo + the tile background/foreground it's meant to sit on. */
interface BrandEntry {
  Icon: IconType;
  /** true when the icon is already fully multi-color (no `color` override needed) */
  isColor: boolean;
  bg: string;
  fg?: string;
}

/* Map model / provider name prefix → official brand icon */
/*
 * (Icon, bg, fg) below mirrors each brand's own `Avatar` recipe in
 * @lobehub/icons exactly (same Mono/Color/Inner pick + same background).
 * Deviating from it is what caused invisible icons before: e.g. Claude's
 * `Color` glyph is filled with `#D97757` — identical to its own brand
 * background — so it's only ever legible via `Mono` + a white overlay.
 */
const BRAND_BY_KEY: Record<string, BrandEntry> = {
  "chatgpt": { Icon: OpenAIMono, isColor: false, bg: "#000", fg: "#fff" },
  "gpt image": { Icon: OpenAIMono, isColor: false, bg: "#000", fg: "#fff" },
  "claude": { Icon: ClaudeMono, isColor: false, bg: "#D97757", fg: "#fff" },
  "gemini": { Icon: GeminiColor, isColor: true, bg: "#fff" },
  "imagen": { Icon: GoogleColor, isColor: true, bg: "#fff" },
  "veo": { Icon: GoogleColor, isColor: true, bg: "#fff" },
  "grok": { Icon: GrokMono, isColor: false, bg: "#000", fg: "#fff" },
  "deepseek": { Icon: DeepSeekMono, isColor: false, bg: "#4D6BFE", fg: "#fff" },
  "perplexity": { Icon: PerplexityMono, isColor: false, bg: "#22B8CD", fg: "#000" },
  "qwen": { Icon: QwenMono, isColor: false, bg: "#615ced", fg: "#fff" },
  "nano banana": { Icon: NanoBananaInner, isColor: true, bg: "#FCD53F" },
  "midjourney": { Icon: MidjourneyMono, isColor: false, bg: "#fff", fg: "#000" },
  "seedream": { Icon: ByteDanceMono, isColor: false, bg: "#325AB4", fg: "#fff" },
  "seedance": { Icon: ByteDanceMono, isColor: false, bg: "#325AB4", fg: "#fff" },
  "kling": { Icon: KlingColor, isColor: true, bg: "#000" },
  "sora": { Icon: SoraInner, isColor: true, bg: "linear-gradient(180deg, #012659 0%, #0968DA 100%)" },
  "wan": { Icon: AlibabaMono, isColor: false, bg: "#FF6003", fg: "#fff" },
  "elevenlabs": { Icon: ElevenLabsMono, isColor: false, bg: "#fff", fg: "#000" },
  "suno": { Icon: SunoMono, isColor: false, bg: "#000", fg: "#fff" },
  "flux": { Icon: FluxMono, isColor: false, bg: "#fff", fg: "#000" },
  "runway": { Icon: RunwayMono, isColor: false, bg: "#fff", fg: "#000" },
  "hailuo": { Icon: HailuoColor, isColor: true, bg: "#fff" },
  "vidu": { Icon: ViduMono, isColor: false, bg: "linear-gradient(to right, #40EDD8, #22D5FF, #047FFE)", fg: "#fff" },
  "hedra": { Icon: HedraMono, isColor: false, bg: "#000", fg: "#fff" },
};

/* Models without an official brand icon in @lobehub/icons — keep a flat lucide fallback */
const FALLBACK_ICON_BY_KEY: Record<string, LucideIcon> = {
  "higgsfield": Flame,
  "heygen": Bot,
  // categories
  "text": MessageCircle,
  "image": ImageIcon,
  "video": Video,
  "audio": Mic,
};

function findByKey<T>(name: string, map: Record<string, T>): T | undefined {
  const key = name.toLowerCase().trim();
  if (map[key]) return map[key];
  for (const [k, v] of Object.entries(map)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return undefined;
}

export function getBrandEntry(name: string): BrandEntry | undefined {
  return findByKey(name, BRAND_BY_KEY);
}

export function getModelIcon(name: string): LucideIcon {
  return findByKey(name, FALLBACK_ICON_BY_KEY) ?? Bot;
}

interface ModelGlyphProps {
  name: string;
  size?: number;
  className?: string;
}

/** Circular tile with the model's real, officially-colored brand logo — replaces emoji avatars. */
export function ModelGlyph({ name, size = 40, className = "" }: ModelGlyphProps) {
  const brand = getBrandEntry(name);

  if (brand) {
    const { Icon, isColor, bg, fg } = brand;
    const iconSize = Math.round(size * 0.58);
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden ${className}`}
        style={{
          width: size,
          height: size,
          background: bg,
          boxShadow: "0 1px 2px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        <Icon size={iconSize} {...(isColor ? {} : { color: fg })} />
      </span>
    );
  }

  const Icon = getModelIcon(name);
  const iconSize = Math.round(size * 0.5);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[8px] shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: "rgba(232, 84, 32, 0.1)",
        color: "hsl(var(--primary))",
        border: "1px solid rgba(232, 84, 32, 0.18)",
      }}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
    </span>
  );
}

/** Inline mono credit chip: "75 cr" — replaces "⚡ 75". */
export function CreditTag({ value, className = "" }: { value: number | string; className?: string }) {
  return (
    <span
      className={`font-mono tabular-nums text-[11px] inline-flex items-center gap-1 ${className}`}
      style={{ color: "hsl(var(--primary))", letterSpacing: "-0.01em" }}
    >
      {value}<span style={{ opacity: 0.55 }}>cr</span>
    </span>
  );
}
