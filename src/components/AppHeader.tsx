import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { PRESET_AVATARS } from "@/lib/app-state";
import { Coins, Menu } from "lucide-react";

export function AppHeader({
  onOpenMenu,
  onAuth,
  onOpenStore,
}: {
  onOpenMenu: () => void;
  onAuth: (mode: "signin" | "register") => void;
  onOpenStore: () => void;
}) {
  const { account, setView } = useAppState();
  const avatar = PRESET_AVATARS.find((a) => a.id === account?.avatarId);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-violet-ink/70 transition-colors hover:border-accent"
          >
            <Menu className="size-5 text-foreground" />
          </button>
        </div>

        <button
          onClick={() => { setView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="cursor-pointer font-display text-lg font-bold tracking-widest text-foreground transition-colors hover:text-primary sm:text-xl"
          aria-label="Go to home"
        >
          TONERA
        </button>

        {account ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenStore}
              className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-violet-ink/70 px-3 py-1.5 text-sm font-bold text-foreground transition-all hover:border-primary hover:shadow-[var(--shadow-gold)]"
              aria-label="Buy coins"
            >
              <Coins className="size-4 text-primary transition-transform group-hover:scale-110" />
              <span className="tabular-nums">{account.tokens}</span>
            </button>
            <button
              onClick={() => setView("profile")}
              className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-accent/70 bg-violet-deep text-lg transition-transform hover:scale-105"
              aria-label="Open profile"
            >
              {account.avatarImage ? (
                <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" />
              ) : (
                (avatar?.emoji ?? "🐰")
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="violet" size="sm" onClick={() => onAuth("signin")}>
              Sign In
            </Button>
            <Button variant="magic" size="sm" onClick={() => onAuth("register")}>
              Register
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
