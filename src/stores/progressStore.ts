import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressData, CompletedCase, Achievement } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_case', name: 'First Steps', description: 'Complete your first case', icon: '🎯' },
  { id: 'streak_3', name: 'Getting Started', description: 'Complete 3 cases in a row', icon: '🔥' },
  { id: 'streak_7', name: 'On Fire', description: '7-day streak', icon: '🔥🔥' },
  { id: 'streak_14', name: 'Dedicated Learner', description: '14-day streak', icon: '⭐' },
  { id: 'streak_30', name: 'Master Clinician', description: '30-day streak', icon: '🏆' },
  { id: 'perfect_score', name: 'Flawless', description: 'Score 100% on a case', icon: '💯' },
  { id: 'high_scorer', name: 'High Achiever', description: 'Average score above 85%', icon: '📈' },
  { id: 'ten_cases', name: 'Tenacious', description: 'Complete 10 cases', icon: '🎖️' },
  { id: 'fifty_cases', name: 'Experienced', description: 'Complete 50 cases', icon: '🎖️🎖️' },
  { id: 'hundred_cases', name: 'Centurion', description: 'Complete 100 cases', icon: '🎖️🎖️🎖️' },
  { id: 'category_master', name: 'Specialist', description: 'Complete all cases in a category', icon: '🏥' },
  { id: 'all_categories', name: 'Renaissance Clinician', description: 'Complete cases in every category', icon: '🌟' },
];

interface ProgressStore extends ProgressData {
  setLearnerName: (name: string) => void;
  setApiKey: (key: string) => void;
  recordCompletedCase: (caseRecord: CompletedCase, categoryName: string, totalInCategory: number) => void;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  getAchievements: () => Achievement[];
  reset: () => void;
}

const initialState: ProgressData = {
  version: 2,
  learnerName: '',
  apiKey: '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',
  stats: {
    totalCases: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  },
  categoryProgress: {},
  completedCases: [],
  achievements: [],
};

function isSameDay(date1: string, date2: string): boolean {
  return date1.split('T')[0] === date2.split('T')[0];
}

function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLearnerName: (name) => set({ learnerName: name }),

      setApiKey: (key) => set({ apiKey: key }),

      recordCompletedCase: (caseRecord, categoryName, totalInCategory) => {
        const state = get();
        const completedCases = [...state.completedCases, caseRecord];

        // Update category progress
        const categoryProgress = { ...state.categoryProgress };
        if (!categoryProgress[categoryName]) {
          categoryProgress[categoryName] = { completed: 0, total: totalInCategory, avgScore: 0 };
        }
        const catProgress = categoryProgress[categoryName];
        const newCompleted = catProgress.completed + 1;
        const newAvgScore = Math.round(
          (catProgress.avgScore * catProgress.completed + caseRecord.score) / newCompleted
        );
        categoryProgress[categoryName] = {
          completed: newCompleted,
          total: totalInCategory,
          avgScore: newAvgScore,
        };

        // Update stats
        const totalCases = state.stats.totalCases + 1;
        const averageScore = Math.round(
          (state.stats.averageScore * state.stats.totalCases + caseRecord.score) / totalCases
        );

        set({
          completedCases,
          categoryProgress,
          stats: {
            ...state.stats,
            totalCases,
            averageScore,
          },
        });

        // Check for achievements
        const newAchievements: string[] = [];

        if (totalCases === 1) newAchievements.push('first_case');
        if (totalCases === 10) newAchievements.push('ten_cases');
        if (totalCases === 50) newAchievements.push('fifty_cases');
        if (totalCases === 100) newAchievements.push('hundred_cases');
        if (caseRecord.score === 100) newAchievements.push('perfect_score');
        if (averageScore >= 85 && totalCases >= 5) newAchievements.push('high_scorer');

        // Category mastery
        if (categoryProgress[categoryName].completed >= categoryProgress[categoryName].total) {
          newAchievements.push('category_master');
        }

        // All categories
        const categories = Object.keys(categoryProgress);
        if (categories.length >= 10 && categories.every(cat => categoryProgress[cat].completed > 0)) {
          newAchievements.push('all_categories');
        }

        newAchievements.forEach(id => {
          if (!state.achievements.includes(id)) {
            get().unlockAchievement(id);
          }
        });
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString();
        const lastDate = state.stats.lastCompletedDate;

        let newStreak = state.stats.currentStreak;

        if (!lastDate) {
          newStreak = 1;
        } else if (isSameDay(lastDate, today)) {
          // Same day, streak unchanged
        } else if (isConsecutiveDay(lastDate, today)) {
          newStreak = state.stats.currentStreak + 1;
        } else {
          newStreak = 1; // Streak broken
        }

        const longestStreak = Math.max(state.stats.longestStreak, newStreak);

        set({
          stats: {
            ...state.stats,
            currentStreak: newStreak,
            longestStreak,
            lastCompletedDate: today,
          },
        });

        // Check streak achievements
        if (newStreak === 3) get().unlockAchievement('streak_3');
        if (newStreak === 7) get().unlockAchievement('streak_7');
        if (newStreak === 14) get().unlockAchievement('streak_14');
        if (newStreak === 30) get().unlockAchievement('streak_30');
      },

      unlockAchievement: (achievementId) => {
        const state = get();
        if (!state.achievements.includes(achievementId)) {
          set({ achievements: [...state.achievements, achievementId] });
        }
      },

      getAchievements: () => {
        const state = get();
        return ACHIEVEMENTS.map(a => ({
          ...a,
          unlockedAt: state.achievements.includes(a.id) ? new Date().toISOString() : undefined,
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'clinical-reasoning-progress',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as ProgressData;
        if (version < 2) {
          // Add default API key if not set
          return {
            ...state,
            version: 2,
            apiKey: state.apiKey || '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',
          };
        }
        return state;
      },
    }
  )
);
