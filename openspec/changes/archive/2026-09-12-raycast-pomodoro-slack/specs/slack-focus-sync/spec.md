## Purpose

Keeps Slack Do Not Disturb and status text synchronized with the pomodoro cycle's phase transitions, without requiring an installed/approved Slack app, and without leaking which pomodoro phase (work vs. break) the user is currently in.

## ADDED Requirements

### Requirement: Session-token authentication
The system SHALL authenticate to the Slack Web API using a user-supplied session token pair (an `xoxc` token and an `xoxd` cookie) stored in extension preferences, rather than an installed/OAuth Slack app.

#### Scenario: Slack calls use the stored session token
- **WHEN** the system makes any Slack Web API call
- **THEN** it authenticates using the `xoxc`/`xoxd` values currently stored in preferences

### Requirement: DND active for the full work-and-break span
The system SHALL turn Slack Do Not Disturb on when the Work phase starts, and SHALL keep it on continuously through the Idle-break and Break phases without toggling it off in between.

#### Scenario: DND enabled at work start
- **WHEN** the pomodoro cycle enters the Work phase
- **THEN** the system turns Slack Do Not Disturb on

#### Scenario: DND remains on through idle-break and break
- **WHEN** the pomodoro cycle transitions from Work to Idle-break, and later from Idle-break to Break
- **THEN** Slack Do Not Disturb remains on throughout, with no additional toggle

### Requirement: Initial work-phase status estimate
The system SHALL set the Slack status text to a plain-text estimate of the form "Checking Slack at {time}" when the Work phase starts, where `{time}` is computed once as the Work start time plus 30 minutes and is not recalculated as the Work phase runs into overtime.

#### Scenario: Status set at work start
- **WHEN** the pomodoro cycle enters the Work phase at time T
- **THEN** the system sets the Slack status text to "Checking Slack at T+30min"

#### Scenario: Status unchanged by work overtime
- **WHEN** the Work phase runs longer than its nominal duration before being stopped
- **THEN** the Slack status text set at Work start is not recalculated or updated due to that overtime alone

### Requirement: Break-phase status re-estimate
The system SHALL recompute and re-set the Slack status text when the Break phase starts, to "Checking Slack at {time}" where `{time}` is the Break start time plus 5 minutes.

#### Scenario: Status re-estimated at break start
- **WHEN** the pomodoro cycle enters the Break phase at time T
- **THEN** the system sets the Slack status text to "Checking Slack at T+5min", replacing the estimate set at Work start

### Requirement: Break-overtime status fallback
The system SHALL update the Slack status text to the plain-text value "Checking Slack in a few minutes" if the Break phase remains active more than 5 minutes after it started, without waiting for a manual action.

#### Scenario: Status falls back after break overtime
- **WHEN** the Break phase has been active for more than 5 minutes and has not been manually stopped
- **THEN** the system updates the Slack status text to "Checking Slack in a few minutes"

#### Scenario: No fallback while break is within 5 minutes
- **WHEN** the Break phase has been active for 5 minutes or less
- **THEN** the system does not apply the break-overtime fallback status text

### Requirement: Status and DND cleared on entering inbox-check or idle
The system SHALL turn Slack Do Not Disturb off and clear the Slack status text as soon as the pomodoro cycle enters the Inbox-check phase or the Idle phase.

#### Scenario: Cleared on stopping break
- **WHEN** the pomodoro cycle transitions from Break to Inbox-check
- **THEN** the system turns Slack Do Not Disturb off and clears the Slack status text, with no manual Slack action required

#### Scenario: Cleared on safety-net or manual reset
- **WHEN** the pomodoro cycle transitions to the Idle phase via the no-interaction safety-net reset or a manual reset
- **THEN** the system turns Slack Do Not Disturb off and clears the Slack status text

### Requirement: Status text does not reveal the active phase
All Slack status text set by the system SHALL be plain text with no phase-specific emoji or wording that would let an external viewer distinguish the Work phase from the Break phase.

#### Scenario: Work and break statuses share the same template
- **WHEN** comparing the status text set at Work start to the status text set at Break start
- **THEN** both follow the identical "Checking Slack at {time}" template with no phase-identifying emoji or label, differing only in the computed time

### Requirement: Graceful degradation on Slack API failure
The system SHALL surface a Slack API call failure (such as an expired or rotated session token) as a menu bar error indicator and a Raycast toast notification, and SHALL NOT let the failure affect the pomodoro phase state machine or its timers.

#### Scenario: Expired token surfaces an error without breaking the timer
- **WHEN** a Slack API call fails because the stored session token is expired or invalid
- **THEN** the system shows an error indicator in the menu bar and a toast describing the failure, while the active pomodoro phase and its elapsed-time tracking continue unaffected

#### Scenario: Error indicator clears after a successful call
- **WHEN** a subsequent Slack API call succeeds after a prior failure
- **THEN** the system removes the menu bar error indicator
