export type ScreenName =
  | 'home'
  | 'photoSelect'
  | 'trace'
  | 'result'
  | 'gallery'
  | 'register'
  | 'settings';

/** 0〜10。将来の拡張(Phase 4: 11以降)を見据えて number 型のまま持つ。 */
export type NumberId = number;
