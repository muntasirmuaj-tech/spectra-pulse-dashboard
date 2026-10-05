import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Account, Conversation, ScheduledPost, Platform } from "./social-data";
import { loadWorkspaceFromApi, pulsePersistenceMode, saveWorkspaceToApi } from "./pulse-api";

const STORAGE_KEY = "pulse:v1";
const DEMO_IDS = new Set(["fb-1", "ig-1", "wa-1", "tt-1", "c1", "c2", "c3", "c4", "c5", "c6", "p1", "p2", "p3", "p4", "p5"]);

export type PulseState = {
  accounts: Account[];
  conversations: Conversation[];
  scheduledPosts: ScheduledPost[];
};

type PulseContextValue = PulseState & {
  hydrated: boolean;
  workspaceReady: boolean;
  syncError: string | null;
  retrySync: () => void;
  activeAccountId: string;
  setActiveAccountId: (id: string) => void;
  addAccount: (input: Omit<Account, "id" | "connected"> & { connected?: boolean }) => Account;
  toggleAccount: (id: string) => void;
  removeAccount: (id: string) => void;
  addScheduledPost: (post: Omit<ScheduledPost, "id">) => ScheduledPost;
  addReply: (conversationId: string, body: string) => void;
  markConversationRead: (conversationId: string) => void;
  removeScheduledPost: (id: string) => void;
};

// Never present sample records as live customer data in a new workspace.
const seedState: PulseState = { accounts: [], conversations: [], scheduledPosts: [] };

function isPulseState(value: unknown): value is PulseState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PulseState>;
  const platforms = ["facebook", "instagram", "whatsapp", "tiktok"];
  const accountsValid = Array.isArray(candidate.accounts) && candidate.accounts.every((account) =>
    !!account && typeof account.id === "string" && platforms.includes(account.platform) &&
    typeof account.name === "string" && typeof account.handle === "string" &&
    typeof account.connected === "boolean" && Number.isFinite(account.followers),
  );
  const conversationsValid = Array.isArray(candidate.conversations) && candidate.conversations.every((conversation) =>
    !!conversation && typeof conversation.id === "string" && platforms.includes(conversation.platform) &&
    typeof conversation.accountId === "string" && typeof conversation.person === "string" &&
    typeof conversation.preview === "string" && typeof conversation.time === "string" &&
    typeof conversation.unread === "boolean" && Array.isArray(conversation.messages) &&
    conversation.messages.every((message) => !!message && ["them", "us"].includes(message.from) &&
      typeof message.body === "string" && typeof message.time === "string"),
  );
  const postsValid = Array.isArray(candidate.scheduledPosts) && candidate.scheduledPosts.every((post) =>
    !!post && typeof post.id === "string" && Array.isArray(post.platforms) &&
    post.platforms.every((platform) => platforms.includes(platform)) && Array.isArray(post.accountIds) &&
    post.accountIds.every((id) => typeof id === "string") && typeof post.body === "string" &&
    typeof post.date === "string" && typeof post.time === "string" &&
    ["scheduled", "draft", "published"].includes(post.status),
  );
  return accountsValid && conversationsValid && postsValid;
}

function readStored(): PulseState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPulseState(parsed)) return null;
    const demoAccountIds = new Set(["fb-1", "ig-1", "wa-1", "tt-1"]);
    return {
      accounts: parsed.accounts.filter((account) => !DEMO_IDS.has(account.id)),
      conversations: parsed.conversations.filter((conversation) => !DEMO_IDS.has(conversation.id) && !demoAccountIds.has(conversation.accountId)),
      scheduledPosts: parsed.scheduledPosts.filter((post) => !DEMO_IDS.has(post.id)),
    };
  } catch {
    return null;
  }
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const PulseContext = createContext<PulseContextValue | null>(null);

