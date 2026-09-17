import type { NumberId } from '../app/types';
import type { Progress, StampResult } from './progressTypes';

export const ALL_NUMBER_IDS: NumberId[] = Array.from({ length: 11 }, (_, i) => i);
/** カード画像を用意している枚数。これを超えた周回は3枚目を使い回す。 */
export const MAX_CARD_IMAGES = 3;

export function isStamped(progress: Progress, numberId: NumberId): boolean {
  return (progress.stamps[numberId] ?? 0) === progress.cycle;
}

export function stampedCount(progress: Progress): number {
  return ALL_NUMBER_IDS.filter((n) => isStamped(progress, n)).length;
}

export function applyStamp(
  progress: Progress,
  numberId: NumberId,
): { progress: Progress; result: StampResult } {
  const isNewStamp = !isStamped(progress, numberId);
  if (!isNewStamp) {
    return { progress, result: { isNewStamp, completedRound: false, cycle: progress.cycle } };
  }

  const stamped: Progress = {
    stamps: { ...progress.stamps, [numberId]: progress.cycle },
    cycle: progress.cycle,
  };
  const completedRound = stampedCount(stamped) === ALL_NUMBER_IDS.length;
  const next = completedRound ? { ...stamped, cycle: stamped.cycle + 1 } : stamped;

  return { progress: next, result: { isNewStamp, completedRound, cycle: next.cycle } };
}
