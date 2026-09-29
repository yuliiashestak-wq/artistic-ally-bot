import { useEffect, useState } from "react";

export function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 3000);
    const b = setTimeout(() => setGone(true), 3700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-background ${
        leaving ? "animate-splash-out" : ""
      }`}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--glow)_35%,transparent),transparent_60%)]" />
      <div className="relative px-6 text-center">
        <p className="font-display glow-text text-3xl leading-tight font-bold text-foreground sm:text-5xl md:text-6xl">
          Welcome to the World
          <br />
          of Wonders
        </p>
        <p className="mt-6 font-heading text-sm tracking-[0.35em] text-primary uppercase">ToonStory AI</p>
      </div>
    </div>
  );
}
