import { coverLayout } from './coverLayout';
import { drawStamp, STAMP_FONT_SIZE_PX, type Stamp } from './stamps';
import { drawStroke, type Stroke } from './strokes';

/** 作品本体は登録写真と同じく長辺1200px程度に抑える(設計書「6. データモデル」)。 */
const IMAGE_LONG_EDGE = 1200;
const THUMBNAIL_LONG_EDGE = 320;
const JPEG_QUALITY = 0.88;

function toBase64Jpeg(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return dataUrl.substring(dataUrl.indexOf(',') + 1);
}

function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context を取得できません');
  }
  return { canvas, ctx };
}

/**
 * <img>にobject-fit:coverで表示されている写真と、その上に重ねたストロークを合成し、
 * 本体(長辺1200px)とギャラリー用サムネイル(長辺320px)のJPEGを返す。
 * 子供が画面上で見ていた見た目(切り取り範囲)そのままを保存する。
 */
export function compositeArtwork(
  photoImg: HTMLImageElement,
  containerWidth: number,
  containerHeight: number,
  strokes: Stroke[],
  stamps: Stamp[],
): { imageBase64: string; thumbnailBase64: string } {
  const outputScale = Math.min(
    window.devicePixelRatio || 1,
    IMAGE_LONG_EDGE / Math.max(containerWidth, containerHeight),
  );
  const { canvas, ctx } = createCanvas(
    Math.round(containerWidth * outputScale),
    Math.round(containerHeight * outputScale),
  );
  ctx.scale(outputScale, outputScale);

  const { scale, offsetX, offsetY } = coverLayout(
    photoImg.naturalWidth,
    photoImg.naturalHeight,
    containerWidth,
    containerHeight,
  );
  ctx.drawImage(
    photoImg,
    offsetX,
    offsetY,
    photoImg.naturalWidth * scale,
    photoImg.naturalHeight * scale,
  );
  for (const stroke of strokes) {
    drawStroke(ctx, stroke);
  }
  for (const stamp of stamps) {
    drawStamp(ctx, stamp, STAMP_FONT_SIZE_PX);
  }

  const thumbScale = THUMBNAIL_LONG_EDGE / Math.max(canvas.width, canvas.height);
  const thumb = createCanvas(
    Math.round(canvas.width * thumbScale),
    Math.round(canvas.height * thumbScale),
  );
  thumb.ctx.drawImage(canvas, 0, 0, thumb.canvas.width, thumb.canvas.height);

  return { imageBase64: toBase64Jpeg(canvas), thumbnailBase64: toBase64Jpeg(thumb.canvas) };
}
