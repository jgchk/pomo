## Why

Switching between focused work and breaks currently requires manually remembering to toggle Slack's Do Not Disturb and status, and there's no lightweight, always-visible way to run a manual (non-auto-advancing) Pomodoro cycle from the menu bar. This change builds a Raycast extension that runs the Pomodoro cycle and keeps Slack in sync with it, without requiring an IT-approved Slack app install.

## What Changes

- New Raycast menu bar extension (TypeScript, `@raycast/api`) implementing a 4-phase manual Pomodoro cycle: Idle → Work → Idle-break → Break → Inbox-check → back to Work.
- Work and Break phases count up past their nominal duration (overtime) instead of auto-stopping; a system notification + sound fires once at the nominal 25/5 min mark as a reminder only.
- Starting Work sets Slack DND on and a status ("Checking Slack at {start+30min}"); starting Break re-estimates that status to "Checking Slack at {break_start+5min}"; if Break runs past 5 minutes unstopped, a background refresh updates the status to "Checking Slack in a few minutes". Status text is plain, with no phase-identifying emoji, so external viewers can't tell work from break.
- Stopping Break automatically clears Slack DND/status and enters an untimed Inbox-check phase (the only automatic transition in the cycle); manually starting the next cycle ends Inbox-check and starts the next Work phase in one action.
- Slack API access uses a user-supplied session token pair (xoxc/xoxd) stored in extension preferences, calling `dnd.setSnooze`/`dnd.endSnooze` and `users.profile.set` directly — no Slack app installation required. Slack call failures degrade gracefully (menu bar error indicator + toast) without affecting local timer state.
- A ~3 hour no-interaction safety net auto-resets to Idle and clears Slack DND/status; a manual reset/cancel action is available at any time and clears DND/status immediately if fired mid-Work or mid-Break.
- Work/Break durations are configurable via extension preferences, defaulting to 25/5 minutes.
- Out of scope: history/stats tracking, real GTD inbox management, OAuth/installed-app auth, pause-and-resume of a phase.

## Capabilities

### New Capabilities
- `pomodoro-cycle`: The phase state machine (Idle, Work, Idle-break, Break, Inbox-check), manual transitions, overtime counting, nominal-duration notifications, the 3-hour safety-net auto-reset, and the manual reset/cancel escape hatch. Configurable durations.
- `slack-focus-sync`: Slack DND and status synchronization driven by the pomodoro cycle's phase transitions — including the initial 30-min estimate, the break re-estimate, the over-time fallback text, and the automatic clear on entering Inbox-check. Session-token (xoxc/xoxd) auth storage and graceful degradation/error surfacing on Slack API failure.

### Modified Capabilities
(none — greenfield project, no existing specs)

## Impact

- New Raycast extension package (TypeScript/React, `@raycast/api`, `package.json`, `src/`).
- New dependency: Slack Web API calls via `fetch` (no official Slack SDK required, but may use `@slack/web-api` for convenience).
- New Raycast preferences: work duration, break duration, Slack `xoxc` token, Slack `xoxd` cookie.
- No existing systems affected (new project).
