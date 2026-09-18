import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { NumberDots } from '../components/NumberDots';
import { ParentGateButton } from '../components/ParentGateButton';
import { childCopy } from '../copy/childCopy';
import { getRegisteredNumberIds } from '../data/photoRepository';
import { ALL_NUMBER_IDS, isStamped, MAX_CARD_IMAGES } from '../data/progressLogic';
import { getProgress } from '../data/progressRepository';
import type { Progress } from '../data/progressTypes';
import { numberColorClass } from '../lib/numberColor';
import './screens.css';

function roundLabel(progress: Progress): string {
  return progress.cycle > MAX_CARD_IMAGES
    ? childCopy.home.lapLabel(progress.cycle)
    : childCopy.home.roundLabel(progress.cycle);
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
    <div className="screen screen--with-gate">
      <h1>{childCopy.home.title}</h1>
      {progress && <p className="round-badge">{roundLabel(progress)}</p>}
      <div className="number-grid">
        {ALL_NUMBER_IDS.map((n) => {
          const className = [
            'number-button',
            numberColorClass('number-button', n),
            registered.has(n) && 'number-button--registered',
            progress && isStamped(progress, n) && 'number-button--stamped',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={n} type="button" className={className} onClick={() => selectNumber(n)}>
              <span className="numeral">{n}</span>
              <NumberDots count={n} />
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
