export type Phase = "idle" | "work" | "break" | "inbox-check";

export interface PomodoroState {
  phase: Phase;
  phaseStartedAt: number;
  lastInteractionAt: number;
  nominalNotificationFired: boolean;
  overtimeFallbackApplied: boolean;
}

export type PhaseEvent =
  | { type: "enter-work"; workStartedAt: number }
  | { type: "enter-break"; breakStartedAt: number }
  | { type: "break-overtime-crossed" }
  | { type: "enter-inbox-check" }
  | { type: "enter-idle" };
