import { useEffect } from 'react';
import { hideBottomBanner, showBottomBanner } from './ads';

/**
 * この画面がマウントされている間だけ下帯バナーを表示する
 * (Home/Galleryで使用。なぞり画面などでは呼ばないことで自動的に非表示になる)。
 */
export function useBottomBannerAd(): void {
  useEffect(() => {
    void showBottomBanner();
    return () => {
      void hideBottomBanner();
    };
  }, []);
}
