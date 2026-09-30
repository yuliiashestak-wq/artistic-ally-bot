import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PRESET_AVATARS, useAppState } from "@/lib/app-state";
import { Coins, Sparkles, UserRound } from "lucide-react";

export function SideDrawer({
  open,
  onOpenChange,
  onAuth,
  onPricing,
  onOpenStore,
  onOpenProfile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuth: (mode: "signin" | "register") => void;
  onPricing: () => void;
  onOpenStore: () => void;
  onOpenProfile: () => void;
}) {
  const { account, projects } = useAppState();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full border-r border-border bg-violet-ink p-0 sm:max-w-sm">
        <div className="h-full overflow-y-auto px-5 pb-10">
          <SheetHeader className="px-0 pt-6">
            <SheetTitle className="font-display text-xl text-foreground">Menu</SheetTitle>
          </SheetHeader>

          {/* Account summary */}
          <div className="magic-card mt-4 p-4">
            {account ? (
              <button
                onClick={() => { onOpenChange(false); onOpenProfile(); }}
                className="flex w-full cursor-pointer items-center gap-3 text-left"
              >
                <span className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-accent/70 bg-violet-deep text-2xl">
                  {account.avatarImage ? <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" /> : (PRESET_AVATARS.find((a) => a.id === account.avatarId)?.emoji ?? "🐰")}
                </span>
                <div>
                  <p className="font-heading text-lg text-foreground">{account.username}</p>
                  <p className="flex items-center gap-1.5 text-sm text-primary"><Coins className="size-4" /> {account.tokens} coins</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground underline">View profile</p>
                </div>
              </button>
            ) : (
              <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="size-4" /> Sign in to keep your coins and cartoons safe.</p>
                <div className="mt-3 flex gap-2"><Button variant="magic" size="sm" onClick={() => onAuth("register")}>Register</Button><Button variant="violet" size="sm" onClick={() => onAuth("signin")}>Sign In</Button></div>
              </div>
            )}
          </div>

          {/* Buy coins button */}
          <Button variant="magic" size="lg" className="mt-4 w-full" onClick={() => { onOpenChange(false); onOpenStore(); }}>
            <Coins /> Buy Coins
          </Button>

          {/* Pricing */}
          <Button variant="violet" size="lg" className="mt-3 w-full" onClick={() => { onOpenChange(false); onPricing(); }}>
            <Sparkles /> Pricing &amp; Plans
          </Button>

          {/* Projects */}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
