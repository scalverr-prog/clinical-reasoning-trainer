import { Brain, Settings, Trophy, Home } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';

interface HeaderProps {
  currentView: 'dashboard' | 'case' | 'progress' | 'settings';
  onNavigate: (view: 'dashboard' | 'case' | 'progress' | 'settings') => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { stats, learnerName } = useProgressStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clinical Reasoning Trainer</h1>
              {learnerName && (
                <p className="text-sm text-gray-500">Welcome, {learnerName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {stats.totalCases > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{stats.totalCases}</p>
                  <p className="text-gray-500">Cases</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{stats.averageScore}%</p>
                  <p className="text-gray-500">Avg Score</p>
                </div>
                {stats.currentStreak > 0 && (
                  <div className="text-center">
                    <p className="font-semibold text-orange-600">{stats.currentStreak} 🔥</p>
                    <p className="text-gray-500">Streak</p>
                  </div>
                )}
              </div>
            )}

            <nav className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Dashboard"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('progress')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Progress"
              >
                <Trophy className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'settings'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
