import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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
  signIn: (account: Account) => void;
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [draft, setDraft] = useState("");

  const value = useMemo<AppState>(
    () => ({
      account,
      signIn: (next) => setAccount(next),
      signOut: () => setAccount(null),
      setAvatar: (avatarId, avatarImage) =>
        setAccount((prev) => (prev ? { ...prev, avatarId, avatarImage } : prev)),
      projects,
      addProject: (title) =>
        setProjects((prev) => [
          {
            id: `p-${Date.now()}`,
            title,
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            emoji: "✨",
            hue: 292,
          },
          ...prev,
        ]),
      draft,
      setDraft,
    }),
    [account, projects, draft],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
