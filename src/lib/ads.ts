import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob';
import { incrementInterstitialCounter, resetInterstitialCounter } from '../data/adPrefs';
import { getLastKnownIsPro } from '../data/proPrefs';
import {
  AD_UNIT_IDS,
  BANNER_CLEARANCE_PX,
  INTERSTITIAL_FREQUENCY,
  USE_TEST_ADS,
} from './adConfig';
import { isNativeApp } from './platform';

let initPromise: Promise<void> | null = null;
/** show/hide が非同期に交差しても、最後に要求された状態だけを反映するための世代番号。 */
let bannerGeneration = 0;

/**
 * バナーはWebViewの上に重ねて表示されるため、その高さ+余白を CSS 変数に反映し、
 * 画面側で下端のボタンを押し上げる。
 */
function setBannerOffset(heightPx: number): void {
  const offset = heightPx > 0 ? heightPx + BANNER_CLEARANCE_PX : 0;
  document.documentElement.style.setProperty('--banner-offset', `${offset}px`);
}

/**
 * 子供向けタグ(COPPA)とコンテンツレーティング上限を設定し、パーソナライズ広告を
 * 使わない方針(設計書「8. 収益化(広告)設計」)をSDKレベルでも徹底する。
 */
export function initializeAds(): Promise<void> {
  if (!isNativeApp) return Promise.resolve();
  initPromise ??= (async () => {
    try {
      await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
        setBannerOffset(size.height);
      });
      await AdMob.initialize({
        initializeForTesting: USE_TEST_ADS,
        tagForChildDirectedTreatment: true,
        maxAdContentRating: MaxAdContentRating.General,
      });
    } catch {
      // 広告SDK初期化に失敗しても、アプリ本体の利用は継続できるようにする
      initPromise = null;
    }
  })();
  return initPromise;
}

/** Home/Galleryの下帯固定バナー。広告非表示プラン購入済みなら何もしない。 */
export async function showBottomBanner(): Promise<void> {
  if (!isNativeApp) return;
  const generation = ++bannerGeneration;
  await initializeAds();
  const isPro = await getLastKnownIsPro();
  if (isPro || generation !== bannerGeneration) return;
  try {
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: USE_TEST_ADS,
      npa: true,
    });
    // 表示処理中に画面を離れていたら、なぞり画面などに残さないよう即座に消す
    if (generation !== bannerGeneration) {
      await AdMob.removeBanner();
    }
  } catch {
    // 通信環境がない・広告在庫がない等でも致命的にしない
  }
}

export async function hideBottomBanner(): Promise<void> {
  if (!isNativeApp) return;
  bannerGeneration++;
  setBannerOffset(0);
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
    await initializeAds();
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_IDS.interstitial,
      isTesting: USE_TEST_ADS,
      npa: true,
    });
    await AdMob.showInterstitial();
  } catch {
    // 広告読み込み失敗時はそのままホームへ戻る(呼び出し側でnavigateする)
  }
}
