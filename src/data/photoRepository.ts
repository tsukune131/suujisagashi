import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import type { NumberId } from '../app/types';
import { resizeImageToBase64 } from '../lib/imageResize';
import type { Photo } from './photoTypes';

const PREFS_KEY = 'photos';
const PHOTOS_DIR = 'photos';
const IMAGE_LONG_EDGE = 1200;
const THUMBNAIL_LONG_EDGE = 320;

async function ensurePhotosDir(): Promise<void> {
  try {
    await Filesystem.mkdir({ path: PHOTOS_DIR, directory: Directory.Data, recursive: true });
  } catch {
    // 既に存在する場合は何もしない
  }
}

async function readAll(): Promise<Photo[]> {
  const { value } = await Preferences.get({ key: PREFS_KEY });
  if (!value) return [];
  return JSON.parse(value) as Photo[];
}

async function writeAll(photos: Photo[]): Promise<void> {
  await Preferences.set({ key: PREFS_KEY, value: JSON.stringify(photos) });
}

/**
 * 撮影/選択直後の写真(webPath)を、指定した数字に紐づけて保存する。
 * 写真本体・サムネイルをアプリ専用ディレクトリにコピーしてから、
 * メタデータをPreferencesに追記する(設計書「6. データモデル」のPhotoエンティティ)。
 */
export async function registerPhoto(webPath: string, numberId: NumberId): Promise<Photo> {
  await ensurePhotosDir();

  const id = crypto.randomUUID();
  const imagePath = `${PHOTOS_DIR}/${id}.jpg`;
  const thumbnailPath = `${PHOTOS_DIR}/${id}_thumb.jpg`;

  const [imageBase64, thumbnailBase64] = await Promise.all([
    resizeImageToBase64(webPath, IMAGE_LONG_EDGE),
    resizeImageToBase64(webPath, THUMBNAIL_LONG_EDGE),
  ]);

  await Filesystem.writeFile({ path: imagePath, data: imageBase64, directory: Directory.Data });
  await Filesystem.writeFile({
    path: thumbnailPath,
    data: thumbnailBase64,
    directory: Directory.Data,
  });

  const photo: Photo = {
    id,
    imagePath,
    thumbnailPath,
    numberId,
    createdAt: new Date().toISOString(),
  };

  const photos = await readAll();
  photos.push(photo);
  await writeAll(photos);

  return photo;
}

export async function getAllPhotos(): Promise<Photo[]> {
  return readAll();
}

export async function getPhotosByNumber(numberId: NumberId): Promise<Photo[]> {
  const photos = await readAll();
  return photos.filter((p) => p.numberId === numberId);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const photos = await readAll();
  return photos.find((p) => p.id === id) ?? null;
}

/** ホーム画面のバッジ表示用: 登録済みの数字一覧(重複なし)。 */
export async function getRegisteredNumberIds(): Promise<Set<NumberId>> {
  const photos = await readAll();
  return new Set(photos.map((p) => p.numberId));
}

/** Filesystemの相対パスを、<img src>で表示可能なURIに変換する。 */
export async function resolvePhotoUri(path: string): Promise<string> {
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Data });
  return Capacitor.convertFileSrc(uri);
}
