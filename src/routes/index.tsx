import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import { SplashScreen } from "@/components/SplashScreen";
import { AppHeader } from "@/components/AppHeader";
import { SideDrawer } from "@/components/SideDrawer";
import { AuthModal } from "@/components/AuthModal";
import { StoryWriter } from "@/components/StoryWriter";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { ConversionModal } from "@/components/ConversionModal";
import { PricingPlans } from "@/components/PricingPlans";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "ToonStory AI — Turn Your Story Into a Cartoon" },
      {
        name: "description",
        content:
          "Write a story, get magical AI suggestions, and watch your first 10 seconds of cartoon come to life for free.",
      },
      { property: "og:title", content: "ToonStory AI — Turn Your Story Into a Cartoon" },
      {
        property: "og:description",
        content: "Family-friendly AI cartoons. Write a story and watch your free 10-second teaser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Page() {
  return (
    <AppStateProvider>
      <Studio />
      <Toaster position="top-center" />
    </AppStateProvider>
  );
}

function Studio() {
  const { draft, setDraft, addProject } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [generated, setGenerated] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  function openAuth(mode: "signin" | "register") {
    setAuthMode(mode);
    setMenuOpen(false);
    setAuthOpen(true);
  }

  const handleEnded = useCallback(() => setConvertOpen(true), []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SplashScreen />

      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1088}
          className="animate-float-slow size-full object-cover opacity-25 blur-[3px]"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--glow)_28%,transparent),transparent_55%)]" />
      </div>

      <AppHeader onOpenMenu={() => setMenuOpen(true)} onAuth={openAuth} />

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6">
        <section className="text-center">
          <span className="inline-block rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 font-heading text-xs tracking-widest text-primary uppercase">
            Free teaser mode
          </span>
          <h1 className="glow-text mt-5 font-display text-3xl leading-tight font-bold text-foreground sm:text-5xl">
            Try Your First 10 Seconds
            <br />
            of Cartoon for Free!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Write a few magical lines. Our story wizard helps you finish it, then brings it to life as an animated
            teaser.
          </p>
        </section>

        <section className="mt-10">
          <StoryWriter onGenerate={() => setGenerated(draft)} />
        </section>

        {generated && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl font-bold text-foreground">Your teaser</h2>
            <PreviewPlayer key={generated} story={generated} onEnded={handleEnded} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Preview only — downloading is disabled in free mode.
            </p>
          </section>
        )}

        <section ref={pricingRef} className="mt-16 scroll-mt-24">
          <h2 className="text-center font-display text-2xl font-bold text-foreground">Pricing &amp; Tokens</h2>
          <p className="mt-2 mb-6 text-center text-sm text-muted-foreground">
            Longer cartoons, higher quality, and saved projects.
          </p>
          <PricingPlans />
        </section>
      </main>

      <SideDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onAuth={openAuth}
        onPricing={() => {
          setMenuOpen(false);
          pricingRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <AuthModal open={authOpen} mode={authMode} onOpenChange={setAuthOpen} onModeChange={setAuthMode} />
      <ConversionModal
        open={convertOpen}
        onOpenChange={setConvertOpen}
        onContinue={() => {
          setConvertOpen(false);
          addProject(draft.split(/\s+/).slice(0, 5).join(" ") || "My cartoon");
        }}
        onStartNew={() => {
          setConvertOpen(false);
          setGenerated(null);
          setDraft("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
