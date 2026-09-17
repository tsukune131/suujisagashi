import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob';
import { incrementInterstitialCounter, resetInterstitialCounter } from '../data/adPrefs';
import { getLastKnownIsPro } from '../data/proPrefs';
import { BANNER_AD_UNIT_ID, INTERSTITIAL_AD_UNIT_ID, INTERSTITIAL_FREQUENCY } from './adConfig';
import { isNativeApp } from './platform';

let initialized = false;

/**
 * アプリ起動時に1度だけ呼ぶ。子供向けタグ(COPPA)とコンテンツレーティング上限を
 * 設定し、パーソナライズ広告を使わない方針(設計書「8. 収益化(広告)設計」)を
 * SDKレベルでも徹底する。
 */
export async function initializeAds(): Promise<void> {
  if (!isNativeApp || initialized) return;
  initialized = true;
  try {
    await AdMob.initialize({
      initializeForTesting: true,
      tagForChildDirectedTreatment: true,
      maxAdContentRating: MaxAdContentRating.General,
    });
  } catch {
    // 広告SDK初期化に失敗しても、アプリ本体の利用は継続できるようにする
  }
}

/** Home/Galleryの下帯固定バナー。広告非表示プラン購入済みなら何もしない。 */
export async function showBottomBanner(): Promise<void> {
  if (!isNativeApp || (await getLastKnownIsPro())) return;
  try {
    await AdMob.showBanner({
      adId: BANNER_AD_UNIT_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: true,
      npa: true,
    });
  } catch {
    // 通信環境がない・広告在庫がない等でも致命的にしない
  }
}

export async function hideBottomBanner(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await AdMob.removeBanner();
  } catch {
    // バナー未表示の状態で呼ばれても無視する
  }
}

/**
 * 完了演出→ホーム戻りのタイミングで呼ぶ。N回に1回だけ表示する
 * (完了演出の直後には割り込ませない。設計書「8. 収益化(広告)設計」)。
 */
export async function maybeShowInterstitialAfterResult(): Promise<void> {
  if (!isNativeApp || (await getLastKnownIsPro())) return;
  const count = await incrementInterstitialCounter();
  if (count < INTERSTITIAL_FREQUENCY) return;
  await resetInterstitialCounter();
  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_AD_UNIT_ID,
      isTesting: true,
      npa: true,
    });
    await AdMob.showInterstitial();
  } catch {
    // 広告読み込み失敗時はそのままホームへ戻る(呼び出し側でnavigateする)
  }
}
