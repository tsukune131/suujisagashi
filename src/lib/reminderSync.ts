import { LocalNotifications } from '@capacitor/local-notifications';
import { notificationCopy } from '../copy/notificationCopy';
import { getAllPhotos, getRegisteredNumberIds } from '../data/photoRepository';
import { getNotificationsEnabled } from '../data/notificationPrefs';
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
const TOTAL_NUMBERS = 11;

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function cancelAllManaged(): Promise<void> {
  await LocalNotifications.cancel({
    notifications: Object.values(NOTIFICATION_ID).map((id) => ({ id })),
  });
}

/**
 * アプリを開くたび・写真登録/なぞり完成のたびに呼び、状態に応じて通知を
 * 貼り直す(ios-native-features: 「単発通知を先まで積む」「refreshRemindersに集約」)。
 * OSの繰り返し通知には条件判定がないため、毎回キャンセルしてから必要な分だけ
 * 積み直す方式にする。
 */
export async function refreshReminders(): Promise<void> {
  if (!isNativeApp) return;

  const enabled = await getNotificationsEnabled();
  if (!enabled) {
    await cancelAllManaged();
    return;
  }

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== 'granted') return;
  }

  const hasSeenTutorial = await getHasSeenTutorial();
  if (!hasSeenTutorial) return;

  await cancelAllManaged();

  const [photos, registeredNumbers, progress] = await Promise.all([
    getAllPhotos(),
    getRegisteredNumberIds(),
    getProgress(),
  ]);

  const notifications = [];

  if (photos.length === 0) {
    notifications.push({
      id: NOTIFICATION_ID.REGISTER_ENCOURAGE,
      title: notificationCopy.registerEncourage.title,
      body: notificationCopy.registerEncourage.body,
      schedule: { at: daysFromNow(REGISTER_ENCOURAGE_DELAY_DAYS) },
    });
  } else if (registeredNumbers.size <= NEW_REGISTER_ENCOURAGE_MAX_NUMBERS) {
    notifications.push({
      id: NOTIFICATION_ID.NEW_REGISTER_ENCOURAGE,
      title: notificationCopy.newRegisterEncourage.title,
      body: notificationCopy.newRegisterEncourage.body,
      schedule: { at: daysFromNow(NEW_REGISTER_ENCOURAGE_DELAY_DAYS) },
    });
  }

  const stampedCount = Object.values(progress.stamps).filter(
    (round) => round === progress.currentCardRound,
  ).length;
  if (stampedCount >= NEAR_COMPLETE_THRESHOLD && stampedCount < TOTAL_NUMBERS) {
    notifications.push({
      id: NOTIFICATION_ID.NEAR_COMPLETE,
      title: notificationCopy.nearComplete.title,
      body: notificationCopy.nearComplete.body(TOTAL_NUMBERS - stampedCount),
      schedule: { at: daysFromNow(NEAR_COMPLETE_DELAY_DAYS) },
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}
