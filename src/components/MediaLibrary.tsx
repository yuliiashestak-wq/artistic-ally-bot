import { useState } from "react";
import { Coins, Heart, LockKeyhole, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import neonForest from "@/assets/poster-neon-forest.jpg";
import skyPirates from "@/assets/poster-sky-pirates.jpg";
import moonCity from "@/assets/poster-moon-city.jpg";
import clockwork from "@/assets/poster-clockwork.jpg";

type Series = {
  id: string;
  title: string;
  creator: string;
  genre: string;
  episode: string;
  description: string;
  image: string;
  access: "free" | "locked";
};

const TRENDING: Series[] = [
  { id: "neon-forest", title: "The Neon Forest", creator: "Mira Vale", genre: "Fantasy", episode: "EP 08", description: "Ember follows a golden compass into a forest where every wish leaves a glowing trail.", image: neonForest, access: "free" },
  { id: "sky-pirates", title: "Sky Pirates", creator: "Nova Frames", genre: "Adventure", episode: "EP 12", description: "A fearless young captain races across floating kingdoms to recover a stolen storm crystal.", image: skyPirates, access: "locked" },
  { id: "moon-city", title: "Moon City", creator: "Silver Ink", genre: "Romance", episode: "EP 05", description: "A moon princess and her guardian wolf uncover a secret hidden beneath a radiant city.", image: moonCity, access: "locked" },
  { id: "clockwork", title: "Clockwork Crew", creator: "Pixel Bloom", genre: "Family", episode: "EP 03", description: "Three inventors and one optimistic robot race to restart the heart of a mechanical jungle.", image: clockwork, access: "free" },
];

const NEW_RELEASES: Series[] = [
  { id: "moon-city-new", title: "Lunar Promise", creator: "Silver Ink", genre: "Romance", episode: "NEW · EP 01", description: "A moon princess and her guardian wolf uncover a secret hidden beneath a radiant city.", image: moonCity, access: "free" },
  { id: "ember-map", title: "Ember & the Star Map", creator: "Mira Vale", genre: "Fantasy", episode: "NEW · EP 02", description: "Ember follows a golden compass into a forest where every wish leaves a glowing trail.", image: neonForest, access: "locked" },
  { id: "robot-rush", title: "Robot Rush", creator: "Pixel Bloom", genre: "Family", episode: "NEW · EP 01", description: "Three inventors and one optimistic robot race to restart the heart of a mechanical jungle.", image: clockwork, access: "free" },
  { id: "isles-above", title: "Isles Above", creator: "Nova Frames", genre: "Adventure", episode: "NEW · EP 04", description: "A fearless young captain races across floating kingdoms to recover a stolen storm crystal.", image: skyPirates, access: "locked" },
];

function MediaCard({ series, favorite, onFavorite, onOpen }: { series: Series; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-card shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-[var(--shadow-glow)]">
        <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer" aria-label={`Open ${series.title}`} />
        <img src={series.image} alt={`${series.title} poster`} width={768} height={1152} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background to-transparent" />
        <span className={`absolute top-2 left-2 z-20 rounded px-2 py-1 text-[10px] font-extrabold tracking-wide ${series.access === "free" ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground"}`}>
          {series.access === "free" ? "FREE" : "🔒 5 COIN UNLOCK"}
        </span>
        <Button type="button" variant="violet" size="icon" aria-label={favorite ? `Remove ${series.title} from favorites` : `Add ${series.title} to favorites`} title={favorite ? "Remove from favorites" : "Add to favorites"} onClick={(event) => { event.stopPropagation(); onFavorite(); }} className="absolute top-2 right-2 z-20 size-9 rounded-full bg-background/80">
          <Heart className={favorite ? "fill-primary text-primary" : "text-foreground"} />
        </Button>
        <span className="absolute right-3 bottom-3 z-20 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-[var(--shadow-gold)] transition group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </div>
      <button type="button" onClick={onOpen} className="mt-2 block w-full cursor-pointer text-left">
        <h3 className="truncate font-heading text-base font-bold text-foreground">{series.title}</h3>
        <p className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{series.genre}</span><span>{series.episode}</span></p>
      </button>
    </article>
  );
}

function MediaRow({ title, eyebrow, items, favorites, onFavorite, onOpen }: { title: string; eyebrow: string; items: Series[]; favorites: Set<string>; onFavorite: (id: string) => void; onOpen: (series: Series) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p><h2 className="mt-1 font-display text-2xl font-bold text-foreground">{title}</h2></div>
        <span className="hidden text-xs text-muted-foreground sm:block">Fresh episodes every week</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
        {items.map((series) => <MediaCard key={series.id} series={series} favorite={favorites.has(series.id)} onFavorite={() => onFavorite(series.id)} onOpen={() => onOpen(series)} />)}
      </div>
    </section>
  );
}

export function MediaLibrary() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<Series | null>(null);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="space-y-14">
        <MediaRow title="Trending Anime & Toons" eyebrow="Most watched now" items={TRENDING} favorites={favorites} onFavorite={toggleFavorite} onOpen={setSelected} />
        <MediaRow title="New Releases" eyebrow="Just dropped" items={NEW_RELEASES} favorites={favorites} onFavorite={toggleFavorite} onOpen={setSelected} />
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card p-0 sm:max-w-3xl">
            <div className="grid sm:grid-cols-[240px_1fr]">
              <img src={selected.image} alt={`${selected.title} poster`} width={768} height={1152} className="aspect-[2/3] h-full w-full object-cover" />
              <div className="flex flex-col p-6 sm:p-8">
                <DialogHeader>
                  <p className="text-xs font-bold tracking-widest text-primary uppercase">{selected.episode} · {selected.genre}</p>
                  <DialogTitle className="mt-2 font-display text-3xl leading-tight text-foreground">{selected.title}</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.description}</DialogDescription>
                </DialogHeader>
                <p className="mt-5 text-sm text-foreground">Created by <strong>{selected.creator}</strong></p>
                <div className="mt-auto grid gap-3 pt-8">
                  <Button variant="magic" size="lg" onClick={() => toast.success(selected.access === "free" ? "Episode ready to play" : "Episode unlock will use 5 coins once the wallet is enabled.")}>
                    {selected.access === "free" ? <Play /> : <LockKeyhole />}{selected.access === "free" ? "Watch Free Episode" : "Unlock for 5 Coins"}
                  </Button>
                  <Button variant="violet" size="lg" onClick={() => toast.success(`Donation support for ${selected.creator} is ready for the coin wallet.`)}>
                    <Coins /> Donate Coins to Creator
                  </Button>
                  <Button variant="ghost" onClick={() => toggleFavorite(selected.id)}><Heart className={favorites.has(selected.id) ? "fill-primary text-primary" : ""} />{favorites.has(selected.id) ? "Saved to Favorites" : "Add to Favorites"}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
