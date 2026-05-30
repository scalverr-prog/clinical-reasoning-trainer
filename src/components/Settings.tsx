import { useState } from 'react';
import { Key, User, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { validateApiKey } from '../services/llmService';

export function Settings() {
  const { learnerName, apiKey, setLearnerName, setApiKey, reset } = useProgressStore();
  const [tempName, setTempName] = useState(learnerName);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    setLearnerName(tempName);
    setApiKey(tempApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    reset();
    setTempName('');
    setTempApiKey('');
    setShowResetConfirm(false);
  };

  const isApiKeyValid = tempApiKey ? validateApiKey(tempApiKey) : true;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Configure your learning experience</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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

      {/* API Key */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          Anthropic API Key
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
              !isApiKeyValid
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {!isApiKeyValid && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              API key should start with 'sk-ant-'
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Required for AI-powered evaluation. Get your key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isApiKeyValid}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Reset Progress */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
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
