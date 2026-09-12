import { execFile } from "node:child_process";

function escapeAppleScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function fireNotification(title: string, message: string, sound = "Glass"): void {
  const script = `display notification "${escapeAppleScriptString(message)}" with title "${escapeAppleScriptString(
    title,
  )}" sound name "${escapeAppleScriptString(sound)}"`;
  execFile("osascript", ["-e", script], () => {
    // Best-effort: a failed system notification shouldn't affect the phase state machine.
  });
}
