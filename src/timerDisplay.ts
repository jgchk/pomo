export function formatCountdownMinutes(elapsedMs: number, nominalDurationMs: number): number {
  return Math.ceil(Math.max(0, nominalDurationMs - elapsedMs) / 60000);
}

export function formatOvertimeMinutes(overtimeMs: number): number {
  return Math.floor(overtimeMs / 60000);
}

export function formatTimerLabel(elapsedMs: number, overtimeMs: number, nominalDurationMs: number): string {
  const isOvertime = elapsedMs > nominalDurationMs;
  return isOvertime
    ? `+${formatOvertimeMinutes(overtimeMs)}m`
    : `${formatCountdownMinutes(elapsedMs, nominalDurationMs)}m`;
}
