import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { finishStory, suggestStory } from "@/lib/story.functions";
import { useAppState } from "@/lib/app-state";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

export function StoryWriter({ onGenerate }: { onGenerate: () => void }) {
  const { draft, setDraft } = useAppState();
  const suggest = useServerFn(suggestStory);
  const finish = useServerFn(finishStory);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const text = draft.trim();
    if (text.length < 20) {
      setSuggestions([]);
      return;
    }
    const id = ++requestId.current;
    setLoadingSuggestions(true);
    const timer = setTimeout(() => {
      suggest({ data: { story: text } })
        .then((res) => {
          if (id !== requestId.current) return;
          setSuggestions(res.suggestions);
        })
        .catch(() => {
          if (id === requestId.current) setSuggestions([]);
        })
        .finally(() => {
          if (id === requestId.current) setLoadingSuggestions(false);
        });
    }, 1100);

    return () => clearTimeout(timer);
  }, [draft, suggest]);

  async function handleFinish() {
    setFinishing(true);
    try {
      const res = await finish({ data: { story: draft } });
      setDraft((draft.trim() + " " + res.text).trim());
    } catch {
      toast.error("The story magic hiccuped. Please try again.");
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="magic-card p-5 sm:p-7">
      <label htmlFor="story" className="font-display text-xl font-bold text-foreground">
        Once upon a time...
      </label>
      <p className="mt-1 text-sm text-muted-foreground">
        Write your story. Magical ideas appear as you type.
      </p>

      <Textarea
        id="story"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={7}
        placeholder="A tiny fox named Ember found a glowing map under her pillow..."
        className="mt-4 resize-none rounded-2xl border-accent/40 bg-violet-ink/70 p-4 font-display text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-accent"
      />

      <div className="mt-4 min-h-[3rem]">
        {loadingSuggestions && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Summoning ideas...
          </p>
        )}
        {!loadingSuggestions && suggestions.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-3">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => setDraft((draft.trim() + " " + s).trim())}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-sparkle-pop cursor-pointer rounded-xl border border-accent/40 bg-violet-deep/60 p-3 text-left text-sm leading-snug text-foreground/90 transition-colors hover:border-primary hover:bg-violet-deep"
              >
                <Sparkles className="mb-1.5 size-4 text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button variant="violet" size="lg" onClick={handleFinish} disabled={finishing}>
          {finishing ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Help Finish My Story
        </Button>
        <Button
          variant="magic"
          size="xl"
          className="sm:ml-auto"
          disabled={draft.trim().length < 10}
          onClick={onGenerate}
        >
          <Sparkles /> Magify My Story
        </Button>
      </div>
    </div>
  );
}
