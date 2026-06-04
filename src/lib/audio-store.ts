// Tiny global audio store: master volume + mute, persisted to localStorage.
// Components subscribe to react to changes without prop drilling.

export type AudioState = { master: number; muted: boolean };

const KEY = "aeterna.audio";

function load(): AudioState {
  if (typeof window === "undefined") return { master: 0.7, muted: false };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { master: 0.7, muted: false, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { master: 0.7, muted: false };
}

let state: AudioState = load();
const listeners = new Set<(s: AudioState) => void>();

export function getAudio(): AudioState {
  return state;
}

export function setAudio(patch: Partial<AudioState>) {
  state = { ...state, ...patch };
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l(state));
}

export function subscribeAudio(l: (s: AudioState) => void): () => void {
  listeners.add(l);
  l(state);
  return () => { listeners.delete(l); };
}

/** Effective playback volume taking mute into account. */
export function effectiveVolume(): number {
  return state.muted ? 0 : state.master;
}

// --- Autoplay unlock ----------------------------------------------------
// Browsers block audio playback until the user makes a gesture. We track
// the unlocked state and run callbacks after the first interaction so
// ambient loops, footsteps, and positional sounds can start automatically.
let unlocked = false;
const unlockCallbacks = new Set<() => void>();

function fireUnlock() {
  if (unlocked) return;
  unlocked = true;
  unlockCallbacks.forEach((cb) => {
    try { cb(); } catch { /* ignore */ }
  });
  unlockCallbacks.clear();
}

if (typeof window !== "undefined") {
  const events = ["pointerdown", "touchstart", "keydown", "click"] as const;
  const handler = () => {
    fireUnlock();
    events.forEach((e) => window.removeEventListener(e, handler));
  };
  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
}

/** Run `cb` once the user has interacted with the page (or immediately if already unlocked). */
export function onAudioUnlock(cb: () => void): () => void {
  if (unlocked) { cb(); return () => {}; }
  unlockCallbacks.add(cb);
  return () => { unlockCallbacks.delete(cb); };
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/** Manually mark audio as unlocked (e.g., from a Volume button click). */
export function markAudioUnlocked() {
  fireUnlock();
}
