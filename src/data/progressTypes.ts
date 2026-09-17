import type { NumberId } from '../app/types';

export interface Progress {
  /** numberId → 最後にスタンプを獲得した周回(cycle)。0は未獲得。 */
  stamps: Record<NumberId, number>;
  /** 現在集めている周回。1から始まり、コンプリートのたびに上限なく+1される。 */
  cycle: number;
}

export interface StampResult {
  isNewStamp: boolean;
  /** 0〜10すべてが今の周回で揃った瞬間だけ true。 */
  completedRound: boolean;
  /** 記録後の周回(コンプリート時は次の周回)。 */
  cycle: number;
}
