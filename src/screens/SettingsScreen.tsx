import { useAppState } from '../app/AppStateContext';
import { parentCopy } from '../copy/parentCopy';
import './screens.css';

/**
 * 親モード。写真管理・音量・広告関連表示は後続Stepで実装する。
 */
export function SettingsScreen() {
  const { navigate, startTutorial } = useAppState();

  return (
    <div className="screen">
      <h1>{parentCopy.settings.title}</h1>
      <p>({parentCopy.settings.placeholderNote})</p>
      <button type="button" className="screen-action-button" onClick={startTutorial}>
        {parentCopy.settings.replayTutorial}
      </button>
      <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
        {parentCopy.settings.back}
      </button>
    </div>
  );
}
