import { useAppState } from '../app/AppStateContext';
import { usePro } from '../app/ProContext';
import { parentCopy } from '../copy/parentCopy';
import './screens.css';

/**
 * 親モード。写真管理・音量は後続Stepで実装する。
 */
export function SettingsScreen() {
  const { navigate, startTutorial } = useAppState();
  const { isPro, priceString, purchasing, restoring, purchase, restore } = usePro();

  return (
    <div className="screen">
      <h1>{parentCopy.settings.title}</h1>
      <p>({parentCopy.settings.placeholderNote})</p>

      <div className="pro-section">
        <h2>{parentCopy.pro.heading}</h2>
        <p>{parentCopy.pro.description}</p>
        {isPro ? (
          <p>{parentCopy.pro.alreadyPurchased}</p>
        ) : (
          <>
            <button
              type="button"
              className="screen-action-button"
              onClick={purchase}
              disabled={!priceString || purchasing}
            >
              {purchasing
                ? parentCopy.pro.purchasing
                : priceString
                  ? parentCopy.pro.purchaseButton(priceString)
                  : parentCopy.pro.priceUnavailable}
            </button>
            <button
              type="button"
              className="screen-action-button"
              onClick={restore}
              disabled={restoring}
            >
              {restoring ? parentCopy.pro.restoring : parentCopy.pro.restoreButton}
            </button>
          </>
        )}
      </div>

      <button type="button" className="screen-action-button" onClick={startTutorial}>
        {parentCopy.settings.replayTutorial}
      </button>
      <button type="button" className="screen-action-button" onClick={() => navigate('home')}>
        {parentCopy.settings.back}
      </button>
    </div>
  );
}
