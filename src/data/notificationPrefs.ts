import { Preferences } from '@capacitor/preferences';

const ENABLED_KEY = 'notificationsEnabled';

/** 既定はオン(初回起動時にOS許可ダイアログを出す前提)。 */
export async function getNotificationsEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: ENABLED_KEY });
  return value !== 'false';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await Preferences.set({ key: ENABLED_KEY, value: String(enabled) });
}
