## Context

See `proposal.md` for motivation. This touches the phase state machine (`src/state.ts`, `src/types.ts`), the Slack sync layer (`src/slackClient.ts`, `src/slackFocusSync.ts`), the menu bar UI (`src/pomodoro-menu-bar.tsx`), and the manifest (`package.json`). The one piece of real technical ambiguity is what happens to already-persisted `LocalStorage` state (`phase: "idle-break"`) across the update, since that phase is being removed from the type.

## Goals / Non-Goals

**Goals:**
- Remove `idle-break` from the phase state machine cleanly, including a safe path for any state already persisted in that phase.
- Keep the "Focused. " prefix and `:orangutan:` emoji as single sources of truth rather than duplicated string literals across the three call sites that set them.

**Non-Goals:**
- Not changing Slack auth, DND behavior, or the safety-net timing.
- Not fixing the pre-existing spec/implementation discrepancy where the work-status estimate spec text says "plus 30 minutes" but the implementation uses configured `workDurationMs + breakDurationMs` — out of scope for this change.

## Decisions

- **Persisted `idle-break` migration**: `loadState()` normalizes any stored `phase: "idle-break"` to `"idle"` on load. Idle-break was always a momentary waypoint with no Slack event attached to entering it, so there's no way to recover "what the user meant" from it after an update — mapping to Idle (same outcome as the safety-net reset, and recoverable with one click) is the safe default. Alternative considered: map it to `"work"` (resume) — rejected because the user had already clicked to leave Work; forcing them back into a running Work timer would be surprising.
- **Single Work→Break transition**: replace `stopWork` + `startBreak` with one `startBreak(state, now)` that only fires from `phase === "work"`, transitions straight to `"break"`, and emits the same `enter-break` event shape as before (`{ type: "enter-break", breakStartedAt: now }`). No change needed on the Slack side — `stopWork` never emitted an event, so nothing is lost.
- **Emoji as a shared constant**: define `FOCUS_EMOJI = ":orangutan:"` once in `slackFocusSync.ts` and pass it through to every `setStatus` call (work-start, break-start, break-overtime fallback); `clearStatus` continues to pass `""`. `setStatus` in `slackClient.ts` gains an `emoji: string` parameter instead of hardcoding `status_emoji: ""`.
- **Minute-only display**: `formatDuration` in `pomodoro-menu-bar.tsx` changes from `M:SS` to whole minutes only, using `Math.floor(ms / 60000)`, consistent with the existing floor-based elapsed-time semantics (no rounding up).
- **Manifest interval**: `30s` → `10s` on the menu-bar command, matching the practical floor Raycast supports (confirmed against Raycast's own Pomodoro extension, which ships the same value).

## Risks / Trade-offs

- [More frequent background wake (10s vs 30s) costs a little more battery] → Mitigated by the display no longer needing second-level freshness anyway; a few seconds of staleness is invisible at minute resolution.
- [Removing `idle-break` mid-cycle for a user who has it persisted from before the update silently drops them to Idle instead of preserving exact prior intent] → Acceptable: it's a transient state by design, and worst case is one extra click to restart, same as hitting the existing safety net.
