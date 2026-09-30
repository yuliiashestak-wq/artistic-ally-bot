import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export const PLANS = [
  { id: "starter", name: "Starter", price: "$5 / €5", coins: "100 Coins", note: "Begin your journey" },
  { id: "explorer", name: "Explorer", price: "$15 / €15", coins: "350 Coins", note: "Most popular", featured: true },
  { id: "creator", name: "Creator", price: "$25 / €25", coins: "700 Coins", note: "For active creators" },
  { id: "legend", name: "Legend", price: "$50 / €50", coins: "1,500 Coins", note: "Best value" },
];

export function PricingPlans({ onChoose }: { onChoose?: (planId: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`magic-card flex flex-col p-4 text-left ${
            plan.featured ? "ring-2 ring-primary/70" : ""
          }`}
        >
          {plan.featured && (
            <span className="mb-2 self-start rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              POPULAR
            </span>
          )}
          <p className="font-heading text-lg text-foreground">{plan.name}</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{plan.price}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Coins className="size-4 text-primary" />
            <p className="text-sm text-foreground/90">{plan.coins}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{plan.note}</p>
          <Button variant={plan.featured ? "magic" : "violet"} className="mt-4 w-full" onClick={() => onChoose?.(plan.id)}>
            Get Coins
          </Button>
        </div>
      ))}
    </div>
  );
}
