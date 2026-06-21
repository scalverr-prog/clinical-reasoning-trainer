import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizCard, QuizSession, QuizFilters, QuizCardResult, Category } from '../types';

interface QuizState {
  cards: QuizCard[];
  currentSession: QuizSession | null;
  sessions: QuizSession[];
  isGenerating: boolean;
  error: string | null;
}

interface QuizActions {
  addCards: (cards: QuizCard[]) => void;
  updateCard: (id: string, updates: Partial<QuizCard>) => void;
  deleteCard: (id: string) => void;
  startSession: (filters: QuizFilters, cardCount?: number) => void;
  answerCard: (cardId: string, correct: boolean, timeSpentMs: number) => void;
  nextCard: () => void;
  endSession: () => void;
  getCardsForReview: (filters?: QuizFilters) => QuizCard[];
  getDueCards: () => QuizCard[];
  getCardStats: () => { total: number; mastered: number; learning: number; due: number };
  getCategoryStats: (category: Category) => { correct: number; total: number };
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface QuizStore extends QuizState, QuizActions {}

const initialState: QuizState = {
  cards: [],
  currentSession: null,
  sessions: [],
  isGenerating: false,
  error: null,
};

// Spaced repetition intervals (in days)
const SR_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

function calculateNextReview(consecutiveCorrect: number): string {
  const interval = SR_INTERVALS[Math.min(consecutiveCorrect, SR_INTERVALS.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate.toISOString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addCards: (cards) =>
        set((state) => ({
          cards: [...state.cards, ...cards],
        })),

      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      startSession: (filters, cardCount = 10) => {
        const availableCards = get().getCardsForReview(filters);
        const selectedCards = availableCards
          .sort(() => Math.random() - 0.5)
          .slice(0, cardCount);

        if (selectedCards.length === 0) {
          set({ error: 'No cards available with the selected filters' });
          return;
        }

        const session: QuizSession = {
          id: generateId(),
          startedAt: new Date().toISOString(),
          completedAt: null,
          cardIds: selectedCards.map((c) => c.id),
          currentIndex: 0,
          results: [],
          filters,
        };

        set({ currentSession: session, error: null });
      },

      answerCard: (cardId, correct, timeSpentMs) => {
        const state = get();
        if (!state.currentSession) return;

        const card = state.cards.find((c) => c.id === cardId);
        if (card) {
          const newConsecutive = correct ? card.consecutiveCorrect + 1 : 0;
          get().updateCard(cardId, {
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: calculateNextReview(newConsecutive),
            consecutiveCorrect: newConsecutive,
            totalAttempts: card.totalAttempts + 1,
            correctAttempts: card.correctAttempts + (correct ? 1 : 0),
          });
        }

        const result: QuizCardResult = {
          cardId,
          correct,
          timeSpentMs,
          answeredAt: new Date().toISOString(),
        };

        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                results: [...state.currentSession.results, result],
              }
            : null,
        }));
      },

      nextCard: () =>
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                currentIndex: state.currentSession.currentIndex + 1,
              }
            : null,
        })),

      endSession: () => {
        const state = get();
        if (!state.currentSession) return;

        const completedSession = {
          ...state.currentSession,
          completedAt: new Date().toISOString(),
        };

        set({
          currentSession: null,
          sessions: [completedSession, ...state.sessions],
        });
      },

      getCardsForReview: (filters) => {
        let filtered = get().cards;

        if (filters) {
          if (filters.categories.length > 0) {
            filtered = filtered.filter((c) => filters.categories.includes(c.category));
          }
          if (filters.cardTypes.length > 0) {
            filtered = filtered.filter((c) => filters.cardTypes.includes(c.type));
          }
          if (filters.difficulty) {
            filtered = filtered.filter((c) => c.difficulty === filters.difficulty);
          }
          if (filters.onlyDue) {
            const dueCards = get().getDueCards();
            filtered = filtered.filter((c) => dueCards.some((d) => d.id === c.id));
          }
        }

        return filtered;
      },

      getDueCards: () => {
        const now = new Date();
        return get().cards.filter((c) => {
          if (!c.nextReviewAt) return true;
          return new Date(c.nextReviewAt) <= now;
        });
      },

      getCardStats: () => {
        const cards = get().cards;
        const due = get().getDueCards();
        const mastered = cards.filter((c) => c.consecutiveCorrect >= 5);
        return {
          total: cards.length,
          mastered: mastered.length,
          learning: cards.length - mastered.length,
          due: due.length,
        };
      },

      getCategoryStats: (category) => {
        const cards = get().cards.filter((c) => c.category === category);
        return {
          correct: cards.reduce((sum, c) => sum + c.correctAttempts, 0),
          total: cards.reduce((sum, c) => sum + c.totalAttempts, 0),
        };
      },

      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'clinical-quiz',
      version: 1,
    }
  )
);
