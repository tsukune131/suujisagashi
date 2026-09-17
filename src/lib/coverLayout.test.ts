import { describe, expect, it } from 'vitest';
import { coverLayout, TUTORIAL_WHEELS, tutorialGuideCircle } from './coverLayout';

const SVG_WIDTH = 600;
const SVG_HEIGHT = 900;

describe('coverLayout', () => {
  it('縦長の枠に横長画像を置くと高さに合わせて左右がはみ出す', () => {
    const layout = coverLayout(800, 500, 369, 560);
    expect(layout.scale).toBeCloseTo(1.12);
    expect(layout.offsetX).toBeCloseTo((369 - 896) / 2);
    expect(layout.offsetY).toBeCloseTo(0);
  });
});

describe('tutorialGuideCircle', () => {
  // なぞり枠の大きさの目安: iPhone 15相当、iPhone SE相当(背が低い)、iPad縦に近い比率
  const containers = [
    [369, 560],
    [355, 420],
    [700, 800],
  ];

  it.each(containers)('枠 %i×%i でも、ガイド対象のタイヤが見切れず画面内に収まる', (w, h) => {
    const circle = tutorialGuideCircle(SVG_WIDTH, SVG_HEIGHT, w, h);
    const { scale } = coverLayout(SVG_WIDTH, SVG_HEIGHT, w, h);
    const wheelRadius = TUTORIAL_WHEELS[0].r * scale;
    expect(circle.x - wheelRadius).toBeGreaterThanOrEqual(0);
    expect(circle.x + wheelRadius).toBeLessThanOrEqual(w);
    expect(circle.y - wheelRadius).toBeGreaterThanOrEqual(0);
    expect(circle.y + wheelRadius).toBeLessThanOrEqual(h);
  });

  it('極端に細い枠で両方のタイヤが端にかかる場合は、より内側のタイヤを選ぶ', () => {
    const { scale, offsetX } = coverLayout(SVG_WIDTH, SVG_HEIGHT, 200, 560);
    const circle = tutorialGuideCircle(SVG_WIDTH, SVG_HEIGHT, 200, 560);
    const xs = TUTORIAL_WHEELS.map((wh) => wh.cx * scale + offsetX);
    const inner = xs.reduce((a, b) => (Math.abs(b - 100) < Math.abs(a - 100) ? b : a));
    expect(circle.x).toBeCloseTo(inner);
  });
});
