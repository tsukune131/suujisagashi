/** キャンバス表示上のフォントサイズ(px)。合成保存時も同じ値を使い、見た目を揃える。 */
export const STAMP_FONT_SIZE_PX = 48;

export interface Stamp {
  x: number;
  y: number;
  color: string;
  numberId: number;
  /** シールを貼ったような見た目にするための、わずかな傾き(度)。 */
  rotation: number;
}

export function createStamp(x: number, y: number, color: string, numberId: number): Stamp {
  const rotation = Math.random() * 24 - 12; // -12〜12度
  return { x, y, color, numberId, rotation };
}

/** ボタン等と同じ丸くて楽しいフォント(src/index.cssで@font-face定義済み)。 */
const STAMP_FONT_FAMILY = 'Fredoka';

/** ページ読み込み後の初回スタンプ描画で、フォントが未読込のまま
 * デフォルト書体で描かれてしまわないよう先に読み込んでおく。 */
export async function preloadStampFont(): Promise<void> {
  try {
    await document.fonts.load(`600 ${STAMP_FONT_SIZE_PX}px ${STAMP_FONT_FAMILY}`);
  } catch {
    // 読み込めなくてもフォールバックフォントで描画を続ける
  }
}

export function drawStamp(ctx: CanvasRenderingContext2D, stamp: Stamp, fontSizePx: number): void {
  ctx.save();
  ctx.translate(stamp.x, stamp.y);
  ctx.rotate((stamp.rotation * Math.PI) / 180);
  ctx.font = `600 ${fontSizePx}px ${STAMP_FONT_FAMILY}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = fontSizePx * 0.16;
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.strokeText(String(stamp.numberId), 0, 0);
  ctx.fillStyle = stamp.color;
  ctx.fillText(String(stamp.numberId), 0, 0);
  ctx.restore();
}
