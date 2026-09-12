## Why

Live manual testing of the Pomodoro/Slack-sync extension surfaced several friction points: the Slack status doesn't say why you're unreachable, starting a break takes two clicks instead of one, notification copy reads like release notes instead of a nudge, and the menu bar timer only appears to move when clicked because Raycast can't tick it live every second. This change addresses all of it based on that testing feedback.

## What Changes

- Slack status text gets a "Focused. " prefix on every status the extension sets (work start, break start, and the break-overtime fallback), so it reads "Focused. Checking Slack at {time}" / "Focused. Checking Slack in a few minutes".
- Slack status emoji is set to `:orangutan:` on those same status-setting calls, cleared back to none when status is cleared (inbox-check/idle) — matching today's clear behavior.
- **BREAKING**: The `Idle-break` phase is removed from the pomodoro state machine. Stopping work now transitions directly into Break via a single action, rather than requiring a separate "stop work" step followed by "start break". Manual reset from Work remains the only way to stop without taking a break.
- Menu bar action labels change: Work's action becomes "Start Break" (was "Stop Work"); Inbox-check's action becomes "Start Work" (was "Start Next Cycle"). Break's "Stop Break" action is unchanged.
- Nominal-duration notifications are reworded to be casual, title-only, with no message body: "Work block finished, time to take a break" and "Break block finished, time to work" (replacing the current title+message pairs).
- The menu bar timer display drops second-level resolution and shows minutes only (e.g. "Work 12" instead of "Work 12:34"), since Raycast's background refresh can't tick smoothly every second anyway. The command's manifest `interval` is shortened from `30s` to `10s` (the practical floor for Raycast background refresh) so the displayed minute stays reasonably fresh at phase boundaries.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `pomodoro-cycle`: phase state machine loses the `Idle-break` phase and its associated transitions; a new direct Work→Break transition replaces the old two-step stop/start; nominal-duration notification wording changes; timer display resolution changes to minute-level.
- `slack-focus-sync`: status text template gains a "Focused. " prefix (and the existing "does not reveal phase" requirement is preserved by applying it uniformly); status emoji requirement added (`:orangutan:`, uniformly applied and cleared).

## Impact

- Affected code: `src/types.ts` (`Phase` type), `src/state.ts` (remove `stopWork`, add direct work→break transition), `src/pomodoro-menu-bar.tsx` (menu labels, timer formatting), `src/slackFocusSync.ts` (status text template, emoji), `src/slackClient.ts` (`setStatus` needs an emoji parameter), `src/notify.ts` callers (notification title/message), `package.json` (command `interval`).
- No new dependencies. No changes to Slack auth/token handling or DND behavior.
