import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNativeApp } from './platform';

/**
 * なぞり完成時にのみ使う軽い振動(ios-native-features: 「1タップで記録が
 * 増える操作にだけ軽い振動を返す。多用しない」)。
 */
export async function completionHapticFeedback(): Promise<void> {
  if (!isNativeApp) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // 実機以外・権限なしなどで失敗しても無視する
  }
}
