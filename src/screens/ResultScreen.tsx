import { useEffect } from 'react';
import { useAppState } from '../app/AppStateContext';
import './screens.css';

const AUTO_RETURN_MS = 3000;

/**
 * 完了演出(キャラクター拍手+声かけ+保存確認)。拍手演出のリッチ化は
 * Phase 2 スコープ(実装手順書 Step10.4 参照)。
 */
export function ResultScreen() {
  const { selectedNumberId, navigate, lastArtworkUri } = useAppState();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate('home'), AUTO_RETURN_MS);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="screen">
      <h1>{selectedNumberId}を みつけられたね!</h1>
      {lastArtworkUri && (
        <img
          src={lastArtworkUri}
          alt=""
          style={{ maxWidth: 240, maxHeight: 240, borderRadius: 16 }}
        />
      )}
      <p>ギャラリーに ほぞんしたよ</p>
    </div>
  );
}
