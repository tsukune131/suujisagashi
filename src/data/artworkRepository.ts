import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import type { NumberId } from '../app/types';
import type { Stamp } from '../lib/stamps';
import type { Stroke } from '../lib/strokes';
import type { Artwork } from './artworkTypes';

const ARTWORKS_DIR = 'artworks';
const ARTWORKS_PREFS_KEY = 'artworks';

async function ensureArtworksDir(): Promise<void> {
  try {
    await Filesystem.mkdir({ path: ARTWORKS_DIR, directory: Directory.Data, recursive: true });
  } catch {
    // 既に存在する場合は何もしない
  }
}

async function readArtworks(): Promise<Artwork[]> {
  const { value } = await Preferences.get({ key: ARTWORKS_PREFS_KEY });
  return value ? (JSON.parse(value) as Artwork[]) : [];
}

interface SaveArtworkParams {
  photoId: string;
  numberId: NumberId;
  /** dataURLのprefixを除いたbase64文字列(JPEG)。 */
  imageBase64: string;
  thumbnailBase64: string;
  strokes: Stroke[];
  stamps: Stamp[];
}

/**
 * 画像と描画データ(TraceDrawing相当、将来の再編集用。線とスタンプの両方)は
 * ファイルに書き、Preferences(UserDefaults)には小さなメタデータだけを置く。
 */
export async function saveArtwork(params: SaveArtworkParams): Promise<Artwork> {
  await ensureArtworksDir();

  const id = crypto.randomUUID();
  const artwork: Artwork = {
    id,
    photoId: params.photoId,
    numberId: params.numberId,
    exportedImagePath: `${ARTWORKS_DIR}/${id}.jpg`,
    thumbnailPath: `${ARTWORKS_DIR}/${id}_thumb.jpg`,
    createdAt: new Date().toISOString(),
  };

  await Filesystem.writeFile({
    path: artwork.exportedImagePath,
    data: params.imageBase64,
    directory: Directory.Data,
  });
  await Filesystem.writeFile({
    path: artwork.thumbnailPath,
    data: params.thumbnailBase64,
    directory: Directory.Data,
  });
  await Filesystem.writeFile({
    path: `${ARTWORKS_DIR}/${id}.drawing.json`,
    data: JSON.stringify({ strokes: params.strokes, stamps: params.stamps }),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  });

  const artworks = await readArtworks();
  artworks.push(artwork);
  await Preferences.set({ key: ARTWORKS_PREFS_KEY, value: JSON.stringify(artworks) });

  return artwork;
}

export async function getAllArtworks(): Promise<Artwork[]> {
  return readArtworks();
}

export async function resolveArtworkUri(path: string): Promise<string> {
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Data });
  return Capacitor.convertFileSrc(uri);
}
