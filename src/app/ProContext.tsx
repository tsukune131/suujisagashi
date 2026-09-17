import { NativePurchases } from '@capgo/native-purchases';
import { App as CapacitorApp } from '@capacitor/app';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLastKnownIsPro, setLastKnownIsPro } from '../data/proPrefs';
import { isNativeApp } from '../lib/platform';
import { PRO_PRODUCT_ID } from '../lib/proConfig';

interface ProState {
  /** 広告非表示プラン購入済みかどうか。StoreKitに聞けない間は直近の既知の値を保つ。 */
  isPro: boolean;
  /** StoreKitが整形した価格文字列。取得できるまで購入ボタンは出さない。 */
  priceString: string | null;
  purchasing: boolean;
  restoring: boolean;
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
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const refresh = async () => {
    if (!isNativeApp) return;
    try {
      const { product } = await NativePurchases.getProduct({ productIdentifier: PRO_PRODUCT_ID });
      setPriceString(product.priceString);
    } catch {
      // 価格が取れるまで購入ボタンは表示しない(priceStringはnullのまま)
    }
    try {
      const entitled = await checkEntitlement();
      setIsPro(entitled);
      void setLastKnownIsPro(entitled);
    } catch {
      // StoreKitに問い合わせられない場合は直近の既知の値を保つ
    }
  };

  useEffect(() => {
    getLastKnownIsPro().then(setIsPro);
    void refresh();

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
    } finally {
      setPurchasing(false);
    }
  };

  const restore = async () => {
    if (!isNativeApp || restoring) return;
    setRestoring(true);
    try {
      await NativePurchases.restorePurchases();
      const entitled = await checkEntitlement();
      setIsPro(entitled);
      await setLastKnownIsPro(entitled);
    } finally {
      setRestoring(false);
    }
  };

  const value = useMemo<ProState>(
    () => ({ isPro, priceString, purchasing, restoring, purchase, restore }),
    [isPro, priceString, purchasing, restoring],
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
