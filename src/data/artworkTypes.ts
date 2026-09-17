import type { NumberId } from '../app/types';

export interface Artwork {
  id: string;
  photoId: string;
  numberId: NumberId;
  /** Filesystem上のパス(Directory.Data基準)。元写真+描画レイヤーの合成JPEG。 */
  exportedImagePath: string;
  /** ギャラリー・結果画面の表示用(長辺320px)。 */
  thumbnailPath: string;
  createdAt: string;
}
