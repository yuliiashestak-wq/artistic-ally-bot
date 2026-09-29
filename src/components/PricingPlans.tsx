import { Button } from "@/components/ui/button";

export const PLANS = [
  { id: "7d", name: "7 Days", price: "$4", tokens: "250 tokens", note: "A weekend of wonder" },
  { id: "14d", name: "14 Days", price: "$7", tokens: "600 tokens", note: "Two weeks of stories" },
  { id: "1m", name: "1 Month", price: "$12", tokens: "1,500 tokens", note: "Most loved", featured: true },
  { id: "1y", name: "1 Year", price: "$89", tokens: "25,000 tokens", note: "Best value" },
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
          <p className="mt-1 text-sm text-foreground/90">{plan.tokens}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{plan.note}</p>
          <Button variant={plan.featured ? "magic" : "violet"} className="mt-4 w-full" onClick={() => onChoose?.(plan.id)}>
            Choose plan
          </Button>
        </div>
      ))}
    </div>
  );
}
