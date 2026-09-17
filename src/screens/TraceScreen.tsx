import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { saveArtwork, resolveArtworkUri } from '../data/artworkRepository';
import { getLastStrokeColor, setLastStrokeColor } from '../data/drawingPrefs';
import { getPhotosByNumber, resolvePhotoUri } from '../data/photoRepository';
import type { Photo } from '../data/photoTypes';
import { recordStampIfNeeded } from '../data/progressRepository';
import { compositeArtworkToPngBase64 } from '../lib/compositeArtwork';
import { drawStroke, totalStrokeLength, type Point, type Stroke } from '../lib/strokes';
import './TraceScreen.css';

const COLORS = ['#ff5b5b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#ff8fab'];
const DEFAULT_COLOR = COLORS[0];
const STROKE_WIDTH = 16;
/** 「完成」とみなす、なぞった線の合計長さ。キャンバス対角線の1.2倍を目安にする。 */
const COMPLETE_LENGTH_RATIO = 1.2;
const RESULT_TRANSITION_DELAY_MS = 400;

export function TraceScreen() {
  const { selectedNumberId, navigate, setLastArtworkUri, setLastStampResult } = useAppState();
  const [photo, setPhoto] = useState<Photo | null | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [canUndo, setCanUndo] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<{ pointerId: number; points: Point[] } | null>(null);
  const completeThresholdRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    getLastStrokeColor().then((c) => {
      if (c) setCurrentColor(c);
    });
  }, []);

  useEffect(() => {
    if (selectedNumberId == null) return;
    getPhotosByNumber(selectedNumberId).then(async (photos) => {
      if (photos.length === 0) {
        setPhoto(null);
        return;
      }
      const chosen = photos[Math.floor(Math.random() * photos.length)];
      const uri = await resolvePhotoUri(chosen.imagePath);
      setPhoto(chosen);
      setPhotoUri(uri);
    });
  }, [selectedNumberId]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !photoUri) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;

    completeThresholdRef.current = Math.hypot(rect.width, rect.height) * COMPLETE_LENGTH_RATIO;
  }, [photoUri]);

  const redraw = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  };

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // マルチタッチ無効化: 既になぞり中なら追加の指は無視する
    if (drawingRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = { pointerId: e.pointerId, points: [pointFromEvent(e)] };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    if (!drawing || drawing.pointerId !== e.pointerId) return;
    drawing.points.push(pointFromEvent(e));
    redraw();
    drawStroke(ctxRef.current!, { color: currentColor, width: STROKE_WIDTH, points: drawing.points });
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    if (!drawing || drawing.pointerId !== e.pointerId) return;
    drawingRef.current = null;
    if (drawing.points.length >= 2) {
      strokesRef.current.push({ color: currentColor, width: STROKE_WIDTH, points: drawing.points });
      setCanUndo(true);
      redraw();
      checkCompletion();
    }
  };

  const checkCompletion = () => {
    if (completedRef.current) return;
    if (totalStrokeLength(strokesRef.current) >= completeThresholdRef.current) {
      completedRef.current = true;
      window.setTimeout(() => void completeAndSave(), RESULT_TRANSITION_DELAY_MS);
    }
  };

  const completeAndSave = async () => {
    const wrap = wrapRef.current;
    const photoImg = photoImgRef.current;
    if (wrap && photoImg && photo) {
      const rect = wrap.getBoundingClientRect();
      const pngBase64 = compositeArtworkToPngBase64(
        photoImg,
        rect.width,
        rect.height,
        strokesRef.current,
      );
      const artwork = await saveArtwork({
        photoId: photo.id,
        numberId: photo.numberId,
        pngBase64,
        strokes: strokesRef.current,
      });
      const uri = await resolveArtworkUri(artwork.exportedImagePath);
      setLastArtworkUri(uri);
      const stampResult = await recordStampIfNeeded(photo.numberId);
      setLastStampResult(stampResult);
    }
    navigate('result');
  };

  const handleUndo = () => {
    strokesRef.current.pop();
    setCanUndo(strokesRef.current.length > 0);
    redraw();
  };

  const handleClearAll = () => {
    strokesRef.current = [];
    setCanUndo(false);
    redraw();
  };

  const handleSelectColor = (color: string) => {
    setCurrentColor(color);
    setLastStrokeColor(color);
  };

  if (photo === null) {
    return (
      <div className="trace-screen">
        <div className="trace-header">{selectedNumberId}を さがそう!</div>
        <div className="trace-canvas-wrap">
          <div className="trace-empty">
            まだ この すうじの しゃしんが ないよ。おうちのひとに とうろくしてもらおう!
          </div>
        </div>
        <div className="trace-toolbar">
          <div className="trace-buttons">
            <button type="button" className="trace-tool-button" onClick={() => navigate('home')}>
              ホームに もどる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-screen">
      <div className="trace-header">{selectedNumberId}を さがそう!</div>
      <div className="trace-canvas-wrap" ref={wrapRef}>
        {photoUri && <img ref={photoImgRef} className="trace-photo" src={photoUri} alt="" />}
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onPointerLeave={finishStroke}
        />
      </div>
      <div className="trace-toolbar">
        <div className="color-palette">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch${c === currentColor ? ' color-swatch--selected' : ''}`}
              style={{ background: c }}
              aria-label="いろを えらぶ"
              onClick={() => handleSelectColor(c)}
            />
          ))}
        </div>
        <div className="trace-buttons">
          <button
            type="button"
            className="trace-tool-button"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            やりなおす
          </button>
          <button
            type="button"
            className="trace-tool-button"
            onClick={handleClearAll}
            disabled={!canUndo}
          >
            ぜんぶ けす
          </button>
        </div>
      </div>
    </div>
  );
}
