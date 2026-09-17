import { Preferences } from '@capacitor/preferences';

const COUNTER_KEY = 'interstitialCounter';

export async function incrementInterstitialCounter(): Promise<number> {
  const { value } = await Preferences.get({ key: COUNTER_KEY });
  const next = (value ? Number(value) : 0) + 1;
  await Preferences.set({ key: COUNTER_KEY, value: String(next) });
  return next;
}

export async function resetInterstitialCounter(): Promise<void> {
  await Preferences.set({ key: COUNTER_KEY, value: '0' });
}
