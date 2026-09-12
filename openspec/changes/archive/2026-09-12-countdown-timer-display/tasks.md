## 1. Test infrastructure

- [x] 1.1 Add `vitest` as a dev dependency
- [x] 1.2 Add a `test` script to `package.json` (e.g. `"test": "vitest run"`)
- [x] 1.3 Add minimal vitest config if needed (TS support, node environment)

## 2. Timer display module

- [x] 2.1 Create `src/timerDisplay.ts` with `formatCountdownMinutes(elapsedMs, nominalDurationMs)` using `Math.ceil`
- [x] 2.2 Add `formatOvertimeMinutes(overtimeMs)` using `Math.floor`
- [x] 2.3 Add `formatTimerLabel(elapsedMs, overtimeMs, nominalDurationMs)` that picks countdown vs. overtime (single source of truth for the crossing boundary) and returns the fully formatted string including `+` prefix and `m` suffix

## 3. Wire into the menu bar command

- [x] 3.1 Replace `formatDuration` and the inline `isOvertime` ternary in `src/pomodoro-menu-bar.tsx` with a call to `formatTimerLabel`
- [x] 3.2 Verify `title` construction still only appends the timer label for `isTimedPhase` (Work/Break), unchanged for Idle/Inbox-check

## 4. Tests

- [x] 4.1 Test `formatCountdownMinutes`: start of phase, mid-phase, last-minute-before-crossing (holds "1m" equivalent), exact-crossing boundary
- [x] 4.2 Test `formatOvertimeMinutes`: instant after crossing (0), just-under-a-minute (0), exactly-one-minute (1), multi-minute values
- [x] 4.3 Test `formatTimerLabel`: full string output including `m` suffix and `+` prefix, for both Work-shaped and Break-shaped inputs

## 5. Spec sync

- [x] 5.1 Confirm `openspec/changes/countdown-timer-display/specs/pomodoro-cycle/spec.md` deltas match the implemented behavior exactly (rounding directions, `+` prefix, `m` suffix)

## 6. Manual verification

- [x] 6.1 Run the Raycast command locally (`npm run dev`) and observe the menu bar through a full Work cycle: countdown from nominal duration down to "1m", then overtime from "+0m" upward
- [x] 6.2 Confirm Break phase shows the same countdown/overtime behavior
- [x] 6.3 Confirm Idle and Inbox-check phases are unaffected (no timer label)