export function PulseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PulseState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState("all");
  const lastSavedSnapshot = useRef("");

  useEffect(() => {
    if (pulsePersistenceMode === "api") {
      void loadWorkspaceFromApi().then((remote) => {
        if (!isPulseState(remote)) throw new Error("The workspace API returned invalid data.");
        setState(remote);
        lastSavedSnapshot.current = JSON.stringify(remote);
        setCanPersist(true);
        setHydrated(true);
      }).catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : "Unable to load your workspace.");
        setHydrated(true);
      });
      return;
    }

    const stored = readStored();
    const initialState = stored ?? seedState;
    if (stored) setState(stored);
    lastSavedSnapshot.current = JSON.stringify(initialState);
    setCanPersist(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && canPersist) {
      if (pulsePersistenceMode === "api") {
        const snapshot = JSON.stringify(state);
        if (snapshot === lastSavedSnapshot.current) return;
        void saveWorkspaceToApi(state).then(() => {
          lastSavedSnapshot.current = snapshot;
          setSyncError(null);
        }).catch((error: unknown) => {
          setSyncError(error instanceof Error ? error.message : "Unable to save your workspace.");
        });
        return;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSyncError(null);
      } catch (error) {
        console.error("Pulse could not save this workspace in browser storage.", error);
        setSyncError("Your browser could not save this workspace. Check available storage and try again.");
      }
    }
  }, [state, hydrated, canPersist]);

  function retrySync() {
    if (pulsePersistenceMode === "api" && !canPersist) {
      setHydrated(false);
      setSyncError(null);
      void loadWorkspaceFromApi().then((remote) => {
        if (!isPulseState(remote)) throw new Error("The workspace API returned invalid data.");
        setState(remote);
        lastSavedSnapshot.current = JSON.stringify(remote);
        setCanPersist(true);
        setHydrated(true);
      }).catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : "Unable to load your workspace.");
        setHydrated(true);
      });
      return;
    }
    if (pulsePersistenceMode === "api") {
      setSyncError(null);
      void saveWorkspaceToApi(state).then(() => {
        lastSavedSnapshot.current = JSON.stringify(state);
      }).catch((error: unknown) => setSyncError(error instanceof Error ? error.message : "Unable to save your workspace."));
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSyncError(null);
    } catch {
      setSyncError("Your browser could not save this workspace. Check available storage and try again.");
    }
  }

  const value = useMemo<PulseContextValue>(() => ({
    ...state,
    hydrated,
    workspaceReady: pulsePersistenceMode === "browser" || canPersist,
    syncError,
    retrySync,
    activeAccountId,
    setActiveAccountId,
    addAccount: (input) => {
      const account: Account = {
        ...input,
        id: makeId(input.platform),
        connected: input.connected ?? false,
      };
      setState((current) => ({ ...current, accounts: [...current.accounts, account] }));
      return account;
    },
    toggleAccount: (id) => setState((current) => ({
      ...current,
      accounts: current.accounts.map((account) =>
        account.id === id ? { ...account, connected: !account.connected } : account,
      ),
    })),
    markConversationRead: (conversationId) => setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: false } : conversation,
      ),
    })),
    removeScheduledPost: (id) => setState((current) => ({
      ...current,
      scheduledPosts: current.scheduledPosts.filter((post) => post.id !== id),
    })),
    removeAccount: (id) => setState((current) => ({
      accounts: current.accounts.filter((account) => account.id !== id),
      conversations: current.conversations.filter((conversation) => conversation.accountId !== id),
      scheduledPosts: current.scheduledPosts.filter((post) => !post.accountIds.includes(id)),
    })),
    addScheduledPost: (post) => {
      const created: ScheduledPost = { ...post, id: makeId("post") };
      setState((current) => ({ ...current, scheduledPosts: [created, ...current.scheduledPosts] }));
      return created;
    },
    addReply: (conversationId, body) => setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id !== conversationId
          ? conversation
          : {
              ...conversation,
              preview: body,
              unread: false,
              time: "now",
              messages: [...conversation.messages, { from: "us", body, time: "now" }],
            },
      ),
    })),
  }), [state, hydrated, canPersist, activeAccountId, syncError, retrySync]);

  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>;
}

export function usePulse() {
  const context = useContext(PulseContext);
  if (!context) throw new Error("usePulse must be used inside PulseProvider");
  return context;
}

export function accountIdsForPlatform(accounts: Account[], platform: Platform) {
  return accounts.filter((account) => account.platform === platform).map((account) => account.id);
}
