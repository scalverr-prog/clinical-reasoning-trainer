import { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  FileText,
  Calendar,
  Brain,
  Trophy,
  Flame,
  ChevronRight,
  ShieldCheck,
  Clock,
  BookOpen,
  Stethoscope,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  Bell,
  User,
  GraduationCap,
  FolderOpen,
  Activity,
  Star,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useCredentialStore } from '../stores/credentialStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPermissionPrompt } from './notifications';
import type { View, CaseWithCategory } from '../types';

interface UnifiedDashboardProps {
  cases: CaseWithCategory[];
  onStartCase: (caseData: CaseWithCategory) => void;
  onNavigate: (view: View) => void;
}

export function UnifiedDashboard({ cases, onStartCase, onNavigate }: UnifiedDashboardProps) {
  const { user } = useAuth();
  const { stats, completedCases } = useProgressStore();
  const { getSummary } = useCredentialStore();
  const { browserPermission } = useNotificationStore();
  const summary = getSummary();

  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (browserPermission === 'granted' || browserPermission === 'denied') return;

    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    const timer = setTimeout(() => setShowNotifPrompt(true), 2000);
    return () => clearTimeout(timer);
  }, [browserPermission]);

  const totalExpiring = summary.expiringCertifications.length +
    summary.expiringLicenses.length +
    summary.expiringCEUs.length;

  const uncompletedCases = cases.filter(
    (c) => !completedCases.some((cc) => cc.mrn === c.mrn)
  );

  const handleQuickStart = () => {
    const availableCases = uncompletedCases.length > 0 ? uncompletedCases : cases;
    if (availableCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCases.length);
      onStartCase(availableCases[randomIndex]);
    }
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {greeting}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
                </h1>
                <p className="text-slate-500">Welcome to your professional development portal</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.currentStreak}</span>
                </div>
                <p className="text-xs text-slate-500">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.totalCases}</p>
                <p className="text-xs text-slate-500">Cases Done</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Alert Banner */}
        {totalExpiring > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800">
                {totalExpiring} credential{totalExpiring > 1 ? 's' : ''} expiring soon
              </p>
              <p className="text-sm text-amber-700">Review your portfolio to stay compliant</p>
            </div>
            <button
              onClick={() => onNavigate('credentials')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Review
            </button>
          </div>
        )}

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clinical Portfolio Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Clinical Portfolio</h2>
                  <p className="text-emerald-100 text-sm">Credentials, Documents & Events</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => onNavigate('credentials')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Credentials</span>
                  <span className="text-xs text-slate-500">{summary.activeCertifications + summary.activeLicenses} active</span>
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Documents</span>
                  <span className="text-xs text-slate-500">View all</span>
                </button>
                <button
                  onClick={() => onNavigate('conferences')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Events</span>
                  <span className="text-xs text-slate-500">CEU/CME</span>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    {summary.totalCEUs.toFixed(1)} CEU credits earned
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Clinical Learning Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Clinical Learning</h2>
                  <p className="text-indigo-100 text-sm">Cases, Quizzes & Progress</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => onNavigate('cases')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Case Library</span>
                  <span className="text-xs text-slate-500">{cases.length} cases</span>
                </button>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Quiz Cards</span>
                  <span className="text-xs text-slate-500">Study mode</span>
                </button>
                <button
                  onClick={() => onNavigate('progress')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Progress</span>
                  <span className="text-xs text-slate-500">{stats.averageScore || 0}% avg</span>
                </button>
              </div>
              <button
                onClick={handleQuickStart}
                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <Activity className="w-5 h-5" />
                Start Random Case
              </button>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            AI-Powered Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('consult')}
              className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-slate-900">Clinical Insight</h4>
                <p className="text-sm text-slate-500">AI-powered case analysis for challenging cases</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('insight')}
              className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-slate-900">My Insights</h4>
                <p className="text-sm text-slate-500">Track your learning journey & case history</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Quick Stats & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cases */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate('progress')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </button>
            </div>
            {completedCases.length > 0 ? (
              <div className="space-y-3">
                {completedCases.slice(-4).reverse().map((completed) => (
                  <div
                    key={completed.mrn}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{completed.category}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(completed.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold px-2 py-1 rounded ${
                      completed.score >= 80 ? 'bg-green-100 text-green-700' :
                      completed.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {completed.score}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No cases completed yet</p>
                <button
                  onClick={handleQuickStart}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Start your first case
                </button>
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Your Profile
              </h3>
              <button
                onClick={() => onNavigate('settings')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Settings
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-700">Active Credentials</span>
                </div>
                <span className="font-bold text-slate-900">{summary.activeCertifications + summary.activeLicenses}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-700">CEU Credits</span>
                </div>
                <span className="font-bold text-slate-900">{summary.totalCEUs.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-700">Average Score</span>
                </div>
                <span className="font-bold text-slate-900">{stats.averageScore || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-slate-700">Current Streak</span>
                </div>
                <span className="font-bold text-slate-900">{stats.currentStreak} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Permission Prompt */}
      {showNotifPrompt && (
        <NotificationPermissionPrompt onDismiss={() => setShowNotifPrompt(false)} />
      )}
    </div>
  );
}
