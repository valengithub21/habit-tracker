import { NotificationConfig } from '../types';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

export function showHabitNotification(
  title: string,
  body: string,
  icon = '/pwa-192x192.png'
): boolean {
  if (typeof window === 'undefined') return false;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: '/favicon.ico',
        tag: 'habit-reminder',
      });
      return true;
    } catch {
      // Fallback for Service Worker notification if standalone
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, { body, icon, tag: 'habit-reminder' });
        });
        return true;
      }
    }
  }

  return false;
}
