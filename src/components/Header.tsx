import { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Settings,
  Trophy,
  Home,
  BookOpen,
  HelpCircle,
  User,
  LogOut,
  LogIn,
  Award,
  FileText,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter, NotificationSettings } from './notifications';
import type { View } from '../types';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { stats } = useProgressStore();
  const { user, profile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

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
              <h1 className="text-xl font-bold text-gray-900">ClinicalEdge</h1>
              {profile?.displayName && (
                <p className="text-sm text-gray-500">Welcome, {profile.displayName}</p>
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
                    <p className="font-semibold text-orange-600">{stats.currentStreak}</p>
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
                onClick={() => onNavigate('insight')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'insight'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="My Insights"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('quiz')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'quiz'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Quiz Cards"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('credentials')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'credentials'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Credentials"
              >
                <Award className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('documents')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'documents'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Documents"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('conferences')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'conferences'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Conferences"
              >
                <Calendar className="w-5 h-5" />
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

              {/* Notifications */}
              {user && (
                <NotificationCenter
                  onNavigate={(view) => onNavigate(view)}
                  onOpenSettings={() => setShowNotificationSettings(true)}
                />
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative ml-2" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {profile?.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{profile?.displayName}</p>
                        <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('credentials');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        Credentials
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('documents');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Documents
                      </button>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </header>
  );
}
