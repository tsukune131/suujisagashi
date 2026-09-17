import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { ParentGateButton } from '../components/ParentGateButton';
import { registerPhoto } from '../data/photoRepository';
import './screens.css';

const NUMBERS = Array.from({ length: 11 }, (_, i) => i); // 0〜10

type RegisterStep =
  | { kind: 'idle' }
  | { kind: 'tagging'; webPaths: string[] }
  | { kind: 'saving' }
  | { kind: 'done' };

export function RegisterScreen() {
  const { navigate } = useAppState();
  const [step, setStep] = useState<RegisterStep>({ kind: 'idle' });

  const pickFromLibrary = async () => {
    try {
      const result = await Camera.pickImages({ quality: 90 });
      const webPaths = result.photos.map((p) => p.webPath).filter((p): p is string => !!p);
      if (webPaths.length > 0) {
        setStep({ kind: 'tagging', webPaths });
      }
    } catch {
      // ユーザーがキャンセルした場合など。何もしない
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });
      if (photo.webPath) {
        setStep({ kind: 'tagging', webPaths: [photo.webPath] });
      }
    } catch {
      // ユーザーがキャンセルした場合など。何もしない
    }
  };

  const tagWithNumber = async (numberId: number) => {
    if (step.kind !== 'tagging') return;
    setStep({ kind: 'saving' });
    for (const webPath of step.webPaths) {
      await registerPhoto(webPath, numberId);
    }
    setStep({ kind: 'done' });
  };

  if (step.kind === 'tagging') {
    return (
      <div className="screen">
        <h1>どの すうじに する?</h1>
        <p>{step.webPaths.length}まい の しゃしんを とうろくします</p>
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
        <h1>とうろく しています…</h1>
      </div>
    );
  }

  if (step.kind === 'done') {
    return (
      <div className="screen">
        <h1>とうろく できたよ!</h1>
        <button
          type="button"
          className="screen-action-button"
          onClick={() => setStep({ kind: 'idle' })}
        >
          つづけて とうろくする
        </button>
        <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
          ホームに もどる
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>しゃしんの とうろく</h1>
      <button type="button" className="screen-action-button" onClick={pickFromLibrary}>
        あるものから えらぶ
      </button>
      <button type="button" className="screen-action-button" onClick={takePhoto}>
        しゃしんを とる
      </button>
      <button
        type="button"
        className="screen-action-button"
        onClick={() => navigate('home')}
      >
        もどる
      </button>
      <ParentGateButton onActivate={() => navigate('settings')} />
    </div>
  );
}
