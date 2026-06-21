import { useState, useEffect } from 'react';
import {
  Zap,
  AlertTriangle,
  Award,
  FileText,
  Calendar,
  Brain,
  Trophy,
  Target,
  Flame,
  ChevronRight,
  ShieldCheck,
  Clock,
  BookOpen,
  TrendingUp,
  Briefcase,
  Stethoscope,
  Lightbulb,
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
  const { getSummary, certifications, licenses } = useCredentialStore();
  const { browserPermission } = useNotificationStore();
  const summary = getSummary();

  // Show notification prompt for new users
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    // Check if we should show notification prompt
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (browserPermission === 'granted' || browserPermission === 'denied') return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Show prompt after a short delay
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

  // Get next expiring item
  const getNextExpiring = () => {
    const allExpiring = [
      ...summary.expiringCertifications.map(c => ({
        type: 'certification' as const,
        name: c.name,
        date: c.expirationDate
      })),
      ...summary.expiringLicenses.map(l => ({
        type: 'license' as const,
        name: `${l.type} - ${l.state}`,
        date: l.expirationDate
      })),
      ...summary.expiringCEUs.filter(c => c.expirationDate).map(c => ({
        type: 'ceu' as const,
        name: c.title,
        date: c.expirationDate!
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return allExpiring[0];
  };

  const nextExpiring = getNextExpiring();
  const daysUntilNext = nextExpiring
    ? Math.ceil((new Date(nextExpiring.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Greeting */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Your professional development hub
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-purple-300 mb-1">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Cases</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{stats.totalCases}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Credentials</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                {summary.activeCertifications + summary.activeLicenses}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 hidden sm:block">
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-300 mb-1">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Total CEUs</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{summary.totalCEUs.toFixed(1)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 hidden sm:block">
              <div className="flex items-center gap-1.5 sm:gap-2 text-orange-300 mb-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Streak</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{stats.currentStreak}</p>
            </div>
          </div>

          {/* Two Section Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Clinical Portfolio Card */}
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Clinical Portfolio</h2>
                  <p className="text-xs sm:text-sm text-slate-400">Credentials & Documents</p>
                </div>
              </div>

              {totalExpiring > 0 ? (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-200">
                        {totalExpiring} item{totalExpiring > 1 ? 's' : ''} expiring soon
                      </p>
                      {nextExpiring && (
                        <p className="text-sm text-amber-300/80 mt-1">
                          Next: {nextExpiring.name} in {daysUntilNext} days
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <p className="text-green-200">All credentials up to date</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => onNavigate('credentials')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-emerald-500/30 rounded-lg">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Credentials</span>
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Documents</span>
                </button>
                <button
                  onClick={() => onNavigate('conferences')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-purple-500/30 rounded-lg">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Events</span>
                </button>
              </div>

              <button
                onClick={() => onNavigate('credentials')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
              >
                Manage Portfolio
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* ClinicalEdge Card */}
            <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">ClinicalEdge</h2>
                  <p className="text-xs sm:text-sm text-slate-400">Learning & Growth</p>
                </div>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-200">
                      {uncompletedCases.length} cases waiting
                    </p>
                    <p className="text-sm text-purple-300/80 mt-1">
                      {stats.averageScore > 0 ? `${stats.averageScore}% average score` : 'Start your first case'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-300">{cases.length}</p>
                    <p className="text-xs text-purple-400">total cases</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                <button
                  onClick={() => onNavigate('consult')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg">
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">AI Consult</span>
                </button>
                <button
                  onClick={() => onNavigate('insight')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-cyan-500/30 rounded-lg">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">My Insights</span>
                </button>
                <button
                  onClick={() => onNavigate('cases')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-purple-500/30 rounded-lg">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Cases</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-yellow-500/30 rounded-lg">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Quiz</span>
                </button>
                <button
                  onClick={() => onNavigate('progress')}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                >
                  <div className="p-1.5 sm:p-2 bg-amber-500/30 rounded-lg">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                  </div>
                  <span className="text-xs font-medium text-white/90">Progress</span>
                </button>
              </div>

              <button
                onClick={handleQuickStart}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                Start Random Case
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {/* Upcoming Renewals */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Upcoming Renewals</h3>
              </div>
              <button
                onClick={() => onNavigate('credentials')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {totalExpiring > 0 ? (
              <div className="space-y-3">
                {[...summary.expiringCertifications.slice(0, 2).map(c => ({
                  id: c.id,
                  type: 'certification' as const,
                  name: c.name,
                  date: c.expirationDate,
                  icon: <ShieldCheck className="w-4 h-4" />,
                })),
                ...summary.expiringLicenses.slice(0, 2).map(l => ({
                  id: l.id,
                  type: 'license' as const,
                  name: `${l.type} - ${l.state}`,
                  date: l.expirationDate,
                  icon: <Award className="w-4 h-4" />,
                }))].slice(0, 4).map((item) => {
                  const days = Math.ceil((new Date(item.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isUrgent = days <= 30;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isUrgent ? 'bg-red-50' : 'bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                        {days} days
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : certifications.length + licenses.length === 0 ? (
              <div className="text-center py-6">
                <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No credentials added yet</p>
                <button
                  onClick={() => onNavigate('credentials')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add your first credential
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShieldCheck className="w-10 h-10 text-green-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All credentials up to date</p>
              </div>
            )}
          </div>

          {/* Recent Learning */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Learning Progress</h3>
              </div>
              <button
                onClick={() => onNavigate('progress')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {completedCases.length > 0 ? (
              <div className="space-y-3">
                {completedCases.slice(-4).reverse().map((completed) => (
                  <div
                    key={completed.mrn}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-purple-100 text-purple-600">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
                          {completed.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(completed.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      completed.score >= 80 ? 'text-green-600' :
                      completed.score >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {completed.score}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No cases completed yet</p>
                <button
                  onClick={handleQuickStart}
                  className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Start your first case
                </button>
              </div>
            )}
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
