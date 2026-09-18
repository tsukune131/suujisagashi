export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  width: number;
  points: Point[];
}

function strokeLength(stroke: Stroke): number {
  let length = 0;
  for (let i = 1; i < stroke.points.length; i++) {
    const a = stroke.points[i - 1];
    const b = stroke.points[i];
    length += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return length;
}

export function totalStrokeLength(strokes: Stroke[]): number {
  return strokes.reduce((sum, s) => sum + strokeLength(s), 0);
}

const MIN_REQUIRED_STROKES = 1;
const MAX_REQUIRED_STROKES = 4;

/**
 * なぞる本数の目安を対象の数字にひもづける(例: 3なら3本)。
 * 0と10は例外的に上限(4本)に丸める(0本や10本を求めるのは非現実的なため)。
 * 厳密な判定ではなく、完成までにもう少し遊んでもらうための緩い後押し。
 */
export function requiredStrokeCount(numberId: number): number {
  return Math.min(Math.max(numberId, MIN_REQUIRED_STROKES), MAX_REQUIRED_STROKES);
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length < 2) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
}
