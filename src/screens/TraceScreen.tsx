import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAppState } from '../app/AppStateContext';
import tutorialCarUrl from '../assets/tutorial-car.svg';
import { childCopy } from '../copy/childCopy';
import { resolveArtworkUri, saveArtwork } from '../data/artworkRepository';
import { getLastStrokeColor, setLastStrokeColor } from '../data/drawingPrefs';
import { getPhotosByNumber, resolvePhotoUri } from '../data/photoRepository';
import type { Photo } from '../data/photoTypes';
import { recordStampIfNeeded } from '../data/progressRepository';
import { compositeArtwork } from '../lib/compositeArtwork';
import { tutorialGuideCircle } from '../lib/coverLayout';
import { completionHapticFeedback } from '../lib/haptics';
import { refreshReminders } from '../lib/reminderSync';
import { drawStroke, totalStrokeLength, type Point, type Stroke } from '../lib/strokes';
import './TraceScreen.css';

const COLORS = ['#ff5b5b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#ff8fab'];
const DEFAULT_COLOR = COLORS[0];
const STROKE_WIDTH = 16;
/** 「完成」とみなす、なぞった線の合計長さ。キャンバス対角線の1.2倍を目安にする。 */
const COMPLETE_LENGTH_RATIO = 1.2;
const RESULT_TRANSITION_DELAY_MS = 400;

export function TraceScreen() {
  const {
    selectedNumberId,
    navigate,
    setLastArtworkUri,
    setLastStampResult,
    isTutorialActive,
    finishTutorial,
  } = useAppState();
  const [photo, setPhoto] = useState<Photo | null | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [canUndo, setCanUndo] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [guideStyle, setGuideStyle] = useState<CSSProperties | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<{ pointerId: number; points: Point[] } | null>(null);
  const completeThresholdRef = useRef(Number.POSITIVE_INFINITY);

  useEffect(() => {
    getLastStrokeColor().then((c) => {
      if (c) setCurrentColor(c);
    });
  }, []);

  useEffect(() => {
    if (selectedNumberId == null) return;
    if (isTutorialActive) {
      setPhotoUri(tutorialCarUrl);
      return;
    }
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
  }, [selectedNumberId, isTutorialActive]);

  // 画像のデコードが終わるまではキャンバスを用意せず、なぞりも完成判定も受け付けない
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const img = photoImgRef.current;
    if (!imageReady || !wrap || !canvas || !img) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    completeThresholdRef.current = Math.hypot(rect.width, rect.height) * COMPLETE_LENGTH_RATIO;

    if (isTutorialActive) {
      const circle = tutorialGuideCircle(img.naturalWidth, img.naturalHeight, rect.width, rect.height);
      setGuideStyle({
        left: circle.x,
        top: circle.y,
        width: circle.diameter,
        height: circle.diameter,
      });
    }
  }, [imageReady, isTutorialActive]);

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
    // 準備前・完成処理中は描かせない。なぞり中の2本目以降の指は無視する(マルチタッチ無効化)
    if (!ctxRef.current || completing || drawingRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = { pointerId: e.pointerId, points: [pointFromEvent(e)] };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    const ctx = ctxRef.current;
    if (!drawing || !ctx || drawing.pointerId !== e.pointerId) return;
    drawing.points.push(pointFromEvent(e));
    redraw();
    drawStroke(ctx, { color: currentColor, width: STROKE_WIDTH, points: drawing.points });
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    if (!drawing || drawing.pointerId !== e.pointerId) return;
    drawingRef.current = null;
    if (drawing.points.length < 2) return;
    strokesRef.current.push({ color: currentColor, width: STROKE_WIDTH, points: drawing.points });
    setCanUndo(true);
    redraw();
    if (totalStrokeLength(strokesRef.current) >= completeThresholdRef.current) {
      setCompleting(true);
      window.setTimeout(() => void completeAndSave(), RESULT_TRANSITION_DELAY_MS);
    }
  };

  const completeAndSave = async () => {
    void completionHapticFeedback();
    if (isTutorialActive) {
      finishTutorial();
      navigate('result');
      return;
    }

    const wrap = wrapRef.current;
    const photoImg = photoImgRef.current;
    if (wrap && photoImg && photo) {
      const strokes = strokesRef.current.slice();
      try {
        const rect = wrap.getBoundingClientRect();
        const images = compositeArtwork(photoImg, rect.width, rect.height, strokes);
        const artwork = await saveArtwork({
          photoId: photo.id,
          numberId: photo.numberId,
          ...images,
          strokes,
        });
        setLastArtworkUri(await resolveArtworkUri(artwork.thumbnailPath));
        setLastStampResult(await recordStampIfNeeded(photo.numberId));
        void refreshReminders();
      } catch {
        // 保存できなくても子どもの体験は止めない。結果画面は「保存した」と表示しない
      }
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
    void setLastStrokeColor(color);
  };

  if (!isTutorialActive && photo === null) {
    return (
      <div className="trace-screen">
        <div className="trace-header">{childCopy.trace.promptFor(selectedNumberId ?? 0)}</div>
        <div className="trace-canvas-wrap">
          <div className="trace-empty">{childCopy.trace.emptyPhoto}</div>
        </div>
        <div className="trace-toolbar">
          <div className="trace-buttons">
            <button type="button" className="trace-tool-button" onClick={() => navigate('home')}>
              {childCopy.trace.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-screen">
      <div className="trace-header">
        {isTutorialActive
          ? childCopy.trace.tutorialPrompt
          : childCopy.trace.promptFor(selectedNumberId ?? 0)}
      </div>
      <div className="trace-canvas-wrap" ref={wrapRef}>
        {photoUri && (
          <img
            ref={photoImgRef}
            className="trace-photo"
            src={photoUri}
            alt=""
            onLoad={() => setImageReady(true)}
          />
        )}
        {isTutorialActive && !canUndo && guideStyle && (
          <div className="tutorial-guide-ring" style={guideStyle} />
        )}
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
              aria-label={childCopy.trace.colorSwatchLabel}
              onClick={() => handleSelectColor(c)}
            />
          ))}
        </div>
        <div className="trace-buttons">
          <button
            type="button"
            className="trace-tool-button"
            onClick={handleUndo}
            disabled={!canUndo || completing}
          >
            {childCopy.trace.undo}
          </button>
          <button
            type="button"
            className="trace-tool-button"
            onClick={handleClearAll}
            disabled={!canUndo || completing}
          >
            {childCopy.trace.clearAll}
          </button>
        </div>
      </div>
    </div>
  );
}
