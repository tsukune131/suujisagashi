import { Preferences } from '@capacitor/preferences';

const LAST_COLOR_KEY = 'lastStrokeColor';

export async function getLastStrokeColor(): Promise<string | null> {
  const { value } = await Preferences.get({ key: LAST_COLOR_KEY });
  return value;
}

export async function setLastStrokeColor(color: string): Promise<void> {
  await Preferences.set({ key: LAST_COLOR_KEY, value: color });
}
