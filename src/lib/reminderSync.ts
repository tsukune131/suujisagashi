import { LocalNotifications } from '@capacitor/local-notifications';
import { notificationCopy } from '../copy/notificationCopy';
import { getNotificationsEnabled } from '../data/notificationPrefs';
import { getAllPhotos, getRegisteredNumberIds } from '../data/photoRepository';
import { ALL_NUMBER_IDS, stampedCount } from '../data/progressLogic';
import { getProgress } from '../data/progressRepository';
import { getHasSeenTutorial } from '../data/tutorialPrefs';
import { isNativeApp } from './platform';

const NOTIFICATION_ID = {
  REGISTER_ENCOURAGE: 1,
  NEW_REGISTER_ENCOURAGE: 2,
  NEAR_COMPLETE: 3,
} as const;

const REGISTER_ENCOURAGE_DELAY_DAYS = 3;
const NEW_REGISTER_ENCOURAGE_DELAY_DAYS = 7;
const NEW_REGISTER_ENCOURAGE_MAX_NUMBERS = 3;
const NEAR_COMPLETE_DELAY_DAYS = 1;
/** 0〜10の11個中9個(約8割)以上でコンプリート後押し通知の対象にする。 */
const NEAR_COMPLETE_THRESHOLD = 9;
/** 夜間や早朝に鳴らさないよう、通知はこの時刻に固定する。 */
const NOTIFY_HOUR = 10;

/** now から days 日後の NOTIFY_HOUR 時ちょうど(端末のローカル時刻)。 */
export function reminderDate(now: Date, days: number): Date {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(NOTIFY_HOUR, 0, 0, 0);
  return date;
}

export type NotificationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!isNativeApp) return 'unsupported';
  const { display } = await LocalNotifications.checkPermissions();
  return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
}

async function cancelAllManaged(): Promise<void> {
  await LocalNotifications.cancel({
    notifications: Object.values(NOTIFICATION_ID).map((id) => ({ id })),
  });
}

/**
 * アプリを開くたび・写真登録/なぞり完成のたびに呼び、状態に応じて通知を
 * 貼り直す(ios-native-features: 「単発通知を先まで積む」「refreshRemindersに集約」)。
 * OSの繰り返し通知には条件判定がないため、毎回キャンセルしてから必要な分だけ積み直す。
 */
export async function refreshReminders(): Promise<void> {
  if (!isNativeApp) return;
  try {
    if (!(await getNotificationsEnabled())) {
      await cancelAllManaged();
      return;
    }
    if (!(await getHasSeenTutorial())) return;

    if ((await getNotificationPermission()) !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }

    await cancelAllManaged();

    const [photos, registeredNumbers, progress] = await Promise.all([
      getAllPhotos(),
      getRegisteredNumberIds(),
      getProgress(),
    ]);
    const now = new Date();
    const notifications = [];

    if (photos.length === 0) {
      notifications.push({
        id: NOTIFICATION_ID.REGISTER_ENCOURAGE,
        title: notificationCopy.registerEncourage.title,
        body: notificationCopy.registerEncourage.body,
        schedule: { at: reminderDate(now, REGISTER_ENCOURAGE_DELAY_DAYS) },
      });
    } else if (registeredNumbers.size <= NEW_REGISTER_ENCOURAGE_MAX_NUMBERS) {
      notifications.push({
        id: NOTIFICATION_ID.NEW_REGISTER_ENCOURAGE,
        title: notificationCopy.newRegisterEncourage.title,
        body: notificationCopy.newRegisterEncourage.body,
        schedule: { at: reminderDate(now, NEW_REGISTER_ENCOURAGE_DELAY_DAYS) },
      });
    }

    const stamped = stampedCount(progress);
    if (stamped >= NEAR_COMPLETE_THRESHOLD && stamped < ALL_NUMBER_IDS.length) {
      notifications.push({
        id: NOTIFICATION_ID.NEAR_COMPLETE,
        title: notificationCopy.nearComplete.title,
        body: notificationCopy.nearComplete.body(ALL_NUMBER_IDS.length - stamped),
        schedule: { at: reminderDate(now, NEAR_COMPLETE_DELAY_DAYS) },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // 通知は補助機能。失敗してもアプリの操作は止めない
  }
}
