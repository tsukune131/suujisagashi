import { Preferences } from '@capacitor/preferences';
import type { NumberId } from '../app/types';
import { applyStamp } from './progressLogic';
import type { Progress, StampResult } from './progressTypes';

const STAMPS_KEY = 'numberStamps';
const CYCLE_KEY = 'stampCycle';

export async function getProgress(): Promise<Progress> {
  const [stamps, cycle] = await Promise.all([
    Preferences.get({ key: STAMPS_KEY }),
    Preferences.get({ key: CYCLE_KEY }),
  ]);
  return {
    stamps: stamps.value ? (JSON.parse(stamps.value) as Record<NumberId, number>) : {},
    cycle: cycle.value ? Number(cycle.value) : 1,
  };
}

/** Artwork保存後に呼ぶ。設計書「機能4: 達成スタンプ表示(コンプリート)」参照。 */
export async function recordStampIfNeeded(numberId: NumberId): Promise<StampResult> {
  const { progress, result } = applyStamp(await getProgress(), numberId);
  if (result.isNewStamp) {
    await Preferences.set({ key: STAMPS_KEY, value: JSON.stringify(progress.stamps) });
    await Preferences.set({ key: CYCLE_KEY, value: String(progress.cycle) });
  }
  return result;
}
