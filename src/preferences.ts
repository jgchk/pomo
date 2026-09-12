import { getPreferenceValues } from "@raycast/api";

interface RawPreferences {
  workDurationMinutes?: string;
  breakDurationMinutes?: string;
  slackXoxcToken?: string;
  slackXoxdCookie?: string;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

function parseMinutes(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface ResolvedPreferences {
  workDurationMs: number;
  breakDurationMs: number;
  slackXoxcToken: string;
  slackXoxdCookie: string;
}

export function getResolvedPreferences(): ResolvedPreferences {
  const prefs = getPreferenceValues<RawPreferences>();
  return {
    workDurationMs: parseMinutes(prefs.workDurationMinutes, DEFAULT_WORK_MINUTES) * 60_000,
    breakDurationMs: parseMinutes(prefs.breakDurationMinutes, DEFAULT_BREAK_MINUTES) * 60_000,
    slackXoxcToken: prefs.slackXoxcToken ?? "",
    slackXoxdCookie: prefs.slackXoxdCookie ?? "",
  };
}
