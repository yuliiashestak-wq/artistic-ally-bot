import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Check, Loader2, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { toast } from "sonner";

type CoinPackage = {
  id: string;
  coins: number;
  price: string;
  bonus: string;
  popular?: boolean;
};

const PACKAGES: CoinPackage[] = [
  { id: "starter", coins: 100, price: "$5 / €5", bonus: "Starter pack" },
  { id: "explorer", coins: 350, price: "$15 / €15", bonus: "+17% bonus", popular: true },
  { id: "creator", coins: 700, price: "$25 / €25", bonus: "+40% bonus" },
  { id: "legend", coins: 1500, price: "$50 / €50", bonus: "+50% bonus" },
];

export function StoreModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { account, addCoins } = useAppState();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  async function handleBuy(pkg: CoinPackage) {
    if (!account) {
      toast.error("Please sign in to buy coins.");
      return;
    }
    setPurchasing(pkg.id);
    try {
      const newBalance = await addCoins(pkg.coins);
      if (newBalance === null) {
        toast.error("Could not add coins. Please try again.");
      } else {
        toast.success(`+${pkg.coins} Coins added! New balance: ${newBalance} Coins`);
        onOpenChange(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="magic-card max-h-[90vh] overflow-y-auto border-0 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Coins className="size-6 text-primary" />
            <DialogTitle className="font-display text-2xl text-foreground">Buy Coins</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Top up your wallet to unlock episodes and support creators.
            {account && (
              <span className="mt-1 block font-heading text-sm font-bold text-primary">
                Current balance: {account.tokens} Coins
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border p-4 transition-all duration-200 hover:scale-[1.02] ${
                pkg.popular
                  ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                  : "border-border bg-violet-deep/50"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold tracking-wide text-primary-foreground">
                  POPULAR
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/20">
                  <Coins className="size-5 text-primary" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-primary">{pkg.coins}</p>
                  <p className="text-[11px] text-muted-foreground">Coins</p>
                </div>
              </div>
              <p className="mt-3 font-heading text-lg font-bold text-foreground">{pkg.price}</p>
              <p className="text-xs text-muted-foreground">{pkg.bonus}</p>
              <Button
                variant={pkg.popular ? "magic" : "violet"}
                size="sm"
                className="mt-3 w-full"
                disabled={purchasing !== null}
                onClick={() => handleBuy(pkg)}
              >
                {purchasing === pkg.id ? (
                  <><Loader2 className="animate-spin" /> Processing...</>
                ) : (
                  <><Check /> Buy Now</>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-violet-ink/60 p-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Test mode: coins are added instantly to your balance. Stripe checkout will be available once payment integration is configured.
          </p>
        </div>

        {!account && (
          <p className="mt-3 text-center text-sm text-destructive">
            Sign in to purchase coins.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
