import { NativePurchases } from '@capgo/native-purchases';
import { App as CapacitorApp } from '@capacitor/app';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLastKnownIsPro, setLastKnownIsPro } from '../data/proPrefs';
import { isNativeApp } from '../lib/platform';
import { PRO_PRODUCT_ID } from '../lib/proConfig';

export type PriceStatus = 'loading' | 'ready' | 'unavailable';
export type RestoreOutcome = 'restored' | 'notFound' | 'failed' | null;

interface ProState {
  /** 広告非表示プラン購入済みかどうか。StoreKitに聞けない間は直近の既知の値を保つ。 */
  isPro: boolean;
  /** StoreKitが整形した価格文字列。取得できるまで購入ボタンは押せない。 */
  priceString: string | null;
  priceStatus: PriceStatus;
  purchasing: boolean;
  restoring: boolean;
  restoreOutcome: RestoreOutcome;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

const ProContext = createContext<ProState | null>(null);

async function checkEntitlement(): Promise<boolean> {
  const { purchases } = await NativePurchases.getPurchases({ onlyCurrentEntitlements: true });
  return purchases.some((p) => p.productIdentifier === PRO_PRODUCT_ID);
}

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [priceString, setPriceString] = useState<string | null>(null);
  const [priceStatus, setPriceStatus] = useState<PriceStatus>('loading');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreOutcome, setRestoreOutcome] = useState<RestoreOutcome>(null);

  const refresh = async () => {
    if (!isNativeApp) {
      setPriceStatus('unavailable');
      return;
    }
    try {
      const { product } = await NativePurchases.getProduct({ productIdentifier: PRO_PRODUCT_ID });
      setPriceString(product.priceString);
      setPriceStatus('ready');
    } catch {
      setPriceStatus((s) => (s === 'ready' ? s : 'unavailable'));
    }
    try {
      const entitled = await checkEntitlement();
      setIsPro(entitled);
      await setLastKnownIsPro(entitled);
    } catch {
      // StoreKitに問い合わせられない場合は直近の既知の値を保つ
    }
  };

  useEffect(() => {
    // 保存済みの値を先に反映してから問い合わせる(遅れて届いた古い値で上書きしないため)
    void getLastKnownIsPro().then(async (cached) => {
      setIsPro(cached);
      await refresh();
    });

    if (!isNativeApp) return;
    const listenerPromise = CapacitorApp.addListener('resume', () => {
      void refresh();
    });
    return () => {
      void listenerPromise.then((h) => h.remove());
    };
  }, []);

  const purchase = async () => {
    if (!isNativeApp || purchasing) return;
    setPurchasing(true);
    try {
      await NativePurchases.purchaseProduct({ productIdentifier: PRO_PRODUCT_ID });
      setIsPro(true);
      await setLastKnownIsPro(true);
    } catch {
      // ユーザーによるキャンセル・支払い失敗。StoreKit側のシートが理由を表示済み
    } finally {
      setPurchasing(false);
    }
  };

  const restore = async () => {
    if (!isNativeApp || restoring) return;
    setRestoring(true);
    setRestoreOutcome(null);
    try {
      await NativePurchases.restorePurchases();
      const entitled = await checkEntitlement();
      setIsPro(entitled);
      await setLastKnownIsPro(entitled);
      setRestoreOutcome(entitled ? 'restored' : 'notFound');
    } catch {
      setRestoreOutcome('failed');
    } finally {
      setRestoring(false);
    }
  };

  const value = useMemo<ProState>(
    () => ({
      isPro,
      priceString,
      priceStatus,
      purchasing,
      restoring,
      restoreOutcome,
      purchase,
      restore,
    }),
    [isPro, priceString, priceStatus, purchasing, restoring, restoreOutcome],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProState {
  const ctx = useContext(ProContext);
  if (!ctx) {
    throw new Error('usePro は ProProvider の内側でのみ使用できます');
  }
  return ctx;
}
