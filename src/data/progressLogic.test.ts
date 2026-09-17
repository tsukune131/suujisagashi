import { describe, expect, it } from 'vitest';
import { ALL_NUMBER_IDS, applyStamp, stampedCount } from './progressLogic';
import type { Progress } from './progressTypes';

function completeCycle(progress: Progress): { progress: Progress; completions: number } {
  let completions = 0;
  for (const n of ALL_NUMBER_IDS) {
    const step = applyStamp(progress, n);
    progress = step.progress;
    if (step.result.completedRound) completions++;
  }
  return { progress, completions };
}

describe('applyStamp', () => {
  it('同じ周回での再保存はスタンプを増やさない', () => {
    const first = applyStamp({ stamps: {}, cycle: 1 }, 3);
    const second = applyStamp(first.progress, 3);
    expect(first.result.isNewStamp).toBe(true);
    expect(second.result.isNewStamp).toBe(false);
    expect(stampedCount(second.progress)).toBe(1);
  });

  it('11個揃った瞬間だけコンプリートし、次の周回に進む', () => {
    const { progress, completions } = completeCycle({ stamps: {}, cycle: 1 });
    expect(completions).toBe(1);
    expect(progress.cycle).toBe(2);
    expect(stampedCount(progress)).toBe(0);
  });

  it('3周目を超えても毎周コンプリートでき、スタンプが止まらない', () => {
    let progress: Progress = { stamps: {}, cycle: 1 };
    for (let i = 0; i < 6; i++) {
      const done = completeCycle(progress);
      expect(done.completions).toBe(1);
      progress = done.progress;
    }
    expect(progress.cycle).toBe(7);
    expect(stampedCount(progress)).toBe(0);
  });
});
