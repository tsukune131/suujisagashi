import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { ParentGateButton } from '../components/ParentGateButton';
import { getRegisteredNumberIds } from '../data/photoRepository';
import { getProgress } from '../data/progressRepository';
import type { Progress } from '../data/progressTypes';
import './screens.css';

const NUMBERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10

function roundLabel(progress: Progress): string {
  if (progress.lapCount > 0) {
    return `【${3 + progress.lapCount}しゅうめ】`;
  }
  return `いまは ${progress.currentCardRound}まいめ`;
}

export function HomeScreen() {
  const { selectNumber, navigate } = useAppState();
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    getRegisteredNumberIds().then(setRegistered);
    getProgress().then(setProgress);
  }, []);

  return (
    <div className="screen">
      <h1>すうじさがし</h1>
      {progress && <p className="round-badge">{roundLabel(progress)}</p>}
      <div className="number-grid">
        {NUMBERS.map((n) => {
          const isRegistered = registered.has(n);
          const isStamped = progress ? (progress.stamps[n] ?? 0) === progress.currentCardRound : false;
          const className = [
            'number-button',
            isRegistered && 'number-button--registered',
            isStamped && 'number-button--stamped',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={n} type="button" className={className} onClick={() => selectNumber(n)}>
              {n}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('gallery')}
      >
        ギャラリー
      </button>
      <ParentGateButton onActivate={() => navigate('register')} />
    </div>
  );
}
