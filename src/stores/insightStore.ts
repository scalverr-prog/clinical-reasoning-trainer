import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClinicalInsight, Category } from '../types';

interface InsightState {
  insights: ClinicalInsight[];
  isProcessing: boolean;
  error: string | null;
}

interface InsightActions {
  addInsight: (insight: ClinicalInsight) => void;
  updateInsight: (id: string, updates: Partial<ClinicalInsight>) => void;
  deleteInsight: (id: string) => void;
  markReviewed: (id: string) => void;
  getInsightsByCategory: (category: Category) => ClinicalInsight[];
  getInsightsForReview: () => ClinicalInsight[];
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface InsightStore extends InsightState, InsightActions {}

const initialState: InsightState = {
  insights: [],
  isProcessing: false,
  error: null,
};

// Spaced repetition intervals in days
const SR_INTERVALS = [1, 3, 7, 14, 30];

export const useInsightStore = create<InsightStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addInsight: (insight) =>
        set((state) => ({
          insights: [insight, ...state.insights],
        })),

      updateInsight: (id, updates) =>
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id
              ? { ...i, ...updates, updatedAt: new Date().toISOString() }
              : i
          ),
        })),

      deleteInsight: (id) =>
        set((state) => ({
          insights: state.insights.filter((i) => i.id !== id),
        })),

      markReviewed: (id) =>
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id
              ? {
                  ...i,
                  lastReviewedAt: new Date().toISOString(),
                  reviewCount: i.reviewCount + 1,
                }
              : i
          ),
        })),

      getInsightsByCategory: (category) => {
        return get().insights.filter((i) => i.category === category);
      },

      getInsightsForReview: () => {
        const now = new Date();
        return get().insights.filter((i) => {
          if (!i.lastReviewedAt) return true;
          const lastReview = new Date(i.lastReviewedAt);
          const daysSince =
            (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
          const targetInterval =
            SR_INTERVALS[Math.min(i.reviewCount, SR_INTERVALS.length - 1)];
          return daysSince >= targetInterval;
        });
      },

      setProcessing: (isProcessing) => set({ isProcessing }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'clinical-insights',
      version: 1,
    }
  )
);
