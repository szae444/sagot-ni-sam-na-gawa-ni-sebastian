"use client";

import { useSyncExternalStore } from "react";

export type Status = "mastered" | "review";

export interface ProgressState {
  status: Record<string, Status>;
  bookmarks: Record<string, true>;
  notes: Record<string, string>;
  /** Leitner box per flashcard, 0 = new */
  boxes: Record<string, number>;
  quizBest: number | null;
  mockHistory: { date: string; exam: string; score: number; total: number }[];
  lastVisited: string | null;
}

const KEY = "sagot-ni-sam:v1";

const empty: ProgressState = {
  status: {},
  bookmarks: {},
  notes: {},
  boxes: {},
  quizBest: null,
  mockHistory: [],
  lastVisited: null,
};

let state: ProgressState = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — keep defaults */
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function update(fn: (s: ProgressState) => ProgressState) {
  load();
  state = fn(state);
  save();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}

// ── helpers ──
export const setStatus = (id: string, s: Status | null) =>
  update((p) => {
    const status = { ...p.status };
    if (s === null || status[id] === s) delete status[id];
    else status[id] = s;
    return { ...p, status };
  });

export const toggleBookmark = (id: string) =>
  update((p) => {
    const bookmarks = { ...p.bookmarks };
    if (bookmarks[id]) delete bookmarks[id];
    else bookmarks[id] = true;
    return { ...p, bookmarks };
  });

export const setNote = (id: string, text: string) =>
  update((p) => {
    const notes = { ...p.notes };
    if (text.trim()) notes[id] = text;
    else delete notes[id];
    return { ...p, notes };
  });

export const setVisited = (id: string) =>
  update((p) => (p.lastVisited === id ? p : { ...p, lastVisited: id }));

export const resetAll = () => update(() => empty);
