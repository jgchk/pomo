## MODIFIED Requirements

### Requirement: Overtime counting past nominal duration
The system SHALL NOT automatically stop or transition the Work or Break phase when its nominal duration elapses. Elapsed time SHALL continue to be tracked past the nominal duration until the user manually stops the phase. Before the nominal duration is reached, the menu bar SHALL display the time remaining until it is reached (a countdown). Once the nominal duration has been exceeded, the menu bar SHALL display the time elapsed past the nominal duration (overtime), prefixed with `+` to distinguish it from the countdown, rather than stopping or resetting.

#### Scenario: Work timer counts down before nominal duration
- **WHEN** the Work phase is active and has not yet reached its nominal duration
- **THEN** the menu bar displays the time remaining until the nominal duration is reached, decreasing as time passes

#### Scenario: Break timer counts down before nominal duration
- **WHEN** the Break phase is active and has not yet reached its nominal duration
- **THEN** the menu bar displays the time remaining until the nominal duration is reached, decreasing as time passes

#### Scenario: Work timer displays overtime
- **WHEN** the Work phase has been active longer than its nominal duration and has not been manually stopped
- **THEN** the menu bar displays a `+`-prefixed overtime value counting up from the moment the nominal duration was exceeded, rather than stopping or resetting

#### Scenario: Break timer displays overtime
- **WHEN** the Break phase has been active longer than its nominal duration and has not been manually stopped
- **THEN** the menu bar displays a `+`-prefixed overtime value counting up from the moment the nominal duration was exceeded, rather than stopping or resetting

### Requirement: Menu bar timer display resolution
The system SHALL display Work and Break countdown/overtime time at minute-level resolution, with no seconds component, and SHALL suffix every displayed value with `m` to indicate the unit is minutes. The countdown value SHALL round up to the nearest whole minute, so that the display holds the final minute's value for the full minute leading up to the nominal duration being reached. The overtime value SHALL round down to the nearest whole minute, so that the display holds each minute's value for the full minute following that point in overtime.

#### Scenario: Elapsed time shown in whole minutes
- **WHEN** the menu bar displays countdown or overtime time for the Work or Break phase
- **THEN** the displayed value shows only whole minutes, with no seconds component

#### Scenario: Countdown shown in whole minutes with unit suffix
- **WHEN** the menu bar displays a countdown value for the Work or Break phase
- **THEN** the displayed value shows only whole minutes rounded up, suffixed with `m`, with no seconds component

#### Scenario: Overtime shown in whole minutes with unit suffix
- **WHEN** the menu bar displays an overtime value for the Work or Break phase
- **THEN** the displayed value shows only whole minutes rounded down, suffixed with `m`, with no seconds component
