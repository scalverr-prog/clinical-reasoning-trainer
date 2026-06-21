import {
  Home,
  BookOpen,
  HelpCircle,
  Trophy,
  Award,
  FileText,
  Calendar,
  Settings,
  Brain,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Lock,
  LayoutDashboard,
  X,
  Stethoscope,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

interface NavGroup {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  items: NavItem[];
}

export function Sidebar({ currentView, onNavigate, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  // Close mobile sidebar when navigating
  const handleNavigate = (view: View) => {
    onNavigate(view);
    onMobileClose?.();
  };

  // Dynamic nav groups based on auth state
  const NAV_GROUPS: NavGroup[] = useMemo(() => [
    {
      title: 'Portfolio',
      subtitle: 'Credentials & Documents',
      icon: <Briefcase className="w-4 h-4" />,
      items: [
        { id: 'credentials', label: 'Credentials', icon: <Award className="w-5 h-5" />, requiresAuth: true },
        { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" />, requiresAuth: true },
        { id: 'conferences', label: 'Conferences', icon: <Calendar className="w-5 h-5" />, requiresAuth: true },
      ],
    },
    {
      title: 'ClinicalEdge',
      subtitle: 'Learning & Growth',
      icon: <Brain className="w-4 h-4" />,
      items: user
        ? [
            { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: 'cases', label: 'Case Library', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'consult', label: 'AI Consult', icon: <Stethoscope className="w-5 h-5" /> },
            { id: 'insight', label: 'My Insights', icon: <Home className="w-5 h-5" /> },
            { id: 'quiz', label: 'Quiz Cards', icon: <HelpCircle className="w-5 h-5" /> },
            { id: 'progress', label: 'Progress', icon: <Trophy className="w-5 h-5" /> },
          ]
        : [
            { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: 'cases', label: 'Case Library', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'consult', label: 'AI Consult', icon: <Stethoscope className="w-5 h-5" /> },
            { id: 'insight', label: 'My Insights', icon: <Home className="w-5 h-5" /> },
            { id: 'quiz', label: 'Quiz Cards', icon: <HelpCircle className="w-5 h-5" /> },
            { id: 'progress', label: 'Progress', icon: <Trophy className="w-5 h-5" /> },
          ],
    },
  ], [user]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col
          ${isCollapsed ? 'w-16' : 'w-56'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate('dashboard')}
          >
          <div className="p-2 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-lg flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                ClinicalPro
              </h1>
              <p className="text-xs text-slate-400">Portfolio + Edge</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <div className="px-4 mb-2">
                <div className="flex items-center gap-2">
                  {group.icon && <span className="text-slate-400">{group.icon}</span>}
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
              </div>
            )}
            <ul className="space-y-1 px-2">
              {group.items.map((item) => {
                const isActive = currentView === item.id;
                const isLocked = item.requiresAuth && !user;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : isLocked
                          ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1">{item.label}</span>
                          {isLocked && (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-slate-700 p-2">
        <button
          onClick={() => handleNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            currentView === 'settings'
              ? 'bg-purple-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
      </div>

      {/* Collapse Toggle - hidden on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full items-center justify-center text-slate-300 hover:bg-slate-600 hover:text-white shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
    </>
  );
}
