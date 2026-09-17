import { useAppState } from '../app/AppStateContext';
import { ParentGateButton } from '../components/ParentGateButton';
import './screens.css';

const NUMBERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10

export function HomeScreen() {
  const { selectNumber, navigate } = useAppState();

  return (
    <div className="screen">
      <h1>すうじさがし</h1>
      <div className="number-grid">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            className="number-button"
            onClick={() => selectNumber(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('gallery')}
      >
        ギャラリー
      </button>
      <ParentGateButton onActivate={() => navigate('register')} />
    </div>
  );
}
