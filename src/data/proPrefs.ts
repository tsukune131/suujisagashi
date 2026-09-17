import { Preferences } from '@capacitor/preferences';

const IS_PRO_KEY = 'isProPurchased';

/**
 * 直近に確認できた購入状態。StoreKitに問い合わせられない(圏外・機内モード等)
 * 場合のフォールバックに使う(iap-onetime: 「確認失敗時にfalseへ倒さない」)。
 */
export async function getLastKnownIsPro(): Promise<boolean> {
  const { value } = await Preferences.get({ key: IS_PRO_KEY });
  return value === 'true';
}

export async function setLastKnownIsPro(isPro: boolean): Promise<void> {
  await Preferences.set({ key: IS_PRO_KEY, value: String(isPro) });
}
