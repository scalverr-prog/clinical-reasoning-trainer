import { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  LogIn,
  ChevronDown,
  Award,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter, NotificationSettings } from './notifications';
import type { View } from '../types';

interface TopBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  sidebarWidth: number;
}

export function TopBar({ currentView, onNavigate, sidebarWidth }: TopBarProps) {
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

  // Get page title based on current view
  const getPageTitle = () => {
    const titles: Record<View, string> = {
      login: 'Sign In',
      signup: 'Create Account',
      dashboard: 'Home',
      cases: 'Case Library',
      insight: 'My Insights',
      quiz: 'Quiz Cards',
      progress: 'Progress',
      credentials: 'Credentials',
      documents: 'Documents',
      conferences: 'Conferences',
      consult: 'AI Consult',
      settings: 'Settings',
      profile: 'Profile',
      case: 'Case Study',
    };
    return titles[currentView] || 'ClinicalEdge';
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6"
        style={{ left: sidebarWidth }}
      >
        {/* Page Title */}
        <h2 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h2>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {user && (
            <NotificationCenter
              onNavigate={(view) => onNavigate(view)}
              onOpenSettings={() => setShowNotificationSettings(true)}
            />
          )}

          {/* User Menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {profile?.displayName || 'Account'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </>
  );
}
