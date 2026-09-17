import { useEffect } from 'react';
import { useAppState } from '../app/AppStateContext';
import './screens.css';

const AUTO_RETURN_MS = 3000;
const COMPLETE_AUTO_RETURN_MS = 5000;
const TUTORIAL_AUTO_ADVANCE_MS = 3500;

/**
 * 完了演出(キャラクター拍手+声かけ+保存確認)。拍手演出のリッチ化は
 * Phase 2 スコープ(実装手順書 Step10.4 参照)。
 * 0〜10すべてのスタンプが揃った時は、通常より大きな祝福演出を表示する
 * (設計書「機能4: 達成スタンプ表示」)。
 * チュートリアル完了直後は、写真登録画面へ自然に誘導する
 * (設計書「2-0. 初回チュートリアル」)。
 */
export function ResultScreen() {
  const {
    selectedNumberId,
    navigate,
    lastArtworkUri,
    lastStampResult,
    justCompletedTutorial,
    clearJustCompletedTutorial,
  } = useAppState();
  const isComplete = lastStampResult?.completedRound ?? false;

  useEffect(() => {
    if (justCompletedTutorial) {
      const timer = window.setTimeout(() => {
        clearJustCompletedTutorial();
        navigate('register');
      }, TUTORIAL_AUTO_ADVANCE_MS);
      return () => window.clearTimeout(timer);
    }
    const delay = isComplete ? COMPLETE_AUTO_RETURN_MS : AUTO_RETURN_MS;
    const timer = window.setTimeout(() => navigate('home'), delay);
    return () => window.clearTimeout(timer);
  }, [navigate, isComplete, justCompletedTutorial, clearJustCompletedTutorial]);

  if (justCompletedTutorial) {
    return (
      <div className="screen">
        <h1>{selectedNumberId}を みつけられたね!</h1>
        <p>じゃあ じぶんの しゃしんで やってみよう!</p>
      </div>
    );
  }

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
      {isComplete && (
        <div className="complete-celebration">
          <p className="complete-celebration__title">🎉 ぜんぶの すうじが みつかったね! 🎉</p>
          <p>すごいすごい!</p>
        </div>
      )}
    </div>
  );
}
