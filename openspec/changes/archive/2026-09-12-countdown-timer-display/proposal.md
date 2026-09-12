## Why

The menu bar timer currently counts up from zero for both Work and Break ("Work 12"), with no unit label and no visual distinction once it slips past the nominal duration ("Work +3"). A countdown ("Work 25m" → "Work 1m") is easier to read at a glance during the phase, and a clearly labeled overtime indicator ("Work +1m") makes it obvious when you've run over without having to do mental math against the configured duration.

## What Changes

- **BREAKING**: Timer display switches from count-up to count-down for the pre-nominal-duration portion of Work and Break phases (e.g. "25m", "24m", ... "1m" instead of "0", "1", "2", ...).
- Once elapsed time exceeds the nominal duration, the display switches to counting up with a `+` prefix (e.g. "+0m", "+1m", "+2m", ...), replacing the current bare `+N` overtime format.
- All timer values now carry an "m" suffix to make the unit explicit (not present today).
- Countdown minutes round up (`ceil`) so the last minute before crossing holds "1m"; overtime minutes round down (`floor`) so the first minute after crossing holds "+0m" before advancing to "+1m".
- New `src/timerDisplay.ts` module holds the pure formatting functions (no `@raycast/api` dependency), extracted out of `pomodoro-menu-bar.tsx`, so the rounding/boundary logic is unit-testable in isolation.
- Introduces vitest as the project's first test framework, with unit tests covering the new `timerDisplay.ts` functions only (not a retroactive backfill of existing `state.ts` tests).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `pomodoro-cycle`: The "Overtime counting past nominal duration" requirement and the "Menu bar timer display resolution" requirement both describe the display format, which is changing from count-up to countdown-then-overtime-count-up with minute-unit labeling.

## Impact

- `src/pomodoro-menu-bar.tsx`: replaces inline `formatDuration`/overtime ternary with calls into the new `timerDisplay.ts` module.
- `src/timerDisplay.ts` (new): pure countdown/overtime formatting functions.
- `src/timerDisplay.test.ts` (new): unit tests for the above.
- `package.json`: adds `vitest` as a dev dependency and a `test` script.
- `openspec/specs/pomodoro-cycle/spec.md`: requirement text/scenarios updated to describe the new display behavior.
- No change to phase state machine, persistence, notifications, or Slack focus sync logic.
