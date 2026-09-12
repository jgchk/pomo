## Context

See proposal.md - Why. The relevant existing code:

- `src/state.ts` exports pure functions `getElapsedMs(state, now)` and `getOvertimeMs(state, nominalDurationMs, now)`, both free of `@raycast/api` side effects at the call level (the module does import `LocalStorage`, but these two functions don't touch it).
- `src/pomodoro-menu-bar.tsx` inlines the display formatting: `formatDuration` (bare `Math.floor(ms / 60000)`, no unit suffix) and an `isOvertime` ternary that picks between elapsed and overtime formatting.
- The menu bar command refreshes on a 10-second interval (`package.json`'s `interval: "10s"`), which bounds how precisely any sub-minute boundary state can actually be observed.
- There is currently no test runner, config, or test files anywhere in the repo.

## Goals / Non-Goals

**Goals:**
- Replace the count-up display with a countdown-then-overtime display, per the modified `pomodoro-cycle` requirements.
- Isolate the new formatting math in a plain-function module so it can be unit tested without mocking `@raycast/api` or rendering the React component.
- Stand up vitest as the project's test runner, scoped to covering only the new module.

**Non-Goals:**
- No changes to the phase state machine, persistence, safety-net reset, notifications, or Slack focus sync behavior.
- No backfill of tests for pre-existing code (`state.ts`'s current exports) - left for a future change.
- No icon/color changes for overtime - text only, per the proposal.

## Decisions

**New `src/timerDisplay.ts` module, separate from `state.ts`.**
`state.ts` owns phase-transition logic and persistence (`LocalStorage`); the new countdown/overtime formatting is a distinct responsibility (turning two numbers into a display string) with no persistence or transition concerns. Keeping it in its own module means it can be imported and unit tested with zero setup, and it keeps `state.ts` from accumulating unrelated display logic. Alternative considered: add the functions directly to `state.ts` next to `getElapsedMs`/`getOvertimeMs` - rejected because it would mix state-machine/persistence responsibilities with pure presentation formatting in one file.

Proposed shape:
```ts
// src/timerDisplay.ts
export function formatCountdownMinutes(elapsedMs: number, nominalDurationMs: number): number;
export function formatOvertimeMinutes(overtimeMs: number): number;
export function formatTimerLabel(elapsedMs: number, overtimeMs: number, nominalDurationMs: number): string;
```
`formatTimerLabel` encapsulates the branch between countdown and overtime (using the existing `elapsedMs > nominalDurationMs` boundary from `pomodoro-menu-bar.tsx`) and appends the `m` suffix, so the component just interpolates one string. The two minute-count functions are exported separately so tests can assert rounding behavior at exact boundaries without string-parsing.

**Rounding: `ceil` for countdown, `floor` for overtime.**
`formatCountdownMinutes` = `Math.ceil(Math.max(0, nominalDurationMs - elapsedMs) / 60000)`. `formatOvertimeMinutes` = `Math.floor(overtimeMs / 60000)` (reusing the value already produced by `getOvertimeMs`). This is an explicit, user-decided asymmetry: the countdown holds "1m" for the full last minute before the nominal duration is reached, and overtime holds "+0m" for the full first minute after it - both sides show a value for a full 60-second window, anchored at opposite ends of that window. Alternative considered: symmetric rounding (both `ceil` or both `floor`) - rejected because it doesn't match the explicitly requested display sequence.

**Vitest, not another runner.**
Vitest needs no separate transpile step for TypeScript (unlike Jest, which would need `ts-jest` or babel config), integrates with the existing `tsconfig.json` with minimal added config, and is the de facto default for new Vite-adjacent/TS projects. No competing option was seriously considered given the project's small size and TypeScript-only source.

## Risks / Trade-offs

- [The `elapsedMs > nominalDurationMs` boundary check still lives in `pomodoro-menu-bar.tsx`, duplicating a comparison that `timerDisplay.ts` also implicitly depends on for correct rounding] → Fold the branch into `formatTimerLabel` itself (as sketched above) so the boundary is defined in exactly one place.
- [Introducing vitest sets a precedent that all future changes are expected to add tests, per the user's stated intent] → Explicitly scoped in the proposal to this change's new code only; not enforced by tooling (no CI exists to gate on it), so it's a convention, not a hard requirement.
- [Fractional-minute duration preferences (e.g. a user setting `workDurationMinutes` to `25.5`) are technically allowed by `parseMinutes` in `preferences.ts` and were not exercised in the original design discussion] → Not a new risk introduced by this change; the rounding functions handle any positive `nominalDurationMs` correctly regardless of whether it's a whole-minute multiple, so no special-casing is needed.

## Migration Plan

No data migration - this is a pure display-layer change with no changes to `PomodoroState` shape or `LocalStorage` contents. Ship as a normal release; rollback is a plain revert.
