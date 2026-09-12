## 1. Phase state machine

- [x] 1.1 Remove `"idle-break"` from the `Phase` union in `src/types.ts`
- [x] 1.2 In `src/state.ts`, remove `stopWork`; change `startBreak` to transition directly from `phase === "work"` to `"break"`, emitting `{ type: "enter-break", breakStartedAt: now }`
- [x] 1.3 In `loadState()`, normalize any persisted `phase: "idle-break"` to `"idle"` before returning
- [x] 1.4 Update `checkSafetyNet` / phase-list comments or logic that reference `idle-break` if any remain

## 2. Slack status text and emoji

- [x] 2.1 Add an `emoji: string` parameter to `setStatus` in `src/slackClient.ts`; pass it through to `status_emoji` in the profile payload; update `clearStatus` to pass `""`
- [x] 2.2 In `src/slackFocusSync.ts`, define `const FOCUS_EMOJI = ":orangutan:"` and prefix `formatEstimate`'s output (and the break-overtime fallback string) with `"Focused. "`
- [x] 2.3 Pass `FOCUS_EMOJI` to every `setStatus` call in `handlePhaseEvent` (enter-work, enter-break, break-overtime-crossed)

## 3. Menu bar actions and display

- [x] 3.1 In `src/pomodoro-menu-bar.tsx`, replace the Work phase's "Stop Work" item with a "Start Break" item calling the new direct `startBreak` transition
- [x] 3.2 Rename the Inbox-check phase's "Start Next Cycle" item to "Start Work"
- [x] 3.3 Change `formatDuration` to render whole minutes only (`Math.floor(ms / 60000)`), dropping the seconds component
- [x] 3.4 Update `package.json`'s menu-bar command `interval` from `"30s"` to `"10s"`

## 4. Notifications

- [x] 4.1 Update the Work nominal-duration notification to title "Work block finished, time to take a break" with no message body
- [x] 4.2 Update the Break nominal-duration notification to title "Break block finished, time to work" with no message body
- [x] 4.3 Confirm `fireNotification` supports a title-only call (no message argument required)

## 5. Verification

- [x] 5.1 `ray lint` / `ray build` pass with no errors
- [x] 5.2 Manually walk one full cycle (Start Work → Start Break → Stop Break → Start Work) confirming: Slack status reads "Focused. Checking Slack at {time}" with `:orangutan:` emoji at both work-start and break-start; menu bar shows whole-minute display; Work phase's only action is "Start Break"; Inbox-check's action reads "Start Work"
- [x] 5.3 Manually verify the two nominal-duration notifications show the new casual titles with no body text
- [x] 5.4 Manually verify Reset from the Work phase still clears DND/status and returns to Idle (the remaining "stop without a break" path)
