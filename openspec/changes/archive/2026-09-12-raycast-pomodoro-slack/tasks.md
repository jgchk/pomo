## 1. Extension scaffold

- [x] 1.1 Initialize Raycast extension project (`package.json`, `tsconfig.json`, `@raycast/api`/`@raycast/utils` dependencies, `.raycast` manifest fields)
- [x] 1.2 Define extension preferences: `workDurationMinutes` (default 25), `breakDurationMinutes` (default 5), `slackXoxcToken` (password), `slackXoxdCookie` (password)
- [x] 1.3 Register the menu bar command in `package.json` with a `background.interval` of 30 seconds

## 2. Phase state machine (`pomodoro-cycle`)

- [x] 2.1 Define the state shape: `{ phase, phaseStartedAt, lastInteractionAt, nominalNotificationFired, overtimeFallbackApplied }` and persist/load it via Raycast `LocalStorage`
- [x] 2.2 Implement transition functions for each manual action: start work, stop work, start break, stop break (auto-enters inbox-check), start next cycle, manual reset — each updates `phase`, resets `phaseStartedAt`/flags as appropriate, and stamps `lastInteractionAt`
- [x] 2.3 Implement derived-state helpers: elapsed time since `phaseStartedAt`, overtime amount (elapsed minus nominal duration), and "has nominal duration just been crossed" / "has break exceeded 5 minutes" predicates computed from current timestamps (no counters)
- [x] 2.4 Implement the no-interaction safety-net check: if `now - lastInteractionAt` exceeds ~3 hours while phase is not Idle, transition to Idle
- [x] 2.5 Emit phase-transition events (enter Work, enter Break, break-overtime-crossed, enter Inbox-check, enter Idle) that `slack-focus-sync` subscribes to, keeping the two capabilities decoupled per design.md

## 3. Menu bar UI

- [x] 3.1 Render current phase label and elapsed/overtime time in the `MenuBarExtra` title (no timer shown for Inbox-check, per spec)
- [x] 3.2 Render phase-appropriate action items: "Start Work" (Idle), "Stop Work" (Work), "Start Break" (Idle-break), "Stop Break" (Break), "Start Next Cycle" (Inbox-check)
- [x] 3.3 Render a "Reset" action available in any non-Idle phase, wired to the manual reset transition
- [x] 3.4 Render a Slack-error indicator in the menu bar icon/title when the last Slack call failed, cleared on the next successful call

## 4. Background refresh & one-shot triggers

- [x] 4.1 Wire the background refresh handler to run the derived-state checks each tick: nominal-duration crossing, break-overtime crossing, safety-net timeout
- [x] 4.2 Guard each one-shot side effect (notification, status fallback) with its persisted flag so it fires exactly once per phase activation, resilient to skipped/delayed ticks (e.g. after sleep/wake)

## 5. Notifications

- [x] 5.1 Fire a system notification with sound when the Work phase's nominal duration is first crossed
- [x] 5.2 Fire a system notification with sound when the Break phase's nominal duration is first crossed

## 6. Slack API client

- [x] 6.1 Implement a thin `fetch`-based Slack client that attaches the stored `xoxc`/`xoxd` preference values as auth on every request
- [x] 6.2 Implement `setDndSnooze(minutes)` / `endDndSnooze()` wrapping `dnd.setSnooze` / `dnd.endSnooze`
- [x] 6.3 Implement `setStatus(text)` / `clearStatus()` wrapping `users.profile.set`, always passing empty/no emoji field
- [x] 6.4 Surface and classify request failures (e.g. auth failure vs. network error) in a form the UI layer can turn into a toast + menu bar error indicator

## 7. Slack-focus-sync wiring

- [x] 7.1 On "enter Work" event: call `setDndSnooze`, compute `workStart + 30min`, call `setStatus("Checking Slack at {time}")`
- [x] 7.2 On "enter Break" event: call `setStatus("Checking Slack at {breakStart + 5min}")`, leaving DND untouched (already on)
- [x] 7.3 On "break-overtime-crossed" event (break active >5 min): call `setStatus("Checking Slack in a few minutes")`
- [x] 7.4 On "enter Inbox-check" and "enter Idle" events: call `endDndSnooze()` and `clearStatus()`
- [x] 7.5 On any Slack call failure from 7.1–7.4: show a Raycast toast describing the failure and set the menu bar error indicator (3.4), without altering or retrying the phase transition itself

## 8. Manual verification

- [x] 8.1 Walk the full cycle (start work → stop work → start break → let it run past 5 min unattended → stop break → start next cycle) in a real Raycast environment and confirm Slack DND/status match spec at each step
- [x] 8.2 Verify overtime display for both Work and Break, and that the one-time nominal-duration notification fires exactly once each
- [x] 8.3 Verify graceful degradation by supplying an invalid/expired token and confirming the timer keeps running while the menu bar shows the error state
- [x] 8.4 Verify the safety-net reset and manual reset both clear DND/status and return to Idle (manual reset live-tested; the ~3-hour no-interaction safety net was verified by code review of `checkSafetyNet` rather than a real-time wait, since waiting 3 hours live wasn't practical)
