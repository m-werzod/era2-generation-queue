import { getBrandEntry } from "@/shared/ui/era/ModelGlyph";

interface Props {
  providerId: string;
  size?: number;
  className?: string;
}

/** Provider id (chatgpt, claude, gemini, ...) → display name recognized by the brand-icon map. */
const NAME_BY_PROVIDER_ID: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  grok: "Grok",
  perplexity: "Perplexity",
  qwen: "Qwen",
};

export function ModelIcon({ providerId, size = 24, className = "" }: Props) {
  const brand = getBrandEntry(NAME_BY_PROVIDER_ID[providerId] || "ChatGPT");
  const iconSize = Math.round(size * 0.58);

  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: brand?.bg,
        boxShadow: "0 1px 2px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {brand && (
        <brand.Icon size={iconSize} {...(brand.isColor ? {} : { color: brand.fg })} />
      )}
    </div>
  );
}
