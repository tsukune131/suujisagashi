import { useEffect } from 'react';
import { useAppState } from '../app/AppStateContext';
import './screens.css';

const AUTO_RETURN_MS = 3000;

/**
 * 完了演出(キャラクター拍手+声かけ+保存確認)。Step2時点では骨組みのみ、
 * 演出のリッチ化は Phase 2 スコープ(実装手順書 Step10.4 参照)。
 */
export function ResultScreen() {
  const { selectedNumberId, navigate } = useAppState();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate('home'), AUTO_RETURN_MS);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="screen">
      <h1>{selectedNumberId}を みつけられたね!</h1>
      <p>(拍手演出は Step6/Step7 で実装)</p>
    </div>
  );
}
