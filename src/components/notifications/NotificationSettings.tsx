import { X, Bell, Award, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import type { PlatformNotificationType } from '../../types';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NOTIFICATION_TYPE_INFO: Record<
  PlatformNotificationType,
  { label: string; description: string; icon: typeof Bell }
> = {
  license_expiring: {
    label: 'License Expiration',
    description: 'Get reminded when your licenses are about to expire',
    icon: Award,
  },
  ceu_expiring: {
    label: 'CEU Expiration',
    description: 'Get reminded when your CEU credits are about to expire',
    icon: FileText,
  },
  document_expiring: {
    label: 'Document Expiration',
    description: 'Get reminded when your documents are about to expire',
    icon: FileText,
  },
  conference_reminder: {
    label: 'Conference Reminders',
    description: 'Get reminded about upcoming registered conferences',
    icon: Calendar,
  },
  conference_recommendation: {
    label: 'Conference Recommendations',
    description: 'Get recommendations for conferences matching your specialties',
    icon: Calendar,
  },
  study_reminder: {
    label: 'Study Reminders',
    description: 'Get reminded to practice clinical reasoning',
    icon: Bell,
  },
  achievement: {
    label: 'Achievements',
    description: 'Get notified when you earn achievements',
    icon: Award,
  },
  system: {
    label: 'System Notifications',
    description: 'Important system updates and announcements',
    icon: AlertTriangle,
  },
};

const REMINDER_DAY_OPTIONS = [
  { value: 90, label: '90 days' },
  { value: 60, label: '60 days' },
  { value: 30, label: '30 days' },
  { value: 14, label: '14 days' },
  { value: 7, label: '7 days' },
  { value: 3, label: '3 days' },
  { value: 1, label: '1 day' },
];

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { schedules, updateSchedule } = useNotificationStore();

  const handleToggle = (type: PlatformNotificationType) => {
    const schedule = schedules.find((s) => s.type === type);
    if (schedule) {
      updateSchedule(type, { enabled: !schedule.enabled });
    }
  };

  const handleDaysToggle = (type: PlatformNotificationType, day: number) => {
    const schedule = schedules.find((s) => s.type === type);
    if (!schedule) return;

    const currentDays = schedule.daysBeforeExpiry;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => b - a);

    updateSchedule(type, { daysBeforeExpiry: newDays });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          {schedules.map((schedule) => {
            const info = NOTIFICATION_TYPE_INFO[schedule.type];
            if (!info) return null;

            const Icon = info.icon;
            const hasReminderDays = [
              'license_expiring',
              'ceu_expiring',
              'document_expiring',
              'conference_reminder',
            ].includes(schedule.type);

            return (
              <div key={schedule.type} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{info.label}</p>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(schedule.type)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      schedule.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        schedule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reminder Days Selector */}
                {hasReminderDays && schedule.enabled && (
                  <div className="mt-3 ml-11">
                    <p className="text-sm text-gray-600 mb-2">Remind me before:</p>
                    <div className="flex flex-wrap gap-2">
                      {REMINDER_DAY_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleDaysToggle(schedule.type, value)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            schedule.daysBeforeExpiry.includes(value)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Notifications appear in the app. Email and push notifications
              are coming soon.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
