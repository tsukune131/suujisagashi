import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import type { TraceMode } from '../app/types';
import { childCopy } from '../copy/childCopy';
import { getPhotosByNumber, resolvePhotoUri } from '../data/photoRepository';
import type { Photo } from '../data/photoTypes';
import './PhotoSelectScreen.css';
import './screens.css';

const DEFAULT_MODE: TraceMode = 'timed';

interface PhotoWithUri extends Photo {
  uri: string;
}

/**
 * 数字を選んだ直後に挟む画面。ここで「60びょう/せいげんなし」を選び、
 * 写真をタップして確定する。写真が1枚だけでも必ず表示する
 * (モード選択と同時に写真を一度も見せずに進めると、どの写真でなぞるのか
 * 確認できないまま画面が切り替わってしまう)。
 */
export function PhotoSelectScreen() {
  const { selectedNumberId, selectPhoto, navigate } = useAppState();
  const [photos, setPhotos] = useState<PhotoWithUri[] | null>(null);
  const [mode, setMode] = useState<TraceMode>(DEFAULT_MODE);

  useEffect(() => {
    if (selectedNumberId == null) return;
    let cancelled = false;
    getPhotosByNumber(selectedNumberId).then(async (list) => {
      const withUri = await Promise.all(
        list.map(async (p) => ({ ...p, uri: await resolvePhotoUri(p.thumbnailPath) })),
      );
      if (!cancelled) setPhotos(withUri);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedNumberId]);

  if (photos === null) {
    // まだ写真の一覧を取得中
    return null;
  }

  if (photos.length === 0) {
    return (
      <div className="screen">
        <p>{childCopy.photoSelect.emptyPhoto}</p>
        <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
          {childCopy.photoSelect.backHome}
        </button>
      </div>
    );
  }

  return (
    <div className="photo-select-screen">
      <h1>{childCopy.photoSelect.title(selectedNumberId ?? 0)}</h1>
      <div className="photo-select-mode-toggle">
        <button
          type="button"
          className={`photo-select-mode-button${mode === 'timed' ? ' photo-select-mode-button--active' : ''}`}
          onClick={() => setMode('timed')}
        >
          ⏱ {childCopy.photoSelect.modeTimed}
        </button>
        <button
          type="button"
          className={`photo-select-mode-button${mode === 'unlimited' ? ' photo-select-mode-button--active' : ''}`}
          onClick={() => setMode('unlimited')}
        >
          ♾ {childCopy.photoSelect.modeUnlimited}
        </button>
      </div>
      <div className="photo-select-grid">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            className="photo-select-item"
            onClick={() => selectPhoto(p.id, mode)}
          >
            <img src={p.uri} alt="" />
          </button>
        ))}
      </div>
      <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
        {childCopy.photoSelect.backHome}
      </button>
    </div>
  );
}
