import { useAppState } from '../app/AppStateContext';
import { ParentGateButton } from '../components/ParentGateButton';
import './screens.css';

/**
 * 親モード。写真登録(機能1)は Step3 で実装する。Step2時点では
 * 骨組みと、設定画面への入口(歯車アイコン長押し)のみ用意する。
 */
export function RegisterScreen() {
  const { navigate } = useAppState();

  return (
    <div className="screen">
      <h1>しゃしんの とうろく</h1>
      <p>(フォトピッカー・数字タグ付けは Step3 で実装)</p>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('home')}
      >
        もどる
      </button>
      <ParentGateButton onActivate={() => navigate('settings')} />
    </div>
  );
}
