## Purpose

Runs a manual, non-auto-advancing Pomodoro cycle (Work, Break, Inbox-check) from a persistent Raycast menu bar item, so the user explicitly controls every phase transition except the one automatic hand-off into inbox checking.

## ADDED Requirements

### Requirement: Phase state machine
The system SHALL track exactly one active phase at a time, from the set {Idle, Work, Idle-break, Break, Inbox-check}, and SHALL only change phase in response to the transitions below.

#### Scenario: Starting work from Idle
- **WHEN** the user starts work while in the Idle phase
- **THEN** the system enters the Work phase and begins counting elapsed time from zero

#### Scenario: Stopping work
- **WHEN** the user stops work while in the Work phase
- **THEN** the system enters the Idle-break phase and stops counting Work elapsed time

#### Scenario: Starting break from Idle-break
- **WHEN** the user starts break while in the Idle-break phase
- **THEN** the system enters the Break phase and begins counting elapsed time from zero

#### Scenario: Stopping break automatically enters inbox-check
- **WHEN** the user stops break while in the Break phase
- **THEN** the system enters the Inbox-check phase immediately, with no additional manual step required

#### Scenario: Starting the next cycle from inbox-check
- **WHEN** the user starts the next cycle while in the Inbox-check phase
- **THEN** the system ends the Inbox-check phase and enters the Work phase in the same action, beginning elapsed time from zero

### Requirement: Configurable phase durations
The system SHALL expose the nominal Work duration and nominal Break duration as user-configurable preferences, defaulting to 25 minutes and 5 minutes respectively.

#### Scenario: Default durations apply when unset
- **WHEN** the user has not changed the duration preferences
- **THEN** the system treats nominal Work duration as 25 minutes and nominal Break duration as 5 minutes

#### Scenario: Custom durations apply
- **WHEN** the user has set custom Work or Break duration preferences
- **THEN** the system uses those values as the nominal duration for the corresponding phase

### Requirement: Overtime counting past nominal duration
The system SHALL NOT automatically stop or transition the Work or Break phase when its nominal duration elapses. Elapsed time SHALL continue to be tracked and displayed past the nominal duration until the user manually stops the phase.

#### Scenario: Work timer displays overtime
- **WHEN** the Work phase has been active longer than its nominal duration and has not been manually stopped
- **THEN** the menu bar displays elapsed time past the nominal duration (overtime) rather than stopping or resetting

#### Scenario: Break timer displays overtime
- **WHEN** the Break phase has been active longer than its nominal duration and has not been manually stopped
- **THEN** the menu bar displays elapsed time past the nominal duration (overtime) rather than stopping or resetting

### Requirement: Nominal-duration reminder notification
The system SHALL fire exactly one system notification with sound per Work phase, and exactly one per Break phase, at the moment its nominal duration is reached. This notification SHALL NOT change the active phase.

#### Scenario: Work nominal duration reached
- **WHEN** the Work phase's elapsed time reaches its nominal duration
- **THEN** the system fires a single system notification with sound, and the Work phase remains active and continues counting

#### Scenario: Break nominal duration reached
- **WHEN** the Break phase's elapsed time reaches its nominal duration
- **THEN** the system fires a single system notification with sound, and the Break phase remains active and continues counting

### Requirement: Inbox-check phase is untimed
The system SHALL NOT track or display elapsed time, overtime, or nominal-duration notifications while in the Inbox-check phase.

#### Scenario: No timer shown during inbox-check
- **WHEN** the system is in the Inbox-check phase
- **THEN** the menu bar shows the phase label without any elapsed-time or countdown display

### Requirement: No-interaction safety-net reset
The system SHALL automatically transition to the Idle phase if the active phase (Work, Idle-break, Break, or Inbox-check) has received no user interaction for approximately 3 hours.

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
- **WHEN** the user triggers manual reset while in the Idle-break or Inbox-check phase
- **THEN** the system immediately transitions to the Idle phase
