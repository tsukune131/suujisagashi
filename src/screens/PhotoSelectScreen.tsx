import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { childCopy } from '../copy/childCopy';
import { getPhotosByNumber, resolvePhotoUri } from '../data/photoRepository';
import type { Photo } from '../data/photoTypes';
import './PhotoSelectScreen.css';
import './screens.css';

interface PhotoWithUri extends Photo {
  uri: string;
}

/**
 * 数字を選んだ直後に挟む画面。その数字の写真が1枚だけなら即なぞり画面へ進み、
 * 2枚以上ある時だけサムネイルから選ばせる(1画面1アクションを崩さないため、
 * 選ぶ必要がある時だけこの画面を経由する)。
 */
export function PhotoSelectScreen() {
  const { selectedNumberId, selectPhoto, navigate } = useAppState();
  const [photos, setPhotos] = useState<PhotoWithUri[] | null>(null);

  useEffect(() => {
    if (selectedNumberId == null) return;
    let cancelled = false;
    getPhotosByNumber(selectedNumberId).then(async (list) => {
      if (list.length === 1) {
        selectPhoto(list[0].id);
        return;
      }
      const withUri = await Promise.all(
        list.map(async (p) => ({ ...p, uri: await resolvePhotoUri(p.thumbnailPath) })),
      );
      if (!cancelled) setPhotos(withUri);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNumberId]);

  if (photos === null) {
    // 0枚か1枚かまだ分からない間、または1枚で自動遷移する間は何も出さない
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
      <div className="photo-select-grid">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            className="photo-select-item"
            onClick={() => selectPhoto(p.id)}
          >
            <img src={p.uri} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
