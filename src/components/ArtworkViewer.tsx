import { useState } from 'react';
import { childCopy } from '../copy/childCopy';
import { parentCopy } from '../copy/parentCopy';
import { deleteArtwork } from '../data/artworkRepository';
import './ArtworkViewer.css';
import { ParentGateButton } from './ParentGateButton';

interface ArtworkViewerProps {
  artworkId: string;
  uri: string;
  onClose: () => void;
  onDeleted: (artworkId: string) => void;
}

/**
 * ギャラリーのサムネイルをタップした時に開く、1枚だけの拡大表示。
 * 画像そのものを長押しするとiOS標準の「写真に追加」が出せるため、
 * それを案内する文言を添える(アプリ側で保存処理は行わない)。
 * 削除は取り消せないため、保護者確認(長押し+かけ算)の先に確認ダイアログを挟む。
 */
export function ArtworkViewer({ artworkId, uri, onClose, onDeleted }: ArtworkViewerProps) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    await deleteArtwork(artworkId);
    onDeleted(artworkId);
  };

  return (
    <div className="artwork-viewer-overlay" role="dialog" aria-modal="true">
      <button type="button" className="artwork-viewer-close" onClick={onClose}>
        ✕ {childCopy.gallery.close}
      </button>
      <img className="artwork-viewer-image" src={uri} alt="" />
      <p className="artwork-viewer-hint">{childCopy.gallery.saveHint}</p>
      <ParentGateButton onActivate={() => setConfirming(true)} label={parentCopy.gallery.deleteLabel} />
      {confirming && (
        <div className="artwork-viewer-confirm-overlay">
          <div className="artwork-viewer-confirm-dialog">
            <p>{parentCopy.gallery.deleteConfirm}</p>
            <div className="artwork-viewer-confirm-actions">
              <button type="button" onClick={() => setConfirming(false)}>
                {parentCopy.gallery.deleteConfirmNo}
              </button>
              <button type="button" className="artwork-viewer-confirm-delete" onClick={handleDelete}>
                {parentCopy.gallery.deleteConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
