import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { PRESET_AVATARS } from "@/lib/app-state";
import { Coins } from "lucide-react";

export function AppHeader({
  onOpenMenu,
  onAuth,
}: {
  onOpenMenu: () => void;
  onAuth: (mode: "signin" | "register") => void;
}) {
  const { account } = useAppState();
  const avatar = PRESET_AVATARS.find((a) => a.id === account?.avatarId);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="group flex h-11 w-14 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-violet-ink/70 transition-colors hover:border-accent"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-primary transition-transform duration-200 group-hover:scale-125"
            />
          ))}
        </button>

        <span className="font-display text-lg font-bold tracking-wide text-foreground sm:text-xl">
          ToonStory <span className="text-primary">AI</span>
        </span>

        {account ? (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-violet-ink/70 px-3 py-1.5 text-sm text-foreground sm:flex">
              <Coins className="size-4 text-primary" />
              {account.tokens}
            </span>
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-accent/70 bg-violet-deep text-lg">
              {account.avatarImage ? (
                <img src={account.avatarImage} alt="Your avatar" className="size-full object-cover" />
              ) : (
                (avatar?.emoji ?? "🐰")
              )}
            </span>
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
