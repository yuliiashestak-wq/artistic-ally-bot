import {
  createContext,
  useContext,
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

  // Restore session on load and keep in sync with sign-in/sign-out events.
  useEffect(() => {
    let cancelled = false;

    async function loadForUser(uid: string, email: string) {
      const [{ data: profile }, { data: rows }] = await Promise.all([
        supabase.from("profiles").select("username, avatar_id, avatar_image, tokens").eq("id", uid).maybeSingle(),
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
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

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
    }),
    [account, authReady, projects, draft, userId],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
