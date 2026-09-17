import { useEffect, useState } from 'react';
import { useAppState } from '../app/AppStateContext';
import { usePro } from '../app/ProContext';
import { parentCopy } from '../copy/parentCopy';
import { getNotificationsEnabled, setNotificationsEnabled } from '../data/notificationPrefs';
import {
  getNotificationPermission,
  refreshReminders,
  type NotificationPermission,
} from '../lib/reminderSync';
import './screens.css';

export function SettingsScreen() {
  const { navigate, startTutorial } = useAppState();
  const {
    isPro,
    priceString,
    priceStatus,
    purchasing,
    restoring,
    restoreOutcome,
    purchase,
    restore,
  } = usePro();
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('unsupported');

  useEffect(() => {
    void getNotificationsEnabled().then(setNotificationsEnabledState);
    void getNotificationPermission().then(setPermission);
  }, []);

  const toggleNotifications = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabledState(next);
    await setNotificationsEnabled(next);
    await refreshReminders();
    setPermission(await getNotificationPermission());
  };

  const purchaseLabel = purchasing
    ? parentCopy.pro.purchasing
    : priceStatus === 'ready' && priceString
      ? parentCopy.pro.purchaseButton(priceString)
      : priceStatus === 'loading'
        ? parentCopy.pro.priceLoading
        : parentCopy.pro.priceUnavailable;

  return (
    <div className="screen">
      <h1>{parentCopy.settings.title}</h1>

      <div className="pro-section">
        <h2>{parentCopy.notifications.heading}</h2>
        <p>{parentCopy.notifications.description}</p>
        <button type="button" className="screen-action-button" onClick={toggleNotifications}>
          {notificationsEnabled
            ? parentCopy.notifications.toggleOn
            : parentCopy.notifications.toggleOff}
        </button>
        {notificationsEnabled && permission === 'denied' && (
          <p>{parentCopy.notifications.deniedByOs}</p>
        )}
      </div>

      <div className="pro-section">
        <h2>{parentCopy.pro.heading}</h2>
        <p>{parentCopy.pro.description}</p>
        {isPro ? (
          <p>{parentCopy.pro.alreadyPurchased}</p>
        ) : (
          <button
            type="button"
            className="screen-action-button"
            onClick={purchase}
            disabled={priceStatus !== 'ready' || purchasing}
          >
            {purchaseLabel}
          </button>
        )}
        {/* iap-onetime: 「購入を復元」は購入後も残す */}
        <button
          type="button"
          className="screen-action-button"
          onClick={restore}
          disabled={restoring}
        >
          {restoring ? parentCopy.pro.restoring : parentCopy.pro.restoreButton}
        </button>
        {restoreOutcome === 'notFound' && <p>{parentCopy.pro.restoreNotFound}</p>}
        {restoreOutcome === 'failed' && <p>{parentCopy.pro.restoreFailed}</p>}
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
