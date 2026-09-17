import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import type { NumberId } from '../app/types';
import type { Stroke } from '../lib/strokes';
import type { Artwork } from './artworkTypes';

const ARTWORKS_DIR = 'artworks';
const ARTWORKS_PREFS_KEY = 'artworks';
/** TraceDrawing相当: Artwork.id → ストローク配列。将来の再編集に備えて別途保持する。 */
const STROKES_PREFS_KEY = 'artworkStrokes';

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

async function writeArtworks(artworks: Artwork[]): Promise<void> {
  await Preferences.set({ key: ARTWORKS_PREFS_KEY, value: JSON.stringify(artworks) });
}

async function readStrokesMap(): Promise<Record<string, Stroke[]>> {
  const { value } = await Preferences.get({ key: STROKES_PREFS_KEY });
  return value ? (JSON.parse(value) as Record<string, Stroke[]>) : {};
}

interface SaveArtworkParams {
  photoId: string;
  numberId: NumberId;
  /** dataURLのprefixを除いたbase64文字列(PNG)。 */
  pngBase64: string;
  strokes: Stroke[];
}

export async function saveArtwork(params: SaveArtworkParams): Promise<Artwork> {
  await ensureArtworksDir();

  const id = crypto.randomUUID();
  const exportedImagePath = `${ARTWORKS_DIR}/${id}.png`;
  await Filesystem.writeFile({
    path: exportedImagePath,
    data: params.pngBase64,
    directory: Directory.Data,
  });

  const artwork: Artwork = {
    id,
    photoId: params.photoId,
    numberId: params.numberId,
    exportedImagePath,
    createdAt: new Date().toISOString(),
  };

  const artworks = await readArtworks();
  artworks.push(artwork);
  await writeArtworks(artworks);

  const strokesMap = await readStrokesMap();
  strokesMap[id] = params.strokes;
  await Preferences.set({ key: STROKES_PREFS_KEY, value: JSON.stringify(strokesMap) });

  return artwork;
}

export async function getAllArtworks(): Promise<Artwork[]> {
  return readArtworks();
}

export async function resolveArtworkUri(path: string): Promise<string> {
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Data });
  return Capacitor.convertFileSrc(uri);
}
