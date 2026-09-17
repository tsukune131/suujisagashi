import { Preferences } from '@capacitor/preferences';

const HAS_SEEN_TUTORIAL_KEY = 'hasSeenTutorial';

export async function getHasSeenTutorial(): Promise<boolean> {
  const { value } = await Preferences.get({ key: HAS_SEEN_TUTORIAL_KEY });
  return value === 'true';
}

export async function setHasSeenTutorial(): Promise<void> {
  await Preferences.set({ key: HAS_SEEN_TUTORIAL_KEY, value: 'true' });
}
