import type { PulseState } from "./pulse-store";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");
const configuredPersistenceMode = import.meta.env.VITE_PERSISTENCE_MODE?.trim().toLowerCase();

export const pulsePersistenceMode =
  configuredPersistenceMode === "api" || (configuredPersistenceMode !== "browser" && configuredApiUrl)
    ? "api"
    : "browser";

function endpoint() {
  return `${configuredApiUrl ?? ""}/api/v1/workspace`;
}

async function requestWorkspace(method: "GET" | "PUT", state?: PulseState): Promise<PulseState> {
  const response = await fetch(endpoint(), {
    method,
    credentials: "include",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/json",
      ...(state ? { "Content-Type": "application/json" } : {}),
    },
    ...(state ? { body: JSON.stringify(state) } : {}),
  });

  if (!response.ok) {
    throw new Error(`Workspace API request failed (${response.status}).`);
  }

  if (response.status === 204) return state ?? { accounts: [], conversations: [], scheduledPosts: [] };
  return (await response.json()) as PulseState;
}

export function loadWorkspaceFromApi() {
  return requestWorkspace("GET");
}

let saveQueue = Promise.resolve();

export function saveWorkspaceToApi(state: PulseState) {
  const nextSave = saveQueue.catch(() => undefined).then(() => requestWorkspace("PUT", state));
  saveQueue = nextSave.then(() => undefined, () => undefined);
  return nextSave;
}
