import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { usePro } from '../app/ProContext';
import { ParentGateButton } from '../components/ParentGateButton';
import { parentCopy } from '../copy/parentCopy';
import { getAllPhotos, registerPhoto } from '../data/photoRepository';
import { refreshReminders } from '../lib/reminderSync';
import { FREE_PHOTO_LIMIT } from '../lib/proConfig';
import './screens.css';

const NUMBERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10

type RegisterStep =
  | { kind: 'idle' }
  | { kind: 'tagging'; webPaths: string[]; skipped: number }
  | { kind: 'saving' }
  | { kind: 'done'; savedCount: number; failed: boolean };

export function RegisterScreen() {
  const { navigate } = useAppState();
  const { isPro, priceString, priceStatus, purchasing, purchase } = usePro();
  const [step, setStep] = useState<RegisterStep>({ kind: 'idle' });
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);

  const refreshCount = () => {
    getAllPhotos().then((photos) => setRegisteredCount(photos.length));
  };

  useEffect(refreshCount, []);

  const remaining = isPro || registeredCount === null
    ? Number.POSITIVE_INFINITY
    : Math.max(0, FREE_PHOTO_LIMIT - registeredCount);

  const pickFromLibrary = async () => {
    if (remaining <= 0) return;
    try {
      const result = await Camera.pickImages({ quality: 90 });
      const webPaths = result.photos.map((p) => p.webPath).filter((p): p is string => !!p);
      if (webPaths.length === 0) return;
      const allowed = Number.isFinite(remaining) ? Math.min(webPaths.length, remaining) : webPaths.length;
      setStep({ kind: 'tagging', webPaths: webPaths.slice(0, allowed), skipped: webPaths.length - allowed });
    } catch {
      // ユーザーがキャンセルした場合など。何もしない
    }
  };

  const takePhoto = async () => {
    if (remaining <= 0) return;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });
      if (photo.webPath) {
        setStep({ kind: 'tagging', webPaths: [photo.webPath], skipped: 0 });
      }
    } catch {
      // ユーザーがキャンセルした場合など。何もしない
    }
  };

  const tagWithNumber = async (numberId: number) => {
    if (step.kind !== 'tagging') return;
    setStep({ kind: 'saving' });
    let savedCount = 0;
    let failed = false;
    for (const webPath of step.webPaths) {
      try {
        await registerPhoto(webPath, numberId);
        savedCount++;
      } catch {
        failed = true;
      }
    }
    refreshCount();
    void refreshReminders();
    setStep({ kind: 'done', savedCount, failed });
  };

  if (step.kind === 'tagging') {
    return (
      <div className="screen">
        <h1>{parentCopy.register.taggingTitle}</h1>
        <p>{parentCopy.register.taggingCount(step.webPaths.length)}</p>
        {step.skipped > 0 && <p>{parentCopy.register.taggingSkipped(step.skipped)}</p>}
        <div className="number-grid">
          {NUMBERS.map((n) => (
            <button
              key={n}
              type="button"
              className="number-button"
              onClick={() => tagWithNumber(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step.kind === 'saving') {
    return (
      <div className="screen">
        <h1>{parentCopy.register.saving}</h1>
      </div>
    );
  }

  if (step.kind === 'done') {
    return (
      <div className="screen">
        {step.failed ? (
          <p>{parentCopy.register.failed(step.savedCount)}</p>
        ) : (
          <h1>{parentCopy.register.done}</h1>
        )}
        <button
          type="button"
          className="screen-action-button"
          onClick={() => setStep({ kind: 'idle' })}
        >
          {parentCopy.register.continueRegistering}
        </button>
        <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
          {parentCopy.register.backToHome}
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>{parentCopy.register.title}</h1>
      {!isPro && registeredCount !== null && (
        <p>
          {remaining > 0
            ? parentCopy.register.remaining(remaining)
            : parentCopy.register.limitReached(FREE_PHOTO_LIMIT)}
        </p>
      )}
      {remaining > 0 ? (
        <>
          <button type="button" className="screen-action-button" onClick={pickFromLibrary}>
            {parentCopy.register.pickFromLibrary}
          </button>
          <button type="button" className="screen-action-button" onClick={takePhoto}>
            {parentCopy.register.takePhoto}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="screen-action-button"
          onClick={purchase}
          disabled={priceStatus !== 'ready' || purchasing}
        >
          {purchasing
            ? parentCopy.pro.purchasing
            : priceStatus === 'ready' && priceString
              ? parentCopy.pro.purchaseButton(priceString)
              : parentCopy.pro.priceUnavailable}
        </button>
      )}
      <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
        {parentCopy.register.back}
      </button>
      <ParentGateButton onActivate={() => navigate('settings')} />
    </div>
  );
}
