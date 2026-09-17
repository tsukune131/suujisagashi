import { Preferences } from '@capacitor/preferences';
import type { NumberId } from '../app/types';
import type { Progress, StampResult } from './progressTypes';

const STAMPS_KEY = 'numberStamps';
const ROUND_KEY = 'currentCardRound';
const LAP_KEY = 'lapCount';
const MAX_CARD_ROUND = 3;
const ALL_NUMBER_IDS: NumberId[] = Array.from({ length: 11 }, (_, i) => i); // 0〜10

async function readStamps(): Promise<Record<NumberId, number>> {
  const { value } = await Preferences.get({ key: STAMPS_KEY });
  return value ? (JSON.parse(value) as Record<NumberId, number>) : {};
}

async function writeStamps(stamps: Record<NumberId, number>): Promise<void> {
  await Preferences.set({ key: STAMPS_KEY, value: JSON.stringify(stamps) });
}

async function readCurrentCardRound(): Promise<number> {
  const { value } = await Preferences.get({ key: ROUND_KEY });
  return value ? Number(value) : 1;
}

async function readLapCount(): Promise<number> {
  const { value } = await Preferences.get({ key: LAP_KEY });
  return value ? Number(value) : 0;
}

export async function getProgress(): Promise<Progress> {
  const [stamps, currentCardRound, lapCount] = await Promise.all([
    readStamps(),
    readCurrentCardRound(),
    readLapCount(),
  ]);
  return { stamps, currentCardRound, lapCount };
}

/**
 * Artwork保存後に呼ぶ。対象数字のスタンプを(同じカード回数内では1回だけ)進め、
 * 0〜10すべてが揃った瞬間にカード回数を進める/週数を加算する。
 * 設計書「機能4: 達成スタンプ表示(コンプリート)」参照。
 */
export async function recordStampIfNeeded(numberId: NumberId): Promise<StampResult> {
  const stamps = await readStamps();
  const currentCardRound = await readCurrentCardRound();
  let lapCount = await readLapCount();

  const isNewStamp = (stamps[numberId] ?? 0) < currentCardRound;
  if (isNewStamp) {
    stamps[numberId] = currentCardRound;
    await writeStamps(stamps);
  }

  const allStamped = ALL_NUMBER_IDS.every((n) => (stamps[n] ?? 0) === currentCardRound);
  const completedRound = isNewStamp && allStamped;
  let newCurrentCardRound = currentCardRound;

  if (completedRound) {
    if (currentCardRound < MAX_CARD_ROUND) {
      newCurrentCardRound = currentCardRound + 1;
      await Preferences.set({ key: ROUND_KEY, value: String(newCurrentCardRound) });
    } else {
      lapCount += 1;
      await Preferences.set({ key: LAP_KEY, value: String(lapCount) });
    }
  }

  return { isNewStamp, completedRound, currentCardRound: newCurrentCardRound, lapCount };
}
