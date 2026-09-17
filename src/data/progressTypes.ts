import type { NumberId } from '../app/types';

export interface Progress {
  /** numberId → 最後にスタンプを獲得したカード回数。0は未獲得。 */
  stamps: Record<NumberId, number>;
  /** 現在作成中のカード回数(1〜3)。 */
  currentCardRound: number;
  /** 3枚目のカードを使い回した回数(4週目以降のラベルに使う)。 */
  lapCount: number;
}

export interface StampResult {
  isNewStamp: boolean;
  /** 0〜10すべてが今回のカード回数分揃った瞬間だけ true。 */
  completedRound: boolean;
  currentCardRound: number;
  lapCount: number;
}
