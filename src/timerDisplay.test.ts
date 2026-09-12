import { describe, expect, it } from "vitest";
import { formatCountdownMinutes, formatOvertimeMinutes, formatTimerLabel } from "./timerDisplay";

const NOMINAL_25M = 25 * 60_000;
const NOMINAL_5M = 5 * 60_000;

describe("formatCountdownMinutes", () => {
  it("shows the full nominal duration at the start of the phase", () => {
    expect(formatCountdownMinutes(0, NOMINAL_25M)).toBe(25);
  });

  it("shows the remaining minutes mid-phase, rounded up", () => {
    expect(formatCountdownMinutes(10 * 60_000, NOMINAL_25M)).toBe(15);
  });

  it("holds the last minute's value for the full minute before crossing", () => {
    expect(formatCountdownMinutes(24 * 60_000, NOMINAL_25M)).toBe(1);
    expect(formatCountdownMinutes(24 * 60_000 + 59_000, NOMINAL_25M)).toBe(1);
  });

  it("reaches zero exactly at the nominal duration boundary", () => {
    expect(formatCountdownMinutes(NOMINAL_25M, NOMINAL_25M)).toBe(0);
  });

  it("clamps to zero rather than going negative past the boundary", () => {
    expect(formatCountdownMinutes(NOMINAL_25M + 60_000, NOMINAL_25M)).toBe(0);
  });
});

describe("formatOvertimeMinutes", () => {
  it("shows zero for the instant after crossing", () => {
    expect(formatOvertimeMinutes(1)).toBe(0);
  });

  it("still shows zero just under a minute into overtime", () => {
    expect(formatOvertimeMinutes(59_999)).toBe(0);
  });

  it("advances to one at exactly one minute of overtime", () => {
    expect(formatOvertimeMinutes(60_000)).toBe(1);
  });

  it("continues counting up for multi-minute overtime", () => {
    expect(formatOvertimeMinutes(3 * 60_000 + 30_000)).toBe(3);
  });
});

describe("formatTimerLabel", () => {
  it("formats a Work-shaped countdown with the m suffix", () => {
    expect(formatTimerLabel(10 * 60_000, 0, NOMINAL_25M)).toBe("15m");
  });

  it("formats a Work-shaped overtime value with + prefix and m suffix", () => {
    const elapsedMs = NOMINAL_25M + 60_000;
    expect(formatTimerLabel(elapsedMs, elapsedMs - NOMINAL_25M, NOMINAL_25M)).toBe("+1m");
  });

  it("formats a Break-shaped countdown with the m suffix", () => {
    expect(formatTimerLabel(2 * 60_000, 0, NOMINAL_5M)).toBe("3m");
  });

  it("formats a Break-shaped overtime value with + prefix and m suffix", () => {
    const elapsedMs = NOMINAL_5M + 1;
    expect(formatTimerLabel(elapsedMs, elapsedMs - NOMINAL_5M, NOMINAL_5M)).toBe("+0m");
  });
});
