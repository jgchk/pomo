import { LocalStorage } from "@raycast/api";
import { Phase, PhaseEvent, PomodoroState } from "./types";

const STORAGE_KEY = "pomodoro-state";
const SAFETY_NET_MS = 3 * 60 * 60 * 1000;

export interface TransitionResult {
  state: PomodoroState;
  events: PhaseEvent[];
}

function defaultState(now: number): PomodoroState {
  return {
    phase: "idle",
    phaseStartedAt: now,
    lastInteractionAt: now,
    nominalNotificationFired: false,
    overtimeFallbackApplied: false,
  };
}

export async function loadState(): Promise<PomodoroState> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return defaultState(Date.now());
  try {
    const parsed = JSON.parse(raw) as PomodoroState;
    if (!parsed || typeof parsed.phase !== "string") return defaultState(Date.now());
    if ((parsed.phase as string) === "idle-break") return { ...parsed, phase: "idle" };
    return parsed;
  } catch {
    return defaultState(Date.now());
  }
}

export async function saveState(state: PomodoroState): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function enterPhase(phase: Phase, now: number): PomodoroState {
  return {
    phase,
    phaseStartedAt: now,
    lastInteractionAt: now,
    nominalNotificationFired: false,
    overtimeFallbackApplied: false,
  };
}

function noop(state: PomodoroState): TransitionResult {
  return { state, events: [] };
}

export function startWork(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase !== "idle") return noop(state);
  return { state: enterPhase("work", now), events: [{ type: "enter-work", workStartedAt: now }] };
}

export function startBreak(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase !== "work") return noop(state);
  return { state: enterPhase("break", now), events: [{ type: "enter-break", breakStartedAt: now }] };
}

export function stopBreak(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase !== "break") return noop(state);
  return { state: enterPhase("inbox-check", now), events: [{ type: "enter-inbox-check" }] };
}

export function startNextCycle(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase !== "inbox-check") return noop(state);
  return { state: enterPhase("work", now), events: [{ type: "enter-work", workStartedAt: now }] };
}

export function resetToIdle(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase === "idle") return noop(state);
  return { state: enterPhase("idle", now), events: [{ type: "enter-idle" }] };
}

export function checkSafetyNet(state: PomodoroState, now: number = Date.now()): TransitionResult {
  if (state.phase === "idle") return noop(state);
  if (now - state.lastInteractionAt < SAFETY_NET_MS) return noop(state);
  return resetToIdle(state, now);
}

export function getElapsedMs(state: PomodoroState, now: number = Date.now()): number {
  return Math.max(0, now - state.phaseStartedAt);
}

export function getOvertimeMs(state: PomodoroState, nominalDurationMs: number, now: number = Date.now()): number {
  return Math.max(0, getElapsedMs(state, now) - nominalDurationMs);
}

export function hasNominalDurationCrossed(
  state: PomodoroState,
  nominalDurationMs: number,
  now: number = Date.now(),
): boolean {
  return getElapsedMs(state, now) >= nominalDurationMs;
}

export function hasBreakExceeded(state: PomodoroState, breakDurationMs: number, now: number = Date.now()): boolean {
  return state.phase === "break" && getElapsedMs(state, now) > breakDurationMs;
}

export function markNominalNotificationFired(state: PomodoroState): PomodoroState {
  return { ...state, nominalNotificationFired: true };
}

export function markOvertimeFallbackApplied(state: PomodoroState): PomodoroState {
  return { ...state, overtimeFallbackApplied: true };
}
