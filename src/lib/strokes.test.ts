import { describe, expect, it } from 'vitest';
import { requiredStrokeCount, totalStrokeLength } from './strokes';

describe('requiredStrokeCount', () => {
  it('数字1〜4はその数字ぶんの本数を要求する', () => {
    expect(requiredStrokeCount(1)).toBe(1);
    expect(requiredStrokeCount(2)).toBe(2);
    expect(requiredStrokeCount(3)).toBe(3);
    expect(requiredStrokeCount(4)).toBe(4);
  });

  it('0は最低1本を要求する(0本で完成にはしない)', () => {
    expect(requiredStrokeCount(0)).toBe(1);
  });

  it('5以上は上限4本に丸める', () => {
    expect(requiredStrokeCount(5)).toBe(4);
    expect(requiredStrokeCount(10)).toBe(4);
  });
});

describe('totalStrokeLength', () => {
  it('複数ストロークの長さを合計する', () => {
    const strokes = [
      { color: '#000', width: 1, points: [{ x: 0, y: 0 }, { x: 3, y: 4 }] },
      { color: '#000', width: 1, points: [{ x: 0, y: 0 }, { x: 6, y: 8 }] },
    ];
    expect(totalStrokeLength(strokes)).toBe(15);
  });
});
