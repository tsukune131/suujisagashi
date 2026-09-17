import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { ParentGateButton } from '../components/ParentGateButton';
import { childCopy } from '../copy/childCopy';
import { getRegisteredNumberIds } from '../data/photoRepository';
import { getProgress } from '../data/progressRepository';
import type { Progress } from '../data/progressTypes';
import { useBottomBannerAd } from '../lib/useBottomBannerAd';
import './screens.css';

const NUMBERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10

function roundLabel(progress: Progress): string {
  if (progress.lapCount > 0) {
    return childCopy.home.lapLabel(3 + progress.lapCount);
  }
  return childCopy.home.roundLabel(progress.currentCardRound);
}

export function HomeScreen() {
  const { selectNumber, navigate } = useAppState();
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Progress | null>(null);

  useBottomBannerAd();

  useEffect(() => {
    getRegisteredNumberIds().then(setRegistered);
    getProgress().then(setProgress);
  }, []);

  return (
    <div className="screen">
      <h1>{childCopy.home.title}</h1>
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
      <button type="button" className="screen-action-button" onClick={() => navigate('gallery')}>
        {childCopy.home.gallery}
      </button>
      <ParentGateButton onActivate={() => navigate('register')} />
    </div>
  );
}
