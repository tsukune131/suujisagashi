import { useRef } from 'react';
import './ParentGateButton.css';

const LONG_PRESS_MS = 900;

interface ParentGateButtonProps {
  onActivate: () => void;
  /** アイコンの見た目だけ変えられるように(ホームは歯車、登録画面内も歯車で統一)。 */
  label?: string;
}

/**
 * 子供が誤って親モードに入らないよう、長押しでのみ反応するボタン。
 * 画面の隅に小さく配置する前提(設計書 4-2. コインゲーム風シンプル構成)。
 */
export function ParentGateButton({ onActivate, label = '⚙' }: ParentGateButtonProps) {
  const timerRef = useRef<number | null>(null);

  const start = () => {
    timerRef.current = window.setTimeout(onActivate, LONG_PRESS_MS);
  };

  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      className="parent-gate-button"
      aria-label="おうちのひと用メニュー"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      {label}
    </button>
  );
}
