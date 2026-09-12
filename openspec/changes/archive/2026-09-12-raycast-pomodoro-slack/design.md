## Context

Greenfield Raycast extension (TypeScript, `@raycast/api`, React for the menu bar UI). See proposal.md for motivation. Two capabilities: `pomodoro-cycle` (phase state machine) and `slack-focus-sync` (Slack side effects driven by phase transitions). No existing code or specs to integrate with.

Two Raycast platform constraints shape the approach:
- `MenuBarExtra` supports a manifest-level background `interval` for refresh, with a documented minimum of 10 seconds; actual firing is scheduled by macOS for energy efficiency and is not exact-to-the-second.
- The Slack auth token is a self-extracted browser session pair (`xoxc`/`xoxd`), not an OAuth app token — it can expire/rotate without warning, and there is no consent/approval flow to fall back on if it fails.

## Goals / Non-Goals

**Goals:**
- Single source of truth for phase + timestamps that survives Raycast/Node process restarts (menu bar commands are not guaranteed to stay resident).
- Clean separation between the phase state machine and Slack side effects, so Slack failures never corrupt or block phase transitions.
- Treat the stored Slack credential as an opaque value so a future move to an OAuth-installed app token is a preferences change, not a rework.

**Non-Goals:**
- Building any UI or logic for managing multiple Slack workspaces/accounts.
- Building a token-type abstraction (e.g. "session token vs OAuth token" branching logic) now — only one auth path is implemented, just without foreclosing a later swap.
- Optimizing background-refresh timing precision beyond what Raycast's `interval` API provides.

## Decisions

**State storage: timestamps, not counters, in Raycast `LocalStorage`.**
Store `{ phase, phaseStartedAt, lastInteractionAt, workDurationMs, breakDurationMs }` as a single JSON blob in `LocalStorage`. Elapsed/overtime and "should the safety net fire" are always derived by comparing `Date.now()` to the stored timestamps on each render/refresh, rather than incrementing a counter. This makes the state correct after a sleep/wake cycle, a Raycast restart, or a delayed background tick — a counter-based approach would drift or require its own catch-up logic.
- Alternative considered: an in-memory counter driven by `setInterval`. Rejected — menu bar command processes are not guaranteed to stay alive, and this doesn't survive Raycast restarts.

**Background refresh interval: 30 seconds.**
Used for the `MenuBarExtra` manifest `interval`, comfortably above Raycast's 10s floor, to check: (a) has Break exceeded 5 minutes → apply status fallback, (b) has the nominal duration just been crossed → fire the one-time notification, (c) has 3 hours of no interaction elapsed → safety-net reset. 30s bounds the worst-case delay on any of these to something a user won't perceive as broken, without polling aggressively enough to matter for battery.
- Alternative considered: 10s (the minimum). Rejected as unnecessary precision for minute-granularity events.

**One-shot notification/status-transition tracking via stored flags.**
Because the background tick is time-based re-evaluation (not an event stream), each one-time side effect (nominal-duration notification, break-overtime status fallback) needs an idempotency guard so it isn't re-fired every 30s once its condition stays true. Store boolean flags (`nominalNotificationFired`, `overtimeFallbackApplied`) alongside phase state, reset on every phase transition.
- Alternative considered: derive "already fired" purely from elapsed time crossing a threshold without a flag. Rejected — re-evaluation on every tick would either re-fire repeatedly or require fragile "was it *just* crossed this tick" windowing that breaks if a tick is skipped (e.g. laptop sleep).

**Slack side effects as phase-transition subscribers, not inline in the state machine.**
The `pomodoro-cycle` state machine only manages `{phase, timestamps, flags}` and exposes the current phase plus transition events. A separate `slack-focus-sync` module reacts to transition events (enter Work, enter Break, break-overtime tick, enter Inbox-check/Idle) and makes the corresponding Slack calls, catching and reporting its own errors. This keeps the spec-level separation (proposal's two capabilities) real in code, and guarantees a Slack failure can't leave the phase state machine stuck.
- Alternative considered: call Slack directly inside phase-transition handlers in one module. Rejected — harder to guarantee error isolation, and blurs the two capabilities' boundary.

**Slack credential storage: opaque preference strings.**
Store `slackXoxcToken` and `slackXoxdCookie` as two password-type Raycast preferences, read by a thin Slack client wrapper that only knows "send these as auth on every request." No token-type discriminant or branching is introduced. If an OAuth token becomes available later, swapping to it is a matter of changing what's stored in preferences and how the wrapper attaches auth (e.g. bearer header vs cookie), not a redesign of `slack-focus-sync`'s call sites.

**Slack API access via direct `fetch`, no SDK dependency.**
The two calls needed (`dnd.setSnooze`/`dnd.endSnooze`, `users.profile.set`) plus the reversed cookie-based session auth are simple enough that pulling in `@slack/web-api` (built around bot/OAuth tokens) would add more friction than it saves for this auth style. A small typed wrapper around `fetch` is used instead.

## Risks / Trade-offs

- **[Risk]** The `xoxc`/`xoxd` session token can expire or rotate without warning, since it's not an official long-lived credential. → **Mitigation**: graceful degradation is a hard spec requirement (`slack-focus-sync` "Graceful degradation on Slack API failure"); menu bar error indicator + toast tells the user to re-extract and re-paste, and the timer keeps working regardless.
- **[Risk]** Background refresh timing is not exact (macOS-scheduled, can be delayed further on battery). → **Mitigation**: 30s interval keeps worst-case delay small relative to minute-granularity thresholds; nothing in the spec requires sub-30s precision.
- **[Risk]** If Raycast's background refresh does not fire while the Mac is asleep, "elapsed time" could jump by hours in one tick (e.g. after waking from sleep). → **Mitigation**: this is exactly the case the no-interaction safety net exists for — a large elapsed-time jump on wake will correctly trigger the safety-net reset rather than silently missing the break-overtime or notification transitions.
- **[Trade-off]** Storing raw session-token-style credentials in Raycast preferences means they're only as protected as Raycast's preference storage; this is accepted as inherent to the chosen auth path (see proposal — no installed-app alternative is available today).

## Migration Plan

New project; no prior version to migrate from or roll back to. Initial release is installed manually via `ray develop`/local extension load per Raycast's standard extension workflow.
