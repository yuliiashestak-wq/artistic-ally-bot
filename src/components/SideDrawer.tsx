import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PRESET_AVATARS, useAppState } from "@/lib/app-state";
import { Coins, Upload, Sparkles } from "lucide-react";

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

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(account?.avatarId ?? "rabbit", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full border-r border-border bg-violet-ink p-0 sm:max-w-sm">
        <div className="h-full overflow-y-auto px-5 pb-10">
          <SheetHeader className="px-0 pt-6">
            <SheetTitle className="font-display text-xl text-foreground">My Wonder Studio</SheetTitle>
          </SheetHeader>

          <section className="magic-card mt-4 p-4">
            <h3 className="font-heading text-sm tracking-widest text-muted-foreground uppercase">My Profile</h3>
            {account ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-accent/70 bg-violet-deep text-2xl">
                    {account.avatarImage ? (
                      <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" />
                    ) : (
                      (PRESET_AVATARS.find((a) => a.id === account.avatarId)?.emoji ?? "🐰")
                    )}
                  </span>
                  <div>
                    <p className="font-heading text-lg text-foreground">{account.username}</p>
                    <p className="flex items-center gap-1.5 text-sm text-primary">
                      <Coins className="size-4" /> {account.tokens} tokens
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">Choose an avatar</p>
                <div className="mt-2 grid grid-cols-7 gap-1.5">
                  {PRESET_AVATARS.map((a) => (
                    <button
                      key={a.id}
                      title={a.name}
                      onClick={() => setAvatar(a.id, undefined)}
                      className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-xl transition-colors ${
                        account.avatarId === a.id && !account.avatarImage
                          ? "border-primary bg-primary/15"
                          : "border-border bg-violet-deep/60 hover:border-accent"
                      }`}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <Button variant="violet" size="sm" className="mt-3 w-full" onClick={() => fileRef.current?.click()}>
                  <Upload /> Upload my photo
                </Button>
              </>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Sign in to keep your tokens and cartoons safe.</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="magic" size="sm" onClick={() => onAuth("register")}>
                    Register
                  </Button>
                  <Button variant="violet" size="sm" onClick={() => onAuth("signin")}>
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </section>

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
