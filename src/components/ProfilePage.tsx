import { ArrowLeft, Coins, Heart, Settings2, BookOpen, FileEdit, KeyRound, Save, Upload, Users, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState, PRESET_AVATARS } from "@/lib/app-state";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const API_SETTINGS_KEY = "tonera-api-settings";

type ApiSettings = {
  geminiKey: string;
  stripeKey: string;
};

type SeriesRow = {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: string;
  episode_count: number;
  created_at: string;
};

export function ProfilePage() {
  const { account, setView, creatorStats, refreshCreatorStats, setAvatar, signOut, projects } = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({ geminiKey: "", stripeKey: "" });
  const [publishedSeries, setPublishedSeries] = useState<SeriesRow[]>([]);
  const [draftSeries, setDraftSeries] = useState<SeriesRow[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(API_SETTINGS_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<ApiSettings>;
      setApiSettings({
        geminiKey: parsed.geminiKey ?? "",
        stripeKey: parsed.stripeKey ?? "",
      });
    } catch {
      window.sessionStorage.removeItem(API_SETTINGS_KEY);
    }
  }, []);

  useEffect(() => {
    async function loadSeries() {
      const { data } = await supabase
        .from("series")
        .select("id, title, description, genre, status, episode_count, created_at")
        .eq("user_id", account?.email ?? "")
        .order("created_at", { ascending: false });
      if (data) {
        setPublishedSeries(data.filter((s) => s.status === "published"));
        setDraftSeries(data.filter((s) => s.status === "draft"));
      }
      setLoadingSeries(false);
    }
    if (account) void loadSeries();
  }, [account]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(account?.avatarId ?? "rabbit", String(reader.result));
    reader.readAsDataURL(file);
  }

  function saveApiSettings() {
    window.sessionStorage.setItem(API_SETTINGS_KEY, JSON.stringify(apiSettings));
    toast.success("Settings saved for this browser session.");
  }

  const stats = creatorStats ?? { followers: 0, totalLikes: 0, coinEarnings: 0 };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-9 pb-24 sm:px-6">
      <button
        onClick={() => setView("home")}
        className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Home
      </button>

      {/* Profile Header with Creator Stats */}
      <div className="mt-6 magic-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <span className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-accent/70 bg-violet-deep text-3xl shadow-[var(--shadow-glow)]">
            {account?.avatarImage ? (
              <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" />
            ) : (
              PRESET_AVATARS.find((a) => a.id === account?.avatarId)?.emoji ?? "🐰"
            )}
          </span>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-3xl font-bold text-foreground">{account?.username ?? "Storyteller"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{account?.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-violet-deep/70">
                  <Users className="size-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground tabular-nums">{stats.followers}</p>
                  <p className="text-[11px] text-muted-foreground">Followers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-violet-deep/70">
                  <Heart className="size-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground tabular-nums">{stats.totalLikes}</p>
                  <p className="text-[11px] text-muted-foreground">Total Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-violet-deep/70">
                  <Coins className="size-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground tabular-nums">{stats.coinEarnings}</p>
                  <p className="text-[11px] text-muted-foreground">Coin Earnings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-violet-deep/70">
                  <TrendingUp className="size-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground tabular-nums">{account?.tokens ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">Coin Balance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="published" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 bg-violet-ink">
          <TabsTrigger value="published"><BookOpen className="mr-1.5 size-4" />Published</TabsTrigger>
          <TabsTrigger value="drafts"><FileEdit className="mr-1.5 size-4" />Drafts</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="mr-1.5 size-4" />Settings</TabsTrigger>
        </TabsList>

        {/* Published Series Tab */}
        <TabsContent value="published" className="mt-4">
          {loadingSeries ? (
            <p className="text-sm text-muted-foreground">Loading your published series...</p>
          ) : publishedSeries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {publishedSeries.map((s) => (
                <div key={s.id} className="magic-card p-4">
                  <h3 className="font-heading text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.genre} · {s.episode_count} episode(s)</p>
                  {s.description && <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{s.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="magic-card p-6 text-center">
              <BookOpen className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No published series yet. Create and publish your first animated story!</p>
            </div>
          )}
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="mt-4">
          {loadingSeries ? (
            <p className="text-sm text-muted-foreground">Loading drafts...</p>
          ) : draftSeries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {draftSeries.map((s) => (
                <div key={s.id} className="magic-card p-4 opacity-80">
                  <h3 className="font-heading text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.genre} · Draft</p>
                  {s.description && <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{s.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="magic-card p-6 text-center">
              <FileEdit className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No drafts saved. Your work-in-progress stories will appear here.</p>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 space-y-5">
          <div className="magic-card p-5">
            <h3 className="font-heading text-base font-bold text-foreground">Profile Details</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="prof-username">Username</Label>
                <Input id="prof-username" value={account?.username ?? ""} readOnly className="mt-1.5 bg-background/50" />
              </div>
              <div>
                <Label htmlFor="prof-email">Email</Label>
                <Input id="prof-email" value={account?.email ?? ""} readOnly className="mt-1.5 bg-background/50" />
              </div>
            </div>
            <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">Choose an avatar</p>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {PRESET_AVATARS.map((a) => (
                <Button key={a.id} title={a.name} aria-label={`Choose ${a.name} avatar`} variant="violet" size="icon" onClick={() => setAvatar(a.id, undefined)} className={`aspect-square h-auto w-full text-xl ${account?.avatarId === a.id && !account?.avatarImage ? "border-primary bg-primary/15" : "bg-violet-deep/60"}`}>{a.emoji}</Button>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button variant="violet" size="sm" className="mt-3" onClick={() => fileRef.current?.click()}><Upload /> Upload my photo</Button>
          </div>

          <div className="magic-card p-5">
            <h3 className="font-heading text-base font-bold text-foreground">API & Integration Keys</h3>
            <p className="mt-1 text-xs text-muted-foreground">Connect your preferred services. Keys are masked and kept only for this browser session.</p>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="gemini-key" className="text-xs font-bold text-foreground">Google Gemini API Key</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input id="gemini-key" type="password" autoComplete="off" value={apiSettings.geminiKey} onChange={(e) => setApiSettings((c) => ({ ...c, geminiKey: e.target.value }))} placeholder="Enter Gemini key" className="h-10 bg-background/50 pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="stripe-key" className="text-xs font-bold text-foreground">Stripe Secret Key</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input id="stripe-key" type="password" autoComplete="off" value={apiSettings.stripeKey} onChange={(e) => setApiSettings((c) => ({ ...c, stripeKey: e.target.value }))} placeholder="Enter Stripe secret key" className="h-10 bg-background/50 pl-9" />
                </div>
              </div>
              <Button variant="magic" className="w-full" onClick={saveApiSettings}><Save />Save Settings</Button>
            </div>
          </div>

          {account && (
            <button
              onClick={signOut}
              className="w-full cursor-pointer text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          )}
        </TabsContent>
      </Tabs>

      {/* My Projects (saved from studio) */}
      <section className="mt-8">
        <h3 className="font-heading text-sm tracking-widest text-muted-foreground uppercase">My Saved Projects</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {projects.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-violet-deep/50">
              <div className="flex aspect-video items-center justify-center text-3xl" style={{ background: `radial-gradient(circle at 50% 40%, oklch(0.45 0.2 ${p.hue} / 0.75), oklch(0.2 0.06 285))` }}>
                {p.emoji}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs leading-snug font-semibold text-foreground">{p.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
