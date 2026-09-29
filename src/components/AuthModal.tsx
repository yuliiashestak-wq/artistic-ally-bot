import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { Check, X } from "lucide-react";

type Mode = "signin" | "register";

const rules = [
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
];

export function AuthModal({
  open,
  mode,
  onOpenChange,
  onModeChange,
}: {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: Mode) => void;
}) {
  const { signIn } = useAppState();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const passOk = rules.every((r) => r.test(password));

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return setError("Please choose a username.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (!passOk) return setError("Your password does not meet the rules below.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError("");
    signIn({ username: username.trim(), email, tokens: 120, avatarId: "rabbit" });
    onOpenChange(false);
  }

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length === 0) return setError("Please enter your email and password.");
    setError("");
    signIn({ username: email.split("@")[0] ?? "Storyteller", email, tokens: 120, avatarId: "fox" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="magic-card border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">Join the Wonder</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => { setError(""); onModeChange(v as Mode); }}>
          <TabsList className="grid w-full grid-cols-2 bg-violet-ink">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-5">
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@story.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-pass">Password</Label>
                <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="magic" size="lg" className="w-full">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-5">
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="rg-user">Username</Label>
                <Input id="rg-user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="StoryWizard" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg-email">Email</Label>
                <Input id="rg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@story.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg-pass">Password</Label>
                <Input id="rg-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg-confirm">Confirm Password</Label>
                <Input id="rg-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>

              <ul className="grid grid-cols-2 gap-2 rounded-xl bg-violet-ink/70 p-3">
                {rules.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li
                      key={r.label}
                      className={`flex items-center gap-2 text-xs ${ok ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      {r.label}
                    </li>
                  );
                })}
              </ul>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="magic" size="lg" className="w-full">
                Create My Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
