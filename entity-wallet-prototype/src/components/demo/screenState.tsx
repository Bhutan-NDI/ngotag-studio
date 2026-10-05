"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useDemo } from "@/lib/demoStore";

/**
 * How a screen tells the harness which states it has.
 *
 * The state switcher is for review, not for the demo: you cannot review a
 * state you cannot see, and every screen in this build has a denied state, an
 * expired state and an empty state that nobody will ever reach by clicking
 * around. So each screen declares its states, and the switcher — which lives
 * in the harness bar, nowhere near the screen — offers them.
 *
 * The registry is deliberately NOT in `demoStore`. Which screen is mounted is
 * ephemeral and belongs to this render, whereas the store is persisted to
 * localStorage; putting it there would save a stale screen id to disk and
 * reload the switcher pointing at a screen that is no longer open. The chosen
 * override does live in the store, because "show me the denied state" is a
 * choice worth surviving a refresh.
 */
interface Registered {
  screen: string;
  /** Includes the screen's natural state first, by convention. */
  states: readonly string[];
}

interface RegistryValue {
  registered: Registered | null;
  register: (entry: Registered | null) => void;
}

const Registry = createContext<RegistryValue | null>(null);

export function ScreenStateProvider({ children }: { children: ReactNode }) {
  const [registered, setRegistered] = useState<Registered | null>(null);

  /* Identity-stable so a screen's effect does not re-run every render. */
  const register = useCallback((entry: Registered | null) => setRegistered(entry), []);

  const value = useMemo<RegistryValue>(() => ({ registered, register }), [registered, register]);

  return <Registry.Provider value={value}>{children}</Registry.Provider>;
}

/** What the harness bar reads to build the switcher. */
export function useScreenRegistry(): RegistryValue {
  const ctx = useContext(Registry);
  if (!ctx) throw new Error("useScreenRegistry must be used inside ScreenStateProvider");
  return ctx;
}

/**
 * Declare a screen's states and get the one to render.
 *
 * ```ts
 * const state = useScreenState("B4", ["reviewable", "out_of_scope", "parked", "accepted"]);
 * ```
 *
 * The first entry is the screen's natural state — what it shows when nobody
 * has overridden anything. Returning a plain string rather than a union keeps
 * this generic; the screen narrows it at the point of use, where the compiler
 * can still check the branches against its own list.
 */
export function useScreenState(screen: string, states: readonly string[]): string {
  const { harness } = useDemo();
  const { register } = useScreenRegistry();

  /* Joined into a primitive so the effect compares by value: a fresh array
     literal on every render would otherwise re-register endlessly. */
  const key = states.join("|");

  useEffect(() => {
    register({ screen, states: key.split("|") });
    return () => register(null);
  }, [screen, key, register]);

  const override = harness.stateOverrides[screen];
  return override && states.includes(override) ? override : states[0];
}
