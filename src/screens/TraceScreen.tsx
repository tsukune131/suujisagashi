import { useAppState } from '../app/AppStateContext';
import './screens.css';

/**
 * Step2時点では骨組みのみ。Canvas描画(機能2)は Step4 で実装する。
 */
export function TraceScreen() {
  const { selectedNumberId, navigate } = useAppState();

  return (
    <div className="screen">
      <h1>{selectedNumberId}を さがそう!</h1>
      <p>(なぞり描画は Step4 で実装)</p>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('result')}
      >
        できた!(仮)
      </button>
    </div>
  );
}
