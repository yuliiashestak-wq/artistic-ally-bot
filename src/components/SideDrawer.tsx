import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRESET_AVATARS, useAppState } from "@/lib/app-state";
import { Coins, KeyRound, Save, Settings2, Sparkles, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";

const API_SETTINGS_KEY = "toonstory-api-settings";

type ApiSettings = {
  geminiKey: string;
  videoEndpoint: string;
  videoKey: string;
};

export function SideDrawer({
  open,
  onOpenChange,
  onAuth,
  onPricing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuth: (mode: "signin" | "register") => void;
  onPricing: () => void;
}) {
  const { account, projects, setAvatar, signOut } = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({ geminiKey: "", videoEndpoint: "", videoKey: "" });

  useEffect(() => {
    const saved = window.sessionStorage.getItem(API_SETTINGS_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<ApiSettings>;
      setApiSettings({
        geminiKey: parsed.geminiKey ?? "",
        videoEndpoint: parsed.videoEndpoint ?? "",
        videoKey: parsed.videoKey ?? "",
      });
    } catch {
      window.sessionStorage.removeItem(API_SETTINGS_KEY);
    }
  }, []);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(account?.avatarId ?? "rabbit", String(reader.result));
    reader.readAsDataURL(file);
  }

  function saveApiSettings() {
    window.sessionStorage.setItem(API_SETTINGS_KEY, JSON.stringify(apiSettings));
    toast.success("API settings saved for this browser session.");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full border-r border-border bg-violet-ink p-0 sm:max-w-sm">
        <div className="h-full overflow-y-auto px-5 pb-10">
          <SheetHeader className="px-0 pt-6">
            <SheetTitle className="font-display text-xl text-foreground">My Wonder Studio</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="profile" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-background/50">
              <TabsTrigger value="profile"><UserRound className="mr-1.5 size-4" />Profile</TabsTrigger>
              <TabsTrigger value="api"><Settings2 className="mr-1.5 size-4" />Platform API</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="magic-card mt-3 p-4">
              {account ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-accent/70 bg-violet-deep text-2xl">
                      {account.avatarImage ? <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" /> : (PRESET_AVATARS.find((a) => a.id === account.avatarId)?.emoji ?? "🐰")}
                    </span>
                    <div><p className="font-heading text-lg text-foreground">{account.username}</p><p className="flex items-center gap-1.5 text-sm text-primary"><Coins className="size-4" /> {account.tokens} tokens</p></div>
                  </div>
                  <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">Choose an avatar</p>
                  <div className="mt-2 grid grid-cols-7 gap-1.5">
                    {PRESET_AVATARS.map((a) => (
                      <Button key={a.id} title={a.name} aria-label={`Choose ${a.name} avatar`} variant="violet" size="icon" onClick={() => setAvatar(a.id, undefined)} className={`aspect-square h-auto w-full text-xl ${account.avatarId === a.id && !account.avatarImage ? "border-primary bg-primary/15" : "bg-violet-deep/60"}`}>{a.emoji}</Button>
                    ))}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <Button variant="violet" size="sm" className="mt-3 w-full" onClick={() => fileRef.current?.click()}><Upload /> Upload my photo</Button>
                </>
              ) : (
                <div><p className="text-sm text-muted-foreground">Sign in to keep your tokens and cartoons safe.</p><div className="mt-3 flex gap-2"><Button variant="magic" size="sm" onClick={() => onAuth("register")}>Register</Button><Button variant="violet" size="sm" onClick={() => onAuth("signin")}>Sign In</Button></div></div>
              )}
            </TabsContent>
            <TabsContent value="api" className="mt-4 space-y-4">
              <div><h3 className="font-heading text-base font-bold text-foreground">Platform API Settings</h3><p className="mt-1 text-xs text-muted-foreground">Connect your preferred story and video services.</p></div>
              <div><label htmlFor="gemini-key" className="text-xs font-bold text-foreground">Google Gemini API Key</label><div className="relative mt-1.5"><KeyRound className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" /><Input id="gemini-key" type="password" autoComplete="off" value={apiSettings.geminiKey} onChange={(event) => setApiSettings((current) => ({ ...current, geminiKey: event.target.value }))} placeholder="Enter Gemini key" className="h-10 bg-background/50 pl-9" /></div></div>
              <div><label htmlFor="video-endpoint" className="text-xs font-bold text-foreground">Video Generation API Endpoint</label><Input id="video-endpoint" type="url" value={apiSettings.videoEndpoint} onChange={(event) => setApiSettings((current) => ({ ...current, videoEndpoint: event.target.value }))} placeholder="https://api.example.com/generate" className="mt-1.5 h-10 bg-background/50" /></div>
              <div><label htmlFor="video-key" className="text-xs font-bold text-foreground">Video Generation API Key</label><div className="relative mt-1.5"><KeyRound className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" /><Input id="video-key" type="password" autoComplete="off" value={apiSettings.videoKey} onChange={(event) => setApiSettings((current) => ({ ...current, videoKey: event.target.value }))} placeholder="Enter video API key" className="h-10 bg-background/50 pl-9" /></div></div>
              <p className="text-xs leading-relaxed text-muted-foreground">Keys are masked and kept only for this browser session. Production connections require secure project secrets.</p>
              <Button variant="magic" className="w-full" onClick={saveApiSettings}><Save />Save API Settings</Button>
            </TabsContent>
          </Tabs>

          <section className="mt-5">
            <h3 className="font-heading text-sm tracking-widest text-muted-foreground uppercase">My Projects</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="cursor-pointer overflow-hidden rounded-xl border border-border bg-violet-deep/50 transition-colors hover:border-accent"
                >
                  <div
                    className="flex aspect-video items-center justify-center text-3xl"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, oklch(0.45 0.2 ${p.hue} / 0.75), oklch(0.2 0.06 285))`,
                    }}
                  >
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

          <Button variant="magic" size="lg" className="mt-6 w-full" onClick={onPricing}>
            <Sparkles /> Pricing &amp; Buy Tokens
          </Button>

          {account && (
            <button
              onClick={signOut}
              className="mt-4 w-full cursor-pointer text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
