import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlatformNotification, PlatformNotificationType, NotificationSchedule, View } from '../types';

interface NotificationStore {
  notifications: PlatformNotification[];
  schedules: NotificationSchedule[];
  unreadCount: number;
  lastChecked: string | null;

  // Notification actions
  addNotification: (notification: Omit<PlatformNotification, 'id' | 'createdAt' | 'read' | 'dismissed'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;

  // Schedule actions
  updateSchedule: (type: PlatformNotificationType, updates: Partial<NotificationSchedule>) => void;

  // Queries
  getUnread: () => PlatformNotification[];
  getByType: (type: PlatformNotificationType) => PlatformNotification[];

  // Check for new notifications based on credentials/conferences
  checkExpiringItems: (items: Array<{ id: string; title: string; expirationDate: string; type: 'license' | 'ceu' | 'document' | 'certification' }>) => void;

  // Browser notification permission
  browserPermission: NotificationPermission | 'unsupported';
  setBrowserPermission: (permission: NotificationPermission | 'unsupported') => void;
  showBrowserNotification: (title: string, body: string, tag?: string) => void;
  checkConferenceReminders: (conferences: Array<{ id: string; name: string; startDate: string }>) => void;
}

const DEFAULT_SCHEDULES: NotificationSchedule[] = [
  { type: 'license_expiring', enabled: true, daysBeforeExpiry: [90, 60, 30, 14, 7, 1], channels: ['in_app'] },
  { type: 'ceu_expiring', enabled: true, daysBeforeExpiry: [30, 14, 7], channels: ['in_app'] },
  { type: 'document_expiring', enabled: true, daysBeforeExpiry: [30, 14], channels: ['in_app'] },
  { type: 'conference_reminder', enabled: true, daysBeforeExpiry: [7, 1], channels: ['in_app'] },
  { type: 'conference_recommendation', enabled: true, daysBeforeExpiry: [], channels: ['in_app'] },
  { type: 'study_reminder', enabled: false, daysBeforeExpiry: [], channels: ['in_app'] },
  { type: 'achievement', enabled: true, daysBeforeExpiry: [], channels: ['in_app'] },
  { type: 'system', enabled: true, daysBeforeExpiry: [], channels: ['in_app'] },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      schedules: DEFAULT_SCHEDULES,
      unreadCount: 0,
      lastChecked: null,
      browserPermission: typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported',

      setBrowserPermission: (permission) => {
        set({ browserPermission: permission });
      },

      showBrowserNotification: (title, body, tag) => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: tag || 'clinical-pro',
        });
      },

      addNotification: (notificationData) => {
        const notification: PlatformNotification = {
          ...notificationData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          dismissed: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true, read: true } : n
          ),
          unreadCount: state.notifications.find((n) => n.id === id && !n.read)
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      updateSchedule: (type, updates) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.type === type ? { ...s, ...updates } : s
          ),
        }));
      },

      getUnread: () => {
        return get().notifications.filter((n) => !n.read && !n.dismissed);
      },

      getByType: (type) => {
        return get().notifications.filter((n) => n.type === type && !n.dismissed);
      },

      checkExpiringItems: (items) => {
        const { schedules, notifications, addNotification, showBrowserNotification } = get();
        const now = new Date();
        const criticalItems: Array<{ title: string; daysUntil: number }> = [];

        items.forEach((item) => {
          const expDate = new Date(item.expirationDate);
          const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Handle expired items too
          const isExpired = daysUntil < 0;

          const notifType: PlatformNotificationType =
            item.type === 'license' ? 'license_expiring' :
            item.type === 'ceu' ? 'ceu_expiring' :
            item.type === 'certification' ? 'license_expiring' : // Use license_expiring for certifications
            'document_expiring';

          const schedule = schedules.find((s) => s.type === notifType);
          if (!schedule?.enabled) return;

          // Check if we should notify for this day (or if expired)
          const shouldNotify = isExpired || schedule.daysBeforeExpiry.includes(daysUntil);
          if (!shouldNotify) return;

          // Check if we already sent this notification today
          const existingNotif = notifications.find(
            (n) =>
              n.type === notifType &&
              n.metadata?.itemId === item.id &&
              n.metadata?.daysUntil === daysUntil &&
              new Date(n.createdAt).toDateString() === now.toDateString()
          );

          if (existingNotif) return;

          // Create notification
          const linkView: View = 'credentials';

          const typeLabel = item.type === 'certification' ? 'Certification' :
            item.type.charAt(0).toUpperCase() + item.type.slice(1);

          const title = isExpired
            ? `${typeLabel} EXPIRED`
            : `${typeLabel} Expiring Soon`;

          const message = isExpired
            ? `${item.title} expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago. Renew immediately.`
            : `${item.title} expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

          addNotification({
            userId: '',
            type: notifType,
            title,
            message,
            link: null,
            linkView,
            expiresAt: item.expirationDate,
            metadata: { itemId: item.id, daysUntil },
          });

          // Track critical items for browser notification
          if (isExpired || daysUntil <= 7) {
            criticalItems.push({ title: item.title, daysUntil });
          }
        });

        // Show browser notification for critical items (once per session)
        if (criticalItems.length > 0) {
          const sessionKey = `notif-shown-${now.toDateString()}`;
          if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'true');

            if (criticalItems.length === 1) {
              const item = criticalItems[0];
              const msg = item.daysUntil < 0
                ? `Expired ${Math.abs(item.daysUntil)} days ago`
                : `Expires in ${item.daysUntil} days`;
              showBrowserNotification(`${item.title}`, msg, 'credential-alert');
            } else {
              showBrowserNotification(
                'Credentials Need Attention',
                `${criticalItems.length} items are expiring soon or have expired.`,
                'credential-alert'
              );
            }
          }
        }
      },

      checkConferenceReminders: (conferences) => {
        const { schedules, notifications, addNotification } = get();
        const now = new Date();

        const schedule = schedules.find((s) => s.type === 'conference_reminder');
        if (!schedule?.enabled) return;

        conferences.forEach((conf) => {
          const startDate = new Date(conf.startDate);
          const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntil < 0) return; // Already started

          const shouldNotify = schedule.daysBeforeExpiry.includes(daysUntil);
          if (!shouldNotify) return;

          // Check if already notified
          const existingNotif = notifications.find(
            (n) =>
              n.type === 'conference_reminder' &&
              n.metadata?.conferenceId === conf.id &&
              n.metadata?.daysUntil === daysUntil &&
              new Date(n.createdAt).toDateString() === now.toDateString()
          );

          if (existingNotif) return;

          addNotification({
            userId: '',
            type: 'conference_reminder',
            title: 'Conference Reminder',
            message: `${conf.name} starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
            link: null,
            linkView: 'conferences',
            expiresAt: conf.startDate,
            metadata: { conferenceId: conf.id, daysUntil },
          });
        });
      },
    }),
    {
      name: 'clinical-notifications',
      version: 1,
      partialize: (state) => ({
        notifications: state.notifications,
        schedules: state.schedules,
        unreadCount: state.unreadCount,
        lastChecked: state.lastChecked,
        browserPermission: state.browserPermission,
      }),
    }
  )
);
