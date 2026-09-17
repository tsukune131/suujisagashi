import { useAppState } from '../app/AppStateContext';
import './screens.css';

/**
 * Step2時点では骨組みのみ。Artwork一覧表示(機能3)は Step5 で実装する。
 */
export function GalleryScreen() {
  const { navigate } = useAppState();

  return (
    <div className="screen">
      <h1>ギャラリー</h1>
      <p>(保存した作品の一覧は Step5 で実装)</p>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('home')}
      >
        もどる
      </button>
    </div>
  );
}
