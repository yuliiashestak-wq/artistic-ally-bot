import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type Avatar = { id: string; name: string; emoji: string };

export const PRESET_AVATARS: Avatar[] = [
  { id: "rabbit", name: "Rabbit", emoji: "🐰" },
  { id: "bear", name: "Bear", emoji: "🐻" },
  { id: "bee", name: "Bee", emoji: "🐝" },
  { id: "fox", name: "Fox", emoji: "🦊" },
  { id: "owl", name: "Owl", emoji: "🦉" },
  { id: "cat", name: "Cat", emoji: "🐱" },
  { id: "puppy", name: "Puppy", emoji: "🐶" },
];

export type Project = {
  id: string;
  title: string;
  date: string;
  emoji: string;
  hue: number;
};

export type CreatorStats = {
  followers: number;
  totalLikes: number;
  coinEarnings: number;
};

export type Account = {
  username: string;
  email: string;
  tokens: number;
  avatarId: string;
  avatarImage?: string | undefined;
};

type AppState = {
  account: Account | null;
  authReady: boolean;
  signOut: () => void;
  setAvatar: (avatarId: string, avatarImage?: string) => void;
  projects: Project[];
  addProject: (title: string) => void;
  draft: string;
  setDraft: (value: string) => void;
  deductCoins: (amount: number) => Promise<number | null>;
  addCoins: (amount: number) => Promise<number | null>;
  unlockEpisode: (seriesKey: string, episodeNumber?: number) => Promise<boolean>;
  isEpisodeUnlocked: (seriesKey: string, episodeNumber?: number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  creatorStats: CreatorStats | null;
  refreshCreatorStats: (userId?: string) => Promise<void>;
  view: "home" | "profile";
  setView: (view: "home" | "profile") => void;
};

const SAMPLE_PROJECTS: Project[] = [
  { id: "p1", title: "Luna and the Glowing Map", date: "12 Sep 2026", emoji: "🌙", hue: 292 },
  { id: "p2", title: "The Bee Who Painted Rain", date: "28 Aug 2026", emoji: "🐝", hue: 92 },
  { id: "p3", title: "Robot Fox of Neon Forest", date: "14 Aug 2026", emoji: "🦊", hue: 330 },
  { id: "p4", title: "Captain Puppy Saves Sunday", date: "02 Aug 2026", emoji: "🐶", hue: 210 },
];

const AppStateContext = createContext<AppState | null>(null);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [draft, setDraft] = useState("");
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);
  const [view, setView] = useState<"home" | "profile">("home");

  const loadCreatorStats = useCallback(async (uid: string) => {
    try {
      const [followersRes, seriesRes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", uid),
        supabase.from("series").select("id").eq("user_id", uid).eq("status", "published"),
      ]);

      const seriesIds = (seriesRes.data ?? []).map((s) => s.id);
      let totalLikes = 0;
      if (seriesIds.length > 0) {
        const likesRes = await supabase
          .from("series_likes")
          .select("id", { count: "exact", head: true })
          .in("series_id", seriesIds);
        totalLikes = likesRes.count ?? 0;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("coin_earnings")
        .eq("id", uid)
        .maybeSingle();

      setCreatorStats({
        followers: followersRes.count ?? 0,
        totalLikes,
        coinEarnings: profile?.coin_earnings ?? 0,
      });
    } catch {
      setCreatorStats({ followers: 0, totalLikes: 0, coinEarnings: 0 });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadForUser(uid: string, email: string) {
      const [{ data: profile }, { data: rows }] = await Promise.all([
        supabase.from("profiles").select("username, avatar_id, avatar_image, tokens, coin_earnings").eq("id", uid).maybeSingle(),
        supabase.from("projects").select("id, title, emoji, hue, created_at").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setAccount({
        username: profile?.username ?? email.split("@")[0] ?? "Storyteller",
        email,
        tokens: profile?.tokens ?? 120,
        avatarId: profile?.avatar_id ?? "rabbit",
        avatarImage: profile?.avatar_image ?? undefined,
      });
      setProjects(
        (rows ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          emoji: r.emoji,
          hue: r.hue,
          date: formatDate(r.created_at),
        })),
      );
      void loadCreatorStats(uid);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const user = data.session?.user;
      if (user?.email) {
        setUserId(user.id);
        void loadForUser(user.id, user.email);
      }
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      const user = session?.user;
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && user?.email) {
        setUserId(user.id);
        void loadForUser(user.id, user.email);
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        setAccount(null);
        setProjects(SAMPLE_PROJECTS);
        setCreatorStats(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadCreatorStats]);

  const refreshBalance = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("profiles").select("tokens").eq("id", userId).maybeSingle();
    if (data) {
      setAccount((prev) => (prev ? { ...prev, tokens: data.tokens } : prev));
    }
  }, [userId]);

  const deductCoins = useCallback(
    async (amount: number): Promise<number | null> => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc("deduct_coins", { amount });
      if (error || data === null) return null;
      setAccount((prev) => (prev ? { ...prev, tokens: data } : prev));
      return data;
    },
    [userId],
  );

  const addCoins = useCallback(
    async (amount: number): Promise<number | null> => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc("add_coins", { amount });
      if (error || data === null) return null;
      setAccount((prev) => (prev ? { ...prev, tokens: data } : prev));
      return data;
    },
    [userId],
  );

  const unlockEpisode = useCallback(
    async (seriesKey: string, episodeNumber = 1): Promise<boolean> => {
      if (!userId) return false;
      const { error } = await supabase
        .from("episode_unlocks")
        .insert({ user_id: userId, series_key: seriesKey, episode_number: episodeNumber });
      return !error;
    },
    [userId],
  );

  const isEpisodeUnlocked = useCallback(
    async (seriesKey: string, episodeNumber = 1): Promise<boolean> => {
      if (!userId) return false;
      const { data } = await supabase
        .from("episode_unlocks")
        .select("id")
        .eq("user_id", userId)
        .eq("series_key", seriesKey)
        .eq("episode_number", episodeNumber)
        .maybeSingle();
      return !!data;
    },
    [userId],
  );

  const refreshCreatorStats = useCallback(
    async (uid?: string) => {
      const targetId = uid ?? userId;
      if (!targetId) return;
      await loadCreatorStats(targetId);
    },
    [userId, loadCreatorStats],
  );

  const value = useMemo<AppState>(
    () => ({
      account,
      authReady,
      signOut: () => {
        void supabase.auth.signOut();
      },
      setAvatar: (avatarId, avatarImage) => {
        setAccount((prev) => (prev ? { ...prev, avatarId, avatarImage } : prev));
        if (userId) {
          void supabase
            .from("profiles")
            .update({ avatar_id: avatarId, avatar_image: avatarImage ?? null })
            .eq("id", userId);
        }
      },
      projects,
      addProject: (title) => {
        const optimistic: Project = {
          id: `p-${Date.now()}`,
          title,
          date: formatDate(new Date().toISOString()),
          emoji: "✨",
          hue: 292,
        };
        setProjects((prev) => [optimistic, ...prev]);
        if (userId) {
          void supabase
            .from("projects")
            .insert({ user_id: userId, title })
            .select("id, title, emoji, hue, created_at")
            .single()
            .then(({ data }) => {
              if (!data) return;
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === optimistic.id
                    ? { id: data.id, title: data.title, emoji: data.emoji, hue: data.hue, date: formatDate(data.created_at) }
                    : p,
                ),
              );
            });
        }
      },
      draft,
      setDraft,
      deductCoins,
      addCoins,
      unlockEpisode,
      isEpisodeUnlocked,
      refreshBalance,
      creatorStats,
      refreshCreatorStats,
      view,
      setView,
    }),
    [account, authReady, projects, draft, userId, deductCoins, addCoins, unlockEpisode, isEpisodeUnlocked, refreshBalance, creatorStats, refreshCreatorStats, view],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
