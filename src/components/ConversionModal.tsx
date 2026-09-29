import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingPlans } from "@/components/PricingPlans";

export function ConversionModal({
  open,
  onOpenChange,
  onContinue,
  onStartNew,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onStartNew: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="magic-card max-h-[90vh] overflow-y-auto border-0 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            Loved your intro? Save your progress and extend your cartoon!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pick a plan to unlock full-length, high-quality cartoons with your own characters.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PricingPlans />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="magic" size="lg" onClick={onContinue}>
            Continue My Cartoon
          </Button>
          <Button variant="violet" size="lg" onClick={onStartNew}>
            Start a New Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
