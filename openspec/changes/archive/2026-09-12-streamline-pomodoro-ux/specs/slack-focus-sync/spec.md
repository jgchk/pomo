## MODIFIED Requirements

### Requirement: Initial work-phase status estimate
The system SHALL set the Slack status text to a plain-text estimate of the form "Focused. Checking Slack at {time}" when the Work phase starts, where `{time}` is computed once as the Work start time plus 30 minutes and is not recalculated as the Work phase runs into overtime.

#### Scenario: Status set at work start
- **WHEN** the pomodoro cycle enters the Work phase at time T
- **THEN** the system sets the Slack status text to "Focused. Checking Slack at T+30min"

#### Scenario: Status unchanged by work overtime
- **WHEN** the Work phase runs longer than its nominal duration before being stopped
- **THEN** the Slack status text set at Work start is not recalculated or updated due to that overtime alone

### Requirement: Break-phase status re-estimate
The system SHALL recompute and re-set the Slack status text when the Break phase starts, to "Focused. Checking Slack at {time}" where `{time}` is the Break start time plus 5 minutes.

#### Scenario: Status re-estimated at break start
- **WHEN** the pomodoro cycle enters the Break phase at time T
- **THEN** the system sets the Slack status text to "Focused. Checking Slack at T+5min", replacing the estimate set at Work start

### Requirement: Break-overtime status fallback
The system SHALL update the Slack status text to the plain-text value "Focused. Checking Slack in a few minutes" if the Break phase remains active more than 5 minutes after it started, without waiting for a manual action.

#### Scenario: Status falls back after break overtime
- **WHEN** the Break phase has been active for more than 5 minutes and has not been manually stopped
- **THEN** the system updates the Slack status text to "Focused. Checking Slack in a few minutes"

#### Scenario: No fallback while break is within 5 minutes
- **WHEN** the Break phase has been active for 5 minutes or less
- **THEN** the system does not apply the break-overtime fallback status text

### Requirement: Status text does not reveal the active phase
All Slack status text and emoji set by the system SHALL be phase-agnostic: no wording or emoji SHALL let an external viewer distinguish the Work phase from the Break phase.

#### Scenario: Work and break statuses share the same template
- **WHEN** comparing the status text and emoji set at Work start to the status text and emoji set at Break start
- **THEN** both follow the identical "Focused. Checking Slack at {time}" template and the same `:orangutan:` emoji, differing only in the computed time

## ADDED Requirements

### Requirement: Status emoji accompanies focus status text
The system SHALL set the Slack status emoji to `:orangutan:` whenever it sets status text under the Initial work-phase status estimate, Break-phase status re-estimate, or Break-overtime status fallback requirements, and SHALL clear the status emoji whenever it clears the Slack status text.

#### Scenario: Emoji set alongside work-start status
- **WHEN** the system sets the Slack status text at Work start
- **THEN** the system also sets the Slack status emoji to `:orangutan:`

#### Scenario: Emoji set alongside break-start status
- **WHEN** the system sets the Slack status text at Break start
- **THEN** the system also sets the Slack status emoji to `:orangutan:`

#### Scenario: Emoji set alongside break-overtime fallback status
- **WHEN** the system applies the break-overtime fallback status text
- **THEN** the system also sets the Slack status emoji to `:orangutan:`

#### Scenario: Emoji cleared with status
- **WHEN** the system clears the Slack status text on entering Inbox-check or Idle
- **THEN** the system also clears the Slack status emoji
