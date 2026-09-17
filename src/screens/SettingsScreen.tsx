import { useAppState } from '../app/AppStateContext';
import './screens.css';

/**
 * 親モード。写真管理・音量・広告関連表示は後続Stepで実装する。
 */
export function SettingsScreen() {
  const { navigate, startTutorial } = useAppState();

  return (
    <div className="screen">
      <h1>せってい</h1>
      <p>(写真管理・音量・広告関連は後続Stepで実装)</p>
      <button type="button" className="screen-action-button" onClick={startTutorial}>
        あそびかたを もういちど みる
      </button>
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
