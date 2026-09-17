import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NumberId, ScreenName } from './types';
import type { StampResult } from '../data/progressTypes';
import { getHasSeenTutorial, setHasSeenTutorial } from '../data/tutorialPrefs';
import { initializeAds } from '../lib/ads';
import { refreshReminders } from '../lib/reminderSync';

const TUTORIAL_NUMBER_ID: NumberId = 0;

interface AppState {
  screen: ScreenName;
  /** アプリ起動時のチュートリアル要否チェックが終わったか。終わるまで画面を描画しない。 */
  booted: boolean;
  /** なぞり画面で対象にしている数字。ホームで選んでから TraceScreen に渡す。 */
  selectedNumberId: NumberId | null;
  /** 直近で保存した作品の表示用URI。ResultScreenの保存確認に使う。 */
  lastArtworkUri: string | null;
  /** 直近のスタンプ結果。0〜10コンプリート時のみ completedRound が true になる。 */
  lastStampResult: StampResult | null;
  /** 今なぞっているのが同梱チュートリアル(くるまのしゃしん)かどうか。 */
  isTutorialActive: boolean;
  /** チュートリアル完了直後の1回だけ true。ResultScreenが読み終えたらリセットする。 */
  justCompletedTutorial: boolean;
  navigate: (screen: ScreenName) => void;
  selectNumber: (numberId: NumberId) => void;
  setLastArtworkUri: (uri: string | null) => void;
  setLastStampResult: (result: StampResult | null) => void;
  /** 設定画面の「あそびかたを もういちど みる」から呼ぶ。 */
  startTutorial: () => void;
  /** チュートリアルのなぞりが完成した時に呼ぶ。hasSeenTutorialを永続化する。 */
  finishTutorial: () => void;
  clearJustCompletedTutorial: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [booted, setBooted] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState<NumberId | null>(null);
  const [lastArtworkUri, setLastArtworkUri] = useState<string | null>(null);
  const [lastStampResult, setLastStampResult] = useState<StampResult | null>(null);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [justCompletedTutorial, setJustCompletedTutorial] = useState(false);

  useEffect(() => {
    void initializeAds();
    getHasSeenTutorial().then((seen) => {
      if (!seen) {
        setSelectedNumberId(TUTORIAL_NUMBER_ID);
        setIsTutorialActive(true);
        setScreen('trace');
      } else {
        void refreshReminders();
      }
      setBooted(true);
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      screen,
      booted,
      selectedNumberId,
      lastArtworkUri,
      lastStampResult,
      isTutorialActive,
      justCompletedTutorial,
      navigate: setScreen,
      selectNumber: (numberId) => {
        setSelectedNumberId(numberId);
        setScreen('trace');
      },
      setLastArtworkUri,
      setLastStampResult,
      startTutorial: () => {
        setSelectedNumberId(TUTORIAL_NUMBER_ID);
        setIsTutorialActive(true);
        setScreen('trace');
      },
      finishTutorial: () => {
        void setHasSeenTutorial();
        setIsTutorialActive(false);
        setJustCompletedTutorial(true);
        void refreshReminders();
      },
      clearJustCompletedTutorial: () => setJustCompletedTutorial(false),
    }),
    [screen, booted, selectedNumberId, lastArtworkUri, lastStampResult, isTutorialActive, justCompletedTutorial],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState は AppStateProvider の内側でのみ使用できます');
  }
  return ctx;
}
