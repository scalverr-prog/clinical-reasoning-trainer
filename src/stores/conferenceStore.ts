import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conference, SavedConference, ConferenceFilters } from '../types';

interface ConferenceStore {
  savedConferences: SavedConference[];
  searchResults: Conference[];
  filters: ConferenceFilters;
  isSearching: boolean;
  totalResults: number;
  currentPage: number;
  error: string | null;

  // Save/unsave actions
  saveConference: (conference: Conference, userId: string) => void;
  unsaveConference: (conferenceId: string) => void;
  updateSavedConference: (id: string, updates: Partial<SavedConference>) => void;
  markRegistered: (conferenceId: string, attendanceType: 'in_person' | 'virtual') => void;

  // Search actions
  setSearchResults: (conferences: Conference[], total: number, page: number) => void;
  setFilters: (filters: Partial<ConferenceFilters>) => void;
  resetFilters: () => void;
  setSearching: (searching: boolean) => void;
  setError: (error: string | null) => void;

  // Queries
  isSaved: (conferenceId: string) => boolean;
  getSavedConference: (conferenceId: string) => SavedConference | undefined;
  getUpcomingRegistered: () => SavedConference[];

  // Utility
  clearAll: () => void;
}

const DEFAULT_FILTERS: ConferenceFilters = {
  searchQuery: '',
  specialties: [],
  dateRange: null,
  location: null,
  virtual: null,
  hasCME: false,
  hasCEU: false,
  maxCost: null,
};

export const useConferenceStore = create<ConferenceStore>()(
  persist(
    (set, get) => ({
      savedConferences: [],
      searchResults: [],
      filters: DEFAULT_FILTERS,
      isSearching: false,
      totalResults: 0,
      currentPage: 1,
      error: null,

      saveConference: (conference, userId) => {
        const saved: SavedConference = {
          id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          conferenceId: conference.id,
          conference,
          savedAt: new Date().toISOString(),
          registered: false,
          registrationDate: null,
          attendanceType: null,
          notes: '',
          reminderSet: false,
          reminderDate: null,
        };
        set((state) => ({
          savedConferences: [...state.savedConferences, saved],
        }));
      },

      unsaveConference: (conferenceId) => {
        set((state) => ({
          savedConferences: state.savedConferences.filter(
            (s) => s.conferenceId !== conferenceId
          ),
        }));
      },

      updateSavedConference: (id, updates) => {
        set((state) => ({
          savedConferences: state.savedConferences.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      markRegistered: (conferenceId, attendanceType) => {
        set((state) => ({
          savedConferences: state.savedConferences.map((s) =>
            s.conferenceId === conferenceId
              ? {
                  ...s,
                  registered: true,
                  registrationDate: new Date().toISOString(),
                  attendanceType,
                }
              : s
          ),
        }));
      },

      setSearchResults: (conferences, total, page) => {
        set({
          searchResults: conferences,
          totalResults: total,
          currentPage: page,
        });
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      setSearching: (searching) => {
        set({ isSearching: searching });
      },

      setError: (error) => {
        set({ error });
      },

      isSaved: (conferenceId) => {
        return get().savedConferences.some((s) => s.conferenceId === conferenceId);
      },

      getSavedConference: (conferenceId) => {
        return get().savedConferences.find((s) => s.conferenceId === conferenceId);
      },

      getUpcomingRegistered: () => {
        const now = new Date();
        return get()
          .savedConferences.filter((s) => {
            if (!s.registered) return false;
            const startDate = new Date(s.conference.startDate);
            return startDate >= now;
          })
          .sort(
            (a, b) =>
              new Date(a.conference.startDate).getTime() -
              new Date(b.conference.startDate).getTime()
          );
      },

      clearAll: () => {
        set({
          savedConferences: [],
          searchResults: [],
          filters: DEFAULT_FILTERS,
          error: null,
        });
      },
    }),
    {
      name: 'clinical-conferences',
      version: 1,
      partialize: (state) => ({
        savedConferences: state.savedConferences,
        filters: state.filters,
      }),
    }
  )
);
