## MODIFIED Requirements

### Requirement: Phase state machine
The system SHALL track exactly one active phase at a time, from the set {Idle, Work, Break, Inbox-check}, and SHALL only change phase in response to the transitions below.

#### Scenario: Starting work from Idle
- **WHEN** the user starts work while in the Idle phase
- **THEN** the system enters the Work phase and begins counting elapsed time from zero

#### Scenario: Stopping work
- **WHEN** the user starts break while in the Work phase
- **THEN** the system stops counting Work elapsed time as part of that same action, with no separate "stop work" step

#### Scenario: Starting break from Idle-break
- **WHEN** the user starts break while in the Work phase
- **THEN** the system enters the Break phase immediately and begins counting Break elapsed time from zero, with no intermediate phase and no additional manual step required

#### Scenario: Stopping break automatically enters inbox-check
- **WHEN** the user stops break while in the Break phase
- **THEN** the system enters the Inbox-check phase immediately, with no additional manual step required

#### Scenario: Starting the next cycle from inbox-check
- **WHEN** the user starts the next cycle while in the Inbox-check phase
- **THEN** the system ends the Inbox-check phase and enters the Work phase in the same action, beginning elapsed time from zero

### Requirement: No-interaction safety-net reset
The system SHALL automatically transition to the Idle phase if the active phase (Work, Break, or Inbox-check) has received no user interaction for approximately 3 hours.

#### Scenario: Work abandoned for 3 hours
- **WHEN** the Work phase has been active with no user interaction for approximately 3 hours
- **THEN** the system automatically transitions to the Idle phase

#### Scenario: Break abandoned for 3 hours
- **WHEN** the Break phase has been active with no user interaction for approximately 3 hours
- **THEN** the system automatically transitions to the Idle phase

### Requirement: Manual reset to Idle
The system SHALL provide a manual reset action, available while in any phase other than Idle, that immediately transitions to the Idle phase regardless of elapsed time.

#### Scenario: Manual reset from Work
- **WHEN** the user triggers manual reset while in the Work phase
- **THEN** the system immediately transitions to the Idle phase

#### Scenario: Manual reset from Break
- **WHEN** the user triggers manual reset while in the Break phase
- **THEN** the system immediately transitions to the Idle phase

#### Scenario: Manual reset from Idle-break or Inbox-check
- **WHEN** the user triggers manual reset while in the Inbox-check phase
- **THEN** the system immediately transitions to the Idle phase

### Requirement: Nominal-duration reminder notification
The system SHALL fire exactly one system notification with sound per Work phase, and exactly one per Break phase, at the moment its nominal duration is reached, using a plain-text title with no message body. This notification SHALL NOT change the active phase.

#### Scenario: Work nominal duration reached
- **WHEN** the Work phase's elapsed time reaches its nominal duration
- **THEN** the system fires a single system notification with sound titled "Work block finished, time to take a break", and the Work phase remains active and continues counting

#### Scenario: Break nominal duration reached
- **WHEN** the Break phase's elapsed time reaches its nominal duration
- **THEN** the system fires a single system notification with sound titled "Break block finished, time to work", and the Break phase remains active and continues counting

## ADDED Requirements

### Requirement: Menu bar timer display resolution
The system SHALL display Work and Break elapsed/overtime time at minute-level resolution, with no seconds component.

#### Scenario: Elapsed time shown in whole minutes
- **WHEN** the menu bar displays elapsed or overtime time for the Work or Break phase
- **THEN** the displayed value shows only whole minutes, with no seconds component
