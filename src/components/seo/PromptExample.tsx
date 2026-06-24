import { ModelGlyph } from "@/shared/ui/era";

interface PromptExampleProps {
  prompt: string;
  modelName: string;
}

export function PromptExample({ prompt, modelName }: PromptExampleProps) {
  return (
    <section style={{ padding: "60px 0" }}>
      <div className="max-w-[900px] mx-auto px-4">
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--seo-card-border)" }}>
          <div style={{ background: "var(--seo-card-bg)", padding: "20px 24px" }}>
            <div className="flex items-center gap-2">
              <ModelGlyph name={modelName} size={24} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--seo-heading)" }}>{modelName}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--seo-text)", marginTop: 8, fontStyle: "italic" }}>{prompt}</p>
          </div>
          <div className="flex items-center justify-center" style={{ height: 400, background: "linear-gradient(180deg, #1a0533, #0d0d12)" }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>Результат генерации</span>
          </div>
        </div>
      </div>
    </section>
  );
}
