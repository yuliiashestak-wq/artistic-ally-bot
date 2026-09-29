import { useEffect, useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";

const SCENE_EMOJI = ["🦊", "🌙", "🗺️", "🏰", "⭐"];

export function PreviewPlayer({ story, onEnded }: { story: string; onEnded: () => void }) {
  const [phase, setPhase] = useState<"rendering" | "playing" | "done">("rendering");
  const [progress, setProgress] = useState(0);

  const lines = useMemo(
    () =>
      story
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s/)
        .filter(Boolean)
        .slice(0, 5),
    [story],
  );

  useEffect(() => {
    const t = setTimeout(() => setPhase("playing"), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const start = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 10000) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setPhase("done");
        onEnded();
      }
    }, 100);
    return () => clearInterval(timer);
  }, [phase, onEnded]);

  const activeIndex = Math.min(lines.length - 1, Math.floor((progress / 100) * Math.max(1, lines.length)));

  return (
    <div className="magic-card overflow-hidden">
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,color-mix(in_oklab,var(--glow)_45%,transparent),transparent_65%)]" />

        {phase === "rendering" ? (
          <div className="relative text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="mt-3 font-heading text-sm text-foreground">Painting your 10-second cartoon...</p>
          </div>
        ) : (
          <div key={activeIndex} className="animate-sparkle-pop relative max-w-2xl px-6 text-center">
            <div className="text-6xl">{SCENE_EMOJI[activeIndex % SCENE_EMOJI.length]}</div>
            <p className="mt-4 font-display text-lg leading-relaxed text-foreground sm:text-xl">
              {lines[activeIndex] ?? story}
            </p>
          </div>
        )}

        <span className="absolute top-3 right-3 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] tracking-wide text-muted-foreground">
          FREE PREVIEW · LOW QUALITY
        </span>
      </div>

      <div className="flex items-center gap-3 border-t border-border/60 px-4 py-3">
        <Play className="size-4 text-primary" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet-ink">
          <div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-heading text-xs text-muted-foreground">
          0:{String(Math.floor(progress / 10)).padStart(2, "0")} / 0:10
        </span>
      </div>
    </div>
  );
}
