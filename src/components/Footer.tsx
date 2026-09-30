import { Send, Mail, FileText, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border/60 bg-violet-ink/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2">
            <p className="font-display text-2xl font-bold tracking-widest text-foreground">TONERA</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Watch and create original animated stories. A new generation of storytellers starts here.
            </p>
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-bold tracking-wide text-foreground uppercase">Support</h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href="https://t.me/ToneraSupportBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Send className="size-4" /> @ToneraSupportBot
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@tonera.ai"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="size-4" /> support@tonera.ai
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-sm font-bold tracking-wide text-foreground uppercase">Legal</h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a href="/terms" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <FileText className="size-4" /> Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <Shield className="size-4" /> Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Tonera. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with imagination for storytellers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
