/**
 * テスト広告を使うか。本番提出前に false にし、PRODUCTION_AD_UNIT_IDS を埋める。
 * `npm run check:release` がこの値・ID・Info.plist のテストApp IDを検査する。
 */
export const USE_TEST_ADS = true;

/** Google公式のテスト広告ユニットID(iOS)。登録不要ですぐ使える。 */
const TEST_AD_UNIT_IDS = {
  banner: 'ca-app-pub-3940256099942544/2934735716',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
};

/** docs/admob-setup.md の A-3 で発行されたIDを入れる。 */
const PRODUCTION_AD_UNIT_IDS = {
  banner: '',
  interstitial: '',
};

export const AD_UNIT_IDS = USE_TEST_ADS ? TEST_AD_UNIT_IDS : PRODUCTION_AD_UNIT_IDS;

/** N回に1回だけインタースティシャルを表示する(設計書「8. 収益化(広告)設計」)。 */
export const INTERSTITIAL_FREQUENCY = 4;

/** バナーと子どもが触るボタンの間に空ける余白(設計書「子供向けアプリの広告ポリシー留意点」)。 */
export const BANNER_CLEARANCE_PX = 16;
