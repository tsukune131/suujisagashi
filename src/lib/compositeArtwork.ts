import { drawStroke, type Stroke } from './strokes';

/**
 * <img>にobject-fit:coverで表示されている写真と、その上に重ねたストロークを
 * 1枚のCanvasに合成し、PNG(dataURLのprefixなしbase64)として返す。
 * 子供が画面上で見ていた見た目そのままを保存する(元写真の解像度には合わせない)。
 */
export function compositeArtworkToPngBase64(
  photoImg: HTMLImageElement,
  containerWidth: number,
  containerHeight: number,
  strokes: Stroke[],
): string {
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  canvas.width = containerWidth * dpr;
  canvas.height = containerHeight * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context を取得できません');
  }
  ctx.scale(dpr, dpr);

  const scale = Math.max(
    containerWidth / photoImg.naturalWidth,
    containerHeight / photoImg.naturalHeight,
  );
  const drawWidth = photoImg.naturalWidth * scale;
  const drawHeight = photoImg.naturalHeight * scale;
  const offsetX = (containerWidth - drawWidth) / 2;
  const offsetY = (containerHeight - drawHeight) / 2;
  ctx.drawImage(photoImg, offsetX, offsetY, drawWidth, drawHeight);

  for (const stroke of strokes) {
    drawStroke(ctx, stroke);
  }

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.substring(dataUrl.indexOf(',') + 1);
}
