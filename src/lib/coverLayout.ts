export interface CoverLayout {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** CSS の object-fit: cover と同じ配置(拡大率と、はみ出し分のずれ)を計算する。 */
export function coverLayout(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number,
): CoverLayout {
  const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);
  return {
    scale,
    offsetX: (containerWidth - naturalWidth * scale) / 2,
    offsetY: (containerHeight - naturalHeight * scale) / 2,
  };
}

interface Circle {
  cx: number;
  cy: number;
  r: number;
}

/** tutorial-car.svg(600×900の縦長)上のタイヤの位置。SVGを差し替えたらここも更新する。 */
export const TUTORIAL_WHEELS: Circle[] = [
  { cx: 180, cy: 600, r: 65 },
  { cx: 420, cy: 600, r: 65 },
];
const GUIDE_RING_PADDING = 1.2;

/**
 * 画面の縦横比によってはタイヤが見切れるため、画面内に最も余裕を持って収まって
 * いるタイヤを選び、その表示上の中心と直径を返す。
 */
export function tutorialGuideCircle(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number; diameter: number } {
  const { scale, offsetX, offsetY } = coverLayout(
    naturalWidth,
    naturalHeight,
    containerWidth,
    containerHeight,
  );
  const placed = TUTORIAL_WHEELS.map((w) => {
    const x = w.cx * scale + offsetX;
    const y = w.cy * scale + offsetY;
    const r = w.r * scale;
    const margin = Math.min(x - r, containerWidth - x - r, y - r, containerHeight - y - r);
    return { x, y, diameter: r * 2 * GUIDE_RING_PADDING, margin };
  });
  const best = placed.reduce((a, b) => (b.margin > a.margin ? b : a));
  return { x: best.x, y: best.y, diameter: best.diameter };
}
