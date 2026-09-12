import { useEffect, useState } from "react";
import { Icon, MenuBarExtra } from "@raycast/api";
import { getResolvedPreferences } from "./preferences";
import {
  checkSafetyNet,
  getElapsedMs,
  getOvertimeMs,
  hasBreakExceeded,
  hasNominalDurationCrossed,
  loadState,
  markNominalNotificationFired,
  markOvertimeFallbackApplied,
  resetToIdle,
  saveState,
  startBreak,
  startNextCycle,
  startWork,
  stopBreak,
  TransitionResult,
} from "./state";
import { fireNotification } from "./notify";
import { getLastSlackError } from "./slackErrorStore";
import { handlePhaseEvent } from "./slackFocusSync";
import { formatTimerLabel } from "./timerDisplay";
import { Phase, PomodoroState } from "./types";

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "idle":
      return "Idle";
    case "work":
      return "Work";
    case "break":
      return "Break";
    case "inbox-check":
      return "Checking Inboxes";
  }
}

async function runOneShotChecks(initial: PomodoroState): Promise<PomodoroState> {
  const prefs = getResolvedPreferences();
  let current = initial;

  const safetyNet = checkSafetyNet(current);
  if (safetyNet.state !== current) {
    current = safetyNet.state;
    await saveState(current);
    for (const event of safetyNet.events) {
      await handlePhaseEvent(event);
    }
  }

  if (current.phase === "work" || current.phase === "break") {
    const nominalDurationMs = current.phase === "work" ? prefs.workDurationMs : prefs.breakDurationMs;
    if (!current.nominalNotificationFired && hasNominalDurationCrossed(current, nominalDurationMs)) {
      current = markNominalNotificationFired(current);
      await saveState(current);
      fireNotification(
        current.phase === "work" ? "Work block finished, time to take a break" : "Break block finished, time to work",
      );
    }
  }

  if (
    current.phase === "break" &&
    !current.overtimeFallbackApplied &&
    hasBreakExceeded(current, prefs.breakDurationMs)
  ) {
    current = markOvertimeFallbackApplied(current);
    await saveState(current);
    await handlePhaseEvent({ type: "break-overtime-crossed" });
  }

  return current;
}

async function applyTransition(
  transition: (state: PomodoroState, now?: number) => TransitionResult,
): Promise<PomodoroState> {
  const current = await loadState();
  const result = transition(current);
  await saveState(result.state);
  for (const event of result.events) {
    await handlePhaseEvent(event);
  }
  return result.state;
}

export default function Command() {
  const [state, setState] = useState<PomodoroState | null>(null);
  const [slackError, setSlackError] = useState<string | undefined>(undefined);
  const prefs = getResolvedPreferences();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadState();
      const checked = await runOneShotChecks(loaded);
      const error = await getLastSlackError();
      if (!cancelled) {
        setState(checked);
        setSlackError(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAction(transition: (state: PomodoroState, now?: number) => TransitionResult) {
    const next = await applyTransition(transition);
    const error = await getLastSlackError();
    setState(next);
    setSlackError(error);
  }

  if (!state) {
    return <MenuBarExtra isLoading icon={Icon.Clock} />;
  }

  const isTimedPhase = state.phase === "work" || state.phase === "break";
  const nominalDurationMs = state.phase === "work" ? prefs.workDurationMs : prefs.breakDurationMs;
  const elapsedMs = getElapsedMs(state);
  const overtimeMs = getOvertimeMs(state, nominalDurationMs);

  let title = phaseLabel(state.phase);
  if (isTimedPhase) {
    title += ` ${formatTimerLabel(elapsedMs, overtimeMs, nominalDurationMs)}`;
  }

  const icon = slackError ? Icon.ExclamationMark : Icon.Circle;

  return (
    <MenuBarExtra icon={icon} title={title}>
      {slackError && <MenuBarExtra.Item title={`Slack error: ${slackError}`} />}
      {state.phase === "idle" && <MenuBarExtra.Item title="Start Work" onAction={() => handleAction(startWork)} />}
      {state.phase === "work" && <MenuBarExtra.Item title="Start Break" onAction={() => handleAction(startBreak)} />}
      {state.phase === "break" && <MenuBarExtra.Item title="Stop Break" onAction={() => handleAction(stopBreak)} />}
      {state.phase === "inbox-check" && (
        <MenuBarExtra.Item title="Start Work" onAction={() => handleAction(startNextCycle)} />
      )}
      {state.phase !== "idle" && <MenuBarExtra.Item title="Reset" onAction={() => handleAction(resetToIdle)} />}
    </MenuBarExtra>
  );
}
