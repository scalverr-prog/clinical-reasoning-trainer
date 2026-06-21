import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  Award,
  FileText,
  Settings,
  Trash2,
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useCredentialStore } from '../../stores/credentialStore';
import { useConferenceStore } from '../../stores/conferenceStore';
import type { PlatformNotification, View } from '../../types';

interface NotificationCenterProps {
  onNavigate?: (view: View) => void;
  onOpenSettings?: () => void;
}

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  license_expiring: Award,
  ceu_expiring: FileText,
  document_expiring: FileText,
  conference_reminder: Calendar,
  conference_recommendation: Calendar,
  study_reminder: Bell,
  achievement: Award,
  system: Bell,
};

const NOTIFICATION_COLORS: Record<string, { bg: string; icon: string }> = {
  license_expiring: { bg: 'bg-amber-100', icon: 'text-amber-600' },
  ceu_expiring: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  document_expiring: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  conference_reminder: { bg: 'bg-green-100', icon: 'text-green-600' },
  conference_recommendation: { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
  study_reminder: { bg: 'bg-teal-100', icon: 'text-teal-600' },
  achievement: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  system: { bg: 'bg-gray-100', icon: 'text-gray-600' },
};

export function NotificationCenter({ onNavigate, onOpenSettings }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    checkExpiringItems,
    checkConferenceReminders,
  } = useNotificationStore();

  const { licenses, ceus, certifications } = useCredentialStore();
  const { getUpcomingRegistered } = useConferenceStore();

  // Check for expiring items on mount and periodically
  useEffect(() => {
    const checkNotifications = () => {
      // Check certifications
      const certItems = certifications.map((c) => ({
        id: c.id,
        title: c.name,
        expirationDate: c.expirationDate,
        type: 'certification' as const,
      }));

      // Check licenses
      const licenseItems = licenses.map((l) => ({
        id: l.id,
        title: `${l.type} License (${l.state})`,
        expirationDate: l.expirationDate,
        type: 'license' as const,
      }));

      // Check CEUs
      const ceuItems = ceus
        .filter((c) => c.expirationDate)
        .map((c) => ({
          id: c.id,
          title: c.title,
          expirationDate: c.expirationDate!,
          type: 'ceu' as const,
        }));

      checkExpiringItems([...certItems, ...licenseItems, ...ceuItems]);

      // Check conferences
      const registeredConfs = getUpcomingRegistered().map((s) => ({
        id: s.conferenceId,
        name: s.conference.name,
        startDate: s.conference.startDate,
      }));
      checkConferenceReminders(registeredConfs);
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [licenses, ceus, certifications, checkExpiringItems, checkConferenceReminders, getUpcomingRegistered]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: PlatformNotification) => {
    markAsRead(notification.id);
    if (notification.linkView && onNavigate) {
      onNavigate(notification.linkView);
      setIsOpen(false);
    }
  };

  const visibleNotifications = notifications
    .filter((n) => !n.dismissed)
    .slice(0, 20);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
            {visibleNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {visibleNotifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                  const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.system;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`w-4 h-4 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {visibleNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  clearAll();
                }}
                className="flex items-center justify-center gap-1 w-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
