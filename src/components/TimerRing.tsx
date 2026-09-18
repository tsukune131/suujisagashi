import './TimerRing.css';

const SIZE = 56;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerRingProps {
  /** 残り時間の割合。1で満タン、0で空。 */
  progress: number;
}

/** 60秒モードの残り時間を示す、色が減っていく円形ゲージ。 */
export function TimerRing({ progress }: TimerRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="timer-ring">
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        className="timer-ring__track"
        strokeWidth={STROKE}
        fill="none"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        className="timer-ring__fill"
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  );
}
