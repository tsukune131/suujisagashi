import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAppState } from '../app/AppStateContext';
import tutorialCarUrl from '../assets/tutorial-car.svg';
import { NumberDots } from '../components/NumberDots';
import { TimerRing } from '../components/TimerRing';
import { childCopy } from '../copy/childCopy';
import { resolveArtworkUri, saveArtwork } from '../data/artworkRepository';
import { getLastStrokeColor, setLastStrokeColor } from '../data/drawingPrefs';
import { getPhotoById, resolvePhotoUri } from '../data/photoRepository';
import type { Photo } from '../data/photoTypes';
import { recordStampIfNeeded } from '../data/progressRepository';
import { compositeArtwork } from '../lib/compositeArtwork';
import { tutorialGuideCircle } from '../lib/coverLayout';
import { completionHapticFeedback } from '../lib/haptics';
import { refreshReminders } from '../lib/reminderSync';
import { createStamp, drawStamp, STAMP_FONT_SIZE_PX, type Stamp } from '../lib/stamps';
import { drawStroke, type Point, type Stroke } from '../lib/strokes';
import './TraceScreen.css';

const COLORS = ['#ff5b5b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#ff8fab'];
const DEFAULT_COLOR = COLORS[0];
const STROKE_WIDTH = 16;
const RESULT_TRANSITION_DELAY_MS = 400;
const TIMED_MODE_DURATION_MS = 60_000;
const TIMER_TICK_MS = 100;

type Tool = 'pen' | 'stamp';
type DrawAction = { kind: 'stroke'; stroke: Stroke } | { kind: 'stamp'; stamp: Stamp };

export function TraceScreen() {
  const {
    selectedNumberId,
    selectedPhotoId,
    traceMode,
    navigate,
    setLastArtworkUri,
    setLastStampResult,
    isTutorialActive,
    finishTutorial,
  } = useAppState();
  const [photo, setPhoto] = useState<Photo | null | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [canUndo, setCanUndo] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [guideStyle, setGuideStyle] = useState<CSSProperties | null>(null);
  const [remainingMs, setRemainingMs] = useState(TIMED_MODE_DURATION_MS);

  const wrapRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const actionsRef = useRef<DrawAction[]>([]);
  const drawingRef = useRef<{ pointerId: number; points: Point[] } | null>(null);
  const completingRef = useRef(false);

  useEffect(() => {
    getLastStrokeColor().then((c) => {
      if (c) setCurrentColor(c);
    });
  }, []);

  useEffect(() => {
    if (isTutorialActive) {
      setPhotoUri(tutorialCarUrl);
      return;
    }
    if (selectedPhotoId == null) {
      setPhoto(null);
      return;
    }
    getPhotoById(selectedPhotoId).then(async (chosen) => {
      if (!chosen) {
        setPhoto(null);
        return;
      }
      const uri = await resolvePhotoUri(chosen.imagePath);
      setPhoto(chosen);
      setPhotoUri(uri);
    });
  }, [selectedPhotoId, isTutorialActive]);

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

  // 60秒モード: 準備ができたらカウントダウンを始め、0になったら自動で完成させる
  useEffect(() => {
    if (traceMode !== 'timed' || !imageReady) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const remaining = Math.max(0, TIMED_MODE_DURATION_MS - (Date.now() - startedAt));
      setRemainingMs(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        triggerCompletion();
      }
    }, TIMER_TICK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceMode, imageReady]);

  const redraw = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const action of actionsRef.current) {
      if (action.kind === 'stroke') {
        drawStroke(ctx, action.stroke);
      } else {
        drawStamp(ctx, action.stamp, STAMP_FONT_SIZE_PX);
      }
    }
  };

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const triggerCompletion = () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setCompleting(true);
    window.setTimeout(() => void completeAndSave(), RESULT_TRANSITION_DELAY_MS);
  };

  const placeStamp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(e);
    actionsRef.current.push({
      kind: 'stamp',
      stamp: createStamp(point.x, point.y, currentColor, selectedNumberId ?? 0),
    });
    setCanUndo(true);
    redraw();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // 準備前・完成処理中は受け付けない。2本目以降の指は無視する(マルチタッチ無効化)
    if (!ctxRef.current || completing || drawingRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === 'stamp') {
      placeStamp(e);
      return;
    }
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
    actionsRef.current.push({
      kind: 'stroke',
      stroke: { color: currentColor, width: STROKE_WIDTH, points: drawing.points },
    });
    setCanUndo(true);
    redraw();
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
      const strokes = actionsRef.current
        .filter((a): a is { kind: 'stroke'; stroke: Stroke } => a.kind === 'stroke')
        .map((a) => a.stroke);
      const stamps = actionsRef.current
        .filter((a): a is { kind: 'stamp'; stamp: Stamp } => a.kind === 'stamp')
        .map((a) => a.stamp);
      try {
        const rect = wrap.getBoundingClientRect();
        const images = compositeArtwork(photoImg, rect.width, rect.height, strokes, stamps);
        const artwork = await saveArtwork({
          photoId: photo.id,
          numberId: photo.numberId,
          ...images,
          strokes,
          stamps,
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
    actionsRef.current.pop();
    setCanUndo(actionsRef.current.length > 0);
    redraw();
  };

  const handleClearAll = () => {
    actionsRef.current = [];
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
          <div className="trace-empty">{childCopy.photoSelect.emptyPhoto}</div>
        </div>
        <div className="trace-toolbar">
          <div className="trace-buttons">
            <button type="button" className="trace-tool-button" onClick={() => navigate('home')}>
              {childCopy.photoSelect.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-screen">
      <div className="trace-header">
        {isTutorialActive ? (
          childCopy.trace.tutorialPrompt
        ) : (
          <>
            {childCopy.trace.promptFor(selectedNumberId ?? 0)}
            <NumberDots count={selectedNumberId ?? 0} className="trace-header__dots" />
          </>
        )}
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
        {traceMode === 'timed' && (
          <div className="trace-timer">
            <TimerRing progress={remainingMs / TIMED_MODE_DURATION_MS} />
          </div>
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
        <div className="tool-toggle">
          <button
            type="button"
            className={`tool-toggle-button${tool === 'pen' ? ' tool-toggle-button--active' : ''}`}
            onClick={() => setTool('pen')}
          >
            ✏️ {childCopy.trace.penTool}
          </button>
          <button
            type="button"
            className={`tool-toggle-button${tool === 'stamp' ? ' tool-toggle-button--active' : ''}`}
            onClick={() => setTool('stamp')}
          >
            🔢 {childCopy.trace.stampTool}
          </button>
        </div>
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
          {traceMode === 'unlimited' && (
            <button
              type="button"
              className="trace-tool-button trace-tool-button--complete"
              onClick={triggerCompletion}
              disabled={completing}
            >
              {childCopy.trace.completeButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
