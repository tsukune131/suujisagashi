import type { NumberId } from '../app/types';

export interface Photo {
  id: string;
  /** Filesystem上のパス(Directory.Data基準の相対パス)。 */
  imagePath: string;
  thumbnailPath: string;
  numberId: NumberId;
  createdAt: string;
}
