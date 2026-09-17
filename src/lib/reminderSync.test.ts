import { describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: {} }));
vi.mock('@capacitor/preferences', () => ({ Preferences: {} }));
vi.mock('@capacitor/filesystem', () => ({ Filesystem: {}, Directory: {} }));

const { reminderDate } = await import('./reminderSync');

describe('reminderDate', () => {
  it('深夜に開いても、通知はN日後の午前10時にする', () => {
    const lateNight = new Date(2026, 8, 17, 23, 45);
    const at = reminderDate(lateNight, 3);
    expect(at.getDate()).toBe(20);
    expect(at.getHours()).toBe(10);
    expect(at.getMinutes()).toBe(0);
  });

  it('月末をまたいでも日付が正しく進む', () => {
    const at = reminderDate(new Date(2026, 8, 30, 8, 0), 1);
    expect(at.getMonth()).toBe(9);
    expect(at.getDate()).toBe(1);
  });
});
