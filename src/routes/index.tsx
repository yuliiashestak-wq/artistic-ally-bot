import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MediaLibrary } from "@/components/MediaLibrary";
import { StoreModal } from "@/components/StoreModal";
import { ProfilePage } from "@/components/ProfilePage";
import { Footer } from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import neonForest from "@/assets/poster-neon-forest.jpg";
import skyPirates from "@/assets/poster-sky-pirates.jpg";

export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Tonera — Watch and Create Animated Stories" },
      { name: "description", content: "Discover original anime and toons, then turn your own story into an animated series with Tonera." },
      { property: "og:title", content: "Tonera — Watch and Create Animated Stories" },
      { property: "og:description", content: "A colorful home for original anime, toons, and creator-made animated stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Page() {
  return <AppStateProvider><Studio /><Toaster position="top-center" /></AppStateProvider>;
}

function Studio() {
  const { draft, setDraft, addProject, view, setView } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [generated, setGenerated] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  function openAuth(mode: "signin" | "register") { setAuthMode(mode); setMenuOpen(false); setAuthOpen(true); }
  const handleEnded = useCallback(() => setConvertOpen(true), []);

  if (view === "profile") {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <SplashScreen />
        <div className="pointer-events-none fixed inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1088} className="animate-float-slow size-full object-cover opacity-10 blur-[3px]" />
          <div className="absolute inset-0 bg-background/90" />
        </div>
        <AppHeader onOpenMenu={() => setMenuOpen(true)} onAuth={openAuth} onOpenStore={() => setStoreOpen(true)} />
        <main>
          <ProfilePage />
        </main>
        <Footer />
        <SideDrawer
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onAuth={openAuth}
          onPricing={() => { setMenuOpen(false); setView("home"); setTimeout(() => pricingRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
          onOpenStore={() => setStoreOpen(true)}
          onOpenProfile={() => {}}
        />
        <AuthModal open={authOpen} mode={authMode} onOpenChange={setAuthOpen} onModeChange={setAuthMode} />
        <StoreModal open={storeOpen} onOpenChange={setStoreOpen} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SplashScreen />
      {/* Background with neon-violet gradient overlay + character artwork */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img src={heroBg} alt="" width={1920} height={1088} className="animate-float-slow size-full object-cover opacity-10 blur-[3px]" />
        {/* Left side: glowing neon anime character blend */}
        <img src={neonForest} alt="" width={768} height={1152} className="absolute left-0 top-0 h-full w-1/3 object-cover opacity-[0.15] mix-blend-screen" style={{ maskImage: "radial-gradient(ellipse 80% 70% at 20% 40%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 20% 40%, black 30%, transparent 75%)" }} />
        {/* Right side: nostalgic adventure toon character blend */}
        <img src={skyPirates} alt="" width={768} height={1152} className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-[0.15] mix-blend-screen" style={{ maskImage: "radial-gradient(ellipse 80% 70% at 80% 40%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 80% 40%, black 30%, transparent 75%)" }} />
        {/* Center radial fade to keep text readable */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,var(--background)_0%,color-mix(in_oklab,var(--background)_80%,transparent)_50%,color-mix(in_oklab,var(--violet-deep)_40%,transparent)_100%)]" />
        {/* Neon-violet gradient overlay at top */}
        <div className="absolute inset-x-0 top-0 h-[60vh] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--glow)_20%,transparent)_0%,color-mix(in_oklab,var(--violet-deep)_15%,transparent)_40%,transparent_100%)]" />
      </div>
      <AppHeader onOpenMenu={() => setMenuOpen(true)} onAuth={openAuth} onOpenStore={() => setStoreOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 pt-9 pb-24 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 border-b border-border pb-9">
          <p className="font-heading text-xs font-extrabold tracking-widest text-primary uppercase">Watch. Imagine. Create.</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground sm:text-6xl">
                <span className="shimmer-text">Tonera</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">Original anime and toons from a new generation of storytellers.</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => studioRef.current?.scrollIntoView({ behavior: "smooth" })} className="w-fit border-b border-primary px-0 font-heading text-sm font-bold text-primary"><Sparkles className="size-4" />Create your own series</Button>
          </div>
        </section>
        <MediaLibrary onOpenStore={() => setStoreOpen(true)} />
        <section ref={studioRef} className="mt-20 scroll-mt-24 border-t border-border pt-14">
          <div className="mb-7"><p className="text-xs font-bold tracking-widest text-primary uppercase">Creator Studio</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground">Build your next episode</h2><p className="mt-2 text-sm text-muted-foreground">Write, extend, and preview your animated story.</p></div>
          <StoryWriter onGenerate={() => setGenerated(draft)} />
        </section>
        {generated && <section className="mt-8"><h2 className="mb-3 font-display text-xl font-bold text-foreground">Your teaser</h2><PreviewPlayer key={generated} story={generated} onEnded={handleEnded} /><p className="mt-2 text-center text-xs text-muted-foreground">Preview only — downloading is disabled in free mode.</p></section>}
        <section ref={pricingRef} className="mt-16 scroll-mt-24"><h2 className="text-center font-display text-2xl font-bold text-foreground">Pricing &amp; Coins</h2><p className="mt-2 mb-6 text-center text-sm text-muted-foreground">Unlock episodes, support creators, and create longer cartoons.</p><PricingPlans /></section>
      </main>
      <Footer />
      <SideDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onAuth={openAuth}
        onPricing={() => { setMenuOpen(false); pricingRef.current?.scrollIntoView({ behavior: "smooth" }); }}
        onOpenStore={() => { setMenuOpen(false); setStoreOpen(true); }}
        onOpenProfile={() => {}}
      />
      <AuthModal open={authOpen} mode={authMode} onOpenChange={setAuthOpen} onModeChange={setAuthMode} />
      <StoreModal open={storeOpen} onOpenChange={setStoreOpen} />
      <ConversionModal open={convertOpen} onOpenChange={setConvertOpen} onContinue={() => { setConvertOpen(false); addProject(draft.split(/\s+/).slice(0, 5).join(" ") || "My cartoon"); }} onStartNew={() => { setConvertOpen(false); setGenerated(null); setDraft(""); studioRef.current?.scrollIntoView({ behavior: "smooth" }); }} />
    </div>
  );
}
