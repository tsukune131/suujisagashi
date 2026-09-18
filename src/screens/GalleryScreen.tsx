import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { childCopy } from '../copy/childCopy';
import { getAllArtworks, resolveArtworkUri } from '../data/artworkRepository';
import type { Artwork } from '../data/artworkTypes';
import { numberColorClass } from '../lib/numberColor';
import './GalleryScreen.css';

const NUMBER_FILTERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10
type SortOrder = 'new' | 'old';

interface ArtworkWithUri extends Artwork {
  uri: string;
}

export function GalleryScreen() {
  const { navigate } = useAppState();
  const [artworks, setArtworks] = useState<ArtworkWithUri[]>([]);
  const [numberFilter, setNumberFilter] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('new');

  useEffect(() => {
    getAllArtworks().then(async (list) => {
      const withUri = await Promise.all(
        list.map(async (a) => ({ ...a, uri: await resolveArtworkUri(a.thumbnailPath) })),
      );
      setArtworks(withUri);
    });
  }, []);

  const visible = useMemo(() => {
    const filtered =
      numberFilter === 'all' ? artworks : artworks.filter((a) => a.numberId === numberFilter);
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'new' ? -diff : diff;
    });
  }, [artworks, numberFilter, sortOrder]);

  return (
    <div className="gallery-screen">
      <h1 className="gallery-header">{childCopy.gallery.title}</h1>
      <div className="gallery-filter-row">
        <button
          type="button"
          className={`gallery-filter-button${numberFilter === 'all' ? ' gallery-filter-button--active' : ''}`}
          onClick={() => setNumberFilter('all')}
        >
          {childCopy.gallery.all}
        </button>
        {NUMBER_FILTERS.map((n) => (
          <button
            key={n}
            type="button"
            className={`gallery-filter-button${numberFilter === n ? ` gallery-filter-button--active ${numberColorClass('gallery-filter-button', n)}` : ''}`}
            onClick={() => setNumberFilter(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="gallery-sort-row">
        <button
          type="button"
          className="gallery-filter-button"
          onClick={() => setSortOrder((s) => (s === 'new' ? 'old' : 'new'))}
        >
          {sortOrder === 'new' ? childCopy.gallery.sortNew : childCopy.gallery.sortOld}
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="gallery-empty">{childCopy.gallery.empty}</div>
      ) : (
        <div className="gallery-grid">
          {visible.map((a) => (
            <div key={a.id} className="gallery-item">
              <img src={a.uri} alt="" />
              <span className="gallery-item-badge">{a.numberId}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="gallery-filter-button" onClick={() => navigate('home')}>
        {childCopy.gallery.backHome}
      </button>
    </div>
  );
}
