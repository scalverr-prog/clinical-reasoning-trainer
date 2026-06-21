import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useConferenceStore } from '../../stores/conferenceStore';
import { HEALTHCARE_SPECIALTIES } from '../../services/conferenceService';

interface ConferenceFiltersProps {
  onSearch: () => void;
}

export function ConferenceFilters({ onSearch }: ConferenceFiltersProps) {
  const { filters, setFilters, resetFilters } = useConferenceStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const current = filters.specialties;
    const updated = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    setFilters({ specialties: updated });
  };

  const handleReset = () => {
    resetFilters();
    onSearch();
  };

  const activeFilterCount =
    filters.specialties.length +
    (filters.virtual !== null ? 1 : 0) +
    (filters.hasCME ? 1 : 0) +
    (filters.hasCEU ? 1 : 0) +
    (filters.maxCost ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search conferences..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Quick filters:</span>

        <button
          onClick={() => {
            setFilters({ hasCEU: !filters.hasCEU });
            onSearch();
          }}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filters.hasCEU
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          CEU Available
        </button>

        <button
          onClick={() => {
            setFilters({ hasCME: !filters.hasCME });
            onSearch();
          }}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filters.hasCME
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          CME Available
        </button>

        <button
          onClick={() => {
            setFilters({ virtual: filters.virtual === true ? null : true });
            onSearch();
          }}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filters.virtual === true
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Virtual/Hybrid
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Filter className="w-4 h-4" />
          More Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => setFilters({ location: e.target.value || null })}
              placeholder="City or state..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Max Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Cost
            </label>
            <select
              value={filters.maxCost || ''}
              onChange={(e) =>
                setFilters({ maxCost: e.target.value ? parseInt(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">Any price</option>
              <option value="200">Under $200</option>
              <option value="500">Under $500</option>
              <option value="750">Under $750</option>
              <option value="1000">Under $1000</option>
            </select>
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {HEALTHCARE_SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    filters.specialties.includes(specialty)
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={onSearch}
            className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
