import { showToast, Toast } from "@raycast/api";
import { getResolvedPreferences } from "./preferences";
import { clearStatus, endDndSnooze, setDndSnooze, setStatus, SlackAuth, SlackResult } from "./slackClient";
import { clearLastSlackError, setLastSlackError } from "./slackErrorStore";
import { PhaseEvent } from "./types";

// Covers the full work+break span even under heavy overtime; the explicit
// endDndSnooze() call on entering inbox-check/idle is what actually clears DND
// in the normal case, so this is only a backstop ceiling.
const DND_SNOOZE_MINUTES = 180;
const FOCUS_EMOJI = ":orangutan:";

function formatEstimate(targetMs: number): string {
  const time = new Date(targetMs).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Focused. Checking Slack at ${time}`;
}

async function report(result: SlackResult<unknown>, actionLabel: string): Promise<void> {
  if (result.ok) {
    await clearLastSlackError();
    return;
  }
  await setLastSlackError(result.error.message);
  await showToast({
    style: Toast.Style.Failure,
    title: `Slack ${actionLabel} failed`,
    message: result.error.message,
  });
}

export async function handlePhaseEvent(event: PhaseEvent): Promise<void> {
  const prefs = getResolvedPreferences();
  const auth: SlackAuth = { xoxcToken: prefs.slackXoxcToken, xoxdCookie: prefs.slackXoxdCookie };

  switch (event.type) {
    case "enter-work": {
      await report(await setDndSnooze(auth, DND_SNOOZE_MINUTES), "DND enable");
      const estimate = event.workStartedAt + prefs.workDurationMs + prefs.breakDurationMs;
      await report(await setStatus(auth, formatEstimate(estimate), FOCUS_EMOJI), "status update");
      break;
    }
    case "enter-break": {
      const estimate = event.breakStartedAt + prefs.breakDurationMs;
      await report(await setStatus(auth, formatEstimate(estimate), FOCUS_EMOJI), "status update");
      break;
    }
    case "break-overtime-crossed": {
      await report(await setStatus(auth, "Focused. Checking Slack in a few minutes", FOCUS_EMOJI), "status update");
      break;
    }
    case "enter-inbox-check":
    case "enter-idle": {
      await report(await endDndSnooze(auth), "DND disable");
      await report(await clearStatus(auth), "status clear");
      break;
    }
  }
}
