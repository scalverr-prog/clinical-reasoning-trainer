import { useState } from 'react';
import { Bell, X, ShieldCheck, Award, Calendar } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

interface NotificationPermissionPromptProps {
  onDismiss: () => void;
}

export function NotificationPermissionPrompt({ onDismiss }: NotificationPermissionPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { browserPermission, setBrowserPermission } = useNotificationStore();

  // Don't show if already granted or denied
  if (browserPermission === 'granted' || browserPermission === 'denied' || browserPermission === 'unsupported') {
    return null;
  }

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        // Show a test notification
        new Notification('Notifications Enabled', {
          body: 'You\'ll be notified when credentials are expiring.',
          icon: '/favicon.ico',
        });
      }
      onDismiss();
    } catch (error) {
      console.error('Error requesting permission:', error);
      setBrowserPermission('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    // Store dismissal in localStorage
    localStorage.setItem('notification-prompt-dismissed', new Date().toISOString());
    onDismiss();
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slide-up">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">Enable Notifications?</h3>
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when your credentials are expiring so you never miss a renewal.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Certification expiration alerts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4 text-blue-500" />
            <span>License renewal reminders</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Conference reminders</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            disabled={isRequesting}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isRequesting ? (
              'Enabling...'
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Enable
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
