function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawToCanvas(img: HTMLImageElement, maxLongEdge: number): HTMLCanvasElement {
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, maxLongEdge / longEdge);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context を取得できません');
  }
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * 画像を長辺 maxLongEdge にダウンサンプルし、base64(dataURLのprefixなし)で返す。
 * 設計書「6. データモデルとローカル保存設計」: 写真本体は長辺1200px程度。
 */
export async function resizeImageToBase64(
  webPath: string,
  maxLongEdge: number,
  quality = 0.85,
): Promise<string> {
  const img = await loadImage(webPath);
  const canvas = drawToCanvas(img, maxLongEdge);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return dataUrl.substring(dataUrl.indexOf(',') + 1);
}
