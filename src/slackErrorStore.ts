import { LocalStorage } from "@raycast/api";

const KEY = "slack-last-error";

export async function getLastSlackError(): Promise<string | undefined> {
  const value = await LocalStorage.getItem<string>(KEY);
  return value ?? undefined;
}

export async function setLastSlackError(message: string): Promise<void> {
  await LocalStorage.setItem(KEY, message);
}

export async function clearLastSlackError(): Promise<void> {
  await LocalStorage.removeItem(KEY);
}
