import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NumberId, ScreenName } from './types';
import type { StampResult } from '../data/progressTypes';

interface AppState {
  screen: ScreenName;
  /** なぞり画面で対象にしている数字。ホームで選んでから TraceScreen に渡す。 */
  selectedNumberId: NumberId | null;
  /** 直近で保存した作品の表示用URI。ResultScreenの保存確認に使う。 */
  lastArtworkUri: string | null;
  /** 直近のスタンプ結果。0〜10コンプリート時のみ completedRound が true になる。 */
  lastStampResult: StampResult | null;
  navigate: (screen: ScreenName) => void;
  selectNumber: (numberId: NumberId) => void;
  setLastArtworkUri: (uri: string | null) => void;
  setLastStampResult: (result: StampResult | null) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [selectedNumberId, setSelectedNumberId] = useState<NumberId | null>(null);
  const [lastArtworkUri, setLastArtworkUri] = useState<string | null>(null);
  const [lastStampResult, setLastStampResult] = useState<StampResult | null>(null);

  const value = useMemo<AppState>(
    () => ({
      screen,
      selectedNumberId,
      lastArtworkUri,
      lastStampResult,
      navigate: setScreen,
      selectNumber: (numberId) => {
        setSelectedNumberId(numberId);
        setScreen('trace');
      },
      setLastArtworkUri,
      setLastStampResult,
    }),
    [screen, selectedNumberId, lastArtworkUri, lastStampResult],
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
