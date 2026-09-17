import type { NumberId } from '../app/types';

export interface Artwork {
  id: string;
  photoId: string;
  numberId: NumberId;
  /** Filesystem上のパス(Directory.Data基準の相対パス)。元写真+描画レイヤーの合成PNG。 */
  exportedImagePath: string;
  createdAt: string;
}
