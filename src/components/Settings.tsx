import { useState, useEffect } from 'react';
import { User, Trash2, CheckCircle, Bell, BellOff, Share2, QrCode } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { NotificationService } from '../services/notificationService';
import { ShareAppQRCode } from './shared/ShareAppQRCode';

export function Settings() {
  const { learnerName, notificationPrefs, setLearnerName, setNotificationPrefs, reset } = useProgressStore();
  const [tempName, setTempName] = useState(learnerName);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    NotificationService.getPermissionStatus()
  );
  const [showShareQR, setShowShareQR] = useState(false);

  useEffect(() => {
    setNotificationPermission(NotificationService.getPermissionStatus());
  }, []);

  const handleSave = () => {
    setLearnerName(tempName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await NotificationService.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationPrefs({ enabled: true });
      }
    } catch (err) {
      console.error('Failed to request notification permission:', err);
    }
  };

  const handleTestNotification = () => {
    NotificationService.showNotification(
      'Test Notification',
      'Notifications are working correctly!'
    );
  };

  const handleReset = () => {
    reset();
    setTempName('');
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Configure your experience</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Profile
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be displayed on your dashboard
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-600" />
          Notifications
        </h3>

        {notificationPermission === 'denied' ? (
          <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
            <BellOff className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Notifications Blocked</p>
              <p className="text-sm text-gray-500">
                Please enable notifications in your browser settings to receive reminders.
              </p>
            </div>
          </div>
        ) : notificationPermission === 'granted' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Practice Reminders</p>
                <p className="text-sm text-gray-500">
                  Get notified when it's time to practice
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationPrefs.enabled}
                  onChange={(e) => setNotificationPrefs({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationPrefs.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={notificationPrefs.frequency}
                    onChange={(e) => setNotificationPrefs({ frequency: e.target.value as 'daily' | 'weekly' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={notificationPrefs.preferredTime}
                    onChange={(e) => setNotificationPrefs({ preferredTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleTestNotification}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Send Test Notification
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enable notifications to receive daily practice reminders and suggested cases.
            </p>
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        {saved ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Saved!
          </>
        ) : (
          'Save Settings'
        )}
      </button>

      {/* Share App */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          Share ClinicalPro
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Share the app with colleagues using a QR code or link.
        </p>
        <button
          onClick={() => setShowShareQR(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-emerald-700 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Show QR Code
        </button>
      </div>

      {/* Share QR Code Modal */}
      <ShareAppQRCode isOpen={showShareQR} onClose={() => setShowShareQR(false)} />

      {/* Reset Progress */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Reset Progress
        </h3>
        <p className="text-sm text-red-700 mb-4">
          This will permanently delete all your progress, including completed cases,
          scores, and achievements. This action cannot be undone.
        </p>
        {showResetConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Reset All Progress
          </button>
        )}
      </div>
    </div>
  );
}
