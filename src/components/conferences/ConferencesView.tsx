import { useState, useEffect, useCallback } from 'react';
import { Calendar, Search, Bookmark, Loader2, AlertCircle } from 'lucide-react';
import { useConferenceStore } from '../../stores/conferenceStore';
import { searchConferences } from '../../services/conferenceService';
import { ConferenceCard } from './ConferenceCard';
import { ConferenceFilters } from './ConferenceFilters';
import { SavedConferences } from './SavedConferences';

type Tab = 'search' | 'saved';

export function ConferencesView() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const {
    searchResults,
    filters,
    isSearching,
    totalResults,
    currentPage,
    error,
    savedConferences,
    setSearchResults,
    setSearching,
    setError,
  } = useConferenceStore();

  const handleSearch = useCallback(async (page = 1) => {
    setSearching(true);
    setError(null);

    try {
      const results = await searchConferences(filters, page);
      setSearchResults(results.conferences, results.total, results.page);
    } catch (err) {
      setError('Failed to search conferences. Please try again.');
      console.error('Conference search error:', err);
    } finally {
      setSearching(false);
    }
  }, [filters, setSearchResults, setSearching, setError]);

  // Initial search on mount
  useEffect(() => {
    if (searchResults.length === 0) {
      handleSearch();
    }
  }, []);

  const totalPages = Math.ceil(totalResults / 20);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'search', label: 'Find Conferences' },
    { id: 'saved', label: 'Saved', count: savedConferences.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Conferences</h1>
          <p className="text-gray-600">
            Find conferences to expand your expertise and earn continuing education credits
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          Powered by Triago for Healthcare
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.id === 'search' ? (
                <Search className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Filters */}
          <ConferenceFilters onSearch={() => handleSearch(1)} />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
              <p className="text-gray-600">Searching conferences...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {searchResults.length} of {totalResults} conferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg mb-2">No conferences found</p>
              <p className="text-gray-400">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && <SavedConferences />}
    </div>
  );
}
