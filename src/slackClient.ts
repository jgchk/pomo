const SLACK_API_BASE = "https://slack.com/api";

export interface SlackAuth {
  xoxcToken: string;
  xoxdCookie: string;
}

export type SlackErrorKind = "auth" | "network" | "api";

export interface SlackError {
  kind: SlackErrorKind;
  message: string;
}

export type SlackResult<T> = { ok: true; data: T } | { ok: false; error: SlackError };

async function callSlackApi<T = Record<string, unknown>>(
  method: string,
  auth: SlackAuth,
  params: Record<string, string>,
): Promise<SlackResult<T>> {
  if (!auth.xoxcToken || !auth.xoxdCookie) {
    return { ok: false, error: { kind: "auth", message: "Slack session token is not configured in preferences." } };
  }

  const body = new URLSearchParams({ token: auth.xoxcToken, ...params });

  let response: Response;
  try {
    response = await fetch(`${SLACK_API_BASE}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `d=${auth.xoxdCookie}`,
      },
      body: body.toString(),
    });
  } catch (cause) {
    return { ok: false, error: { kind: "network", message: `Network error calling Slack: ${String(cause)}` } };
  }

  if (!response.ok) {
    const kind: SlackErrorKind = response.status === 401 || response.status === 403 ? "auth" : "network";
    return { ok: false, error: { kind, message: `Slack responded with HTTP ${response.status}` } };
  }

  const json = (await response.json()) as { ok: boolean; error?: string } & T;
  if (!json.ok) {
    const authErrors = new Set(["invalid_auth", "not_authed", "token_revoked", "account_inactive"]);
    const kind: SlackErrorKind = authErrors.has(json.error ?? "") ? "auth" : "api";
    return { ok: false, error: { kind, message: json.error ?? "Unknown Slack API error" } };
  }

  return { ok: true, data: json };
}

export function setDndSnooze(auth: SlackAuth, minutes: number): Promise<SlackResult<Record<string, unknown>>> {
  return callSlackApi("dnd.setSnooze", auth, { num_minutes: String(minutes) });
}

export function endDndSnooze(auth: SlackAuth): Promise<SlackResult<Record<string, unknown>>> {
  return callSlackApi("dnd.endSnooze", auth, {});
}

export function setStatus(auth: SlackAuth, text: string, emoji: string): Promise<SlackResult<Record<string, unknown>>> {
  const profile = JSON.stringify({ status_text: text, status_emoji: emoji, status_expiration: 0 });
  return callSlackApi("users.profile.set", auth, { profile });
}

export function clearStatus(auth: SlackAuth): Promise<SlackResult<Record<string, unknown>>> {
  return setStatus(auth, "", "");
}
