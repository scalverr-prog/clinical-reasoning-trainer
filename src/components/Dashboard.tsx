import { useState, useMemo, useEffect, useRef } from 'react';
import { Zap, Brain, Heart, Stethoscope, AlertTriangle, Baby, Syringe, Activity, Flame, Target, ChevronRight, ChevronDown, Filter, Bone, Pill, Droplets, Scissors, PersonStanding, Radiation } from 'lucide-react';
import type { CaseWithCategory, Category } from '../types';
import { getAvailableCategories, getCasesForCategory } from '../utils/categoryMatcher';
import { useProgressStore } from '../stores/progressStore';

interface DashboardProps {
  cases: CaseWithCategory[];
  onStartCase: (caseData: CaseWithCategory) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Cardiac: { icon: <Heart className="w-6 h-6" />, color: 'text-red-600', bg: 'bg-red-100 hover:bg-red-200' },
  Neurology: { icon: <Brain className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-100 hover:bg-purple-200' },
  Pulmonary: { icon: <Stethoscope className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-100 hover:bg-blue-200' },
  Emergency: { icon: <AlertTriangle className="w-6 h-6" />, color: 'text-orange-600', bg: 'bg-orange-100 hover:bg-orange-200' },
  Pediatric: { icon: <Baby className="w-6 h-6" />, color: 'text-pink-600', bg: 'bg-pink-100 hover:bg-pink-200' },
  Infectious: { icon: <Syringe className="w-6 h-6" />, color: 'text-yellow-600', bg: 'bg-yellow-100 hover:bg-yellow-200' },
  'Wound Care': { icon: <Activity className="w-6 h-6" />, color: 'text-green-600', bg: 'bg-green-100 hover:bg-green-200' },
  Obstetric: { icon: <PersonStanding className="w-6 h-6" />, color: 'text-rose-600', bg: 'bg-rose-100 hover:bg-rose-200' },
  Endocrine: { icon: <Pill className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-100 hover:bg-amber-200' },
  Renal: { icon: <Droplets className="w-6 h-6" />, color: 'text-cyan-600', bg: 'bg-cyan-100 hover:bg-cyan-200' },
  GI: { icon: <Activity className="w-6 h-6" />, color: 'text-lime-600', bg: 'bg-lime-100 hover:bg-lime-200' },
  Psychiatry: { icon: <Brain className="w-6 h-6" />, color: 'text-indigo-600', bg: 'bg-indigo-100 hover:bg-indigo-200' },
  Trauma: { icon: <Bone className="w-6 h-6" />, color: 'text-slate-600', bg: 'bg-slate-100 hover:bg-slate-200' },
  Surgical: { icon: <Scissors className="w-6 h-6" />, color: 'text-teal-600', bg: 'bg-teal-100 hover:bg-teal-200' },
  Oncology: { icon: <Radiation className="w-6 h-6" />, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100 hover:bg-fuchsia-200' },
  default: { icon: <Activity className="w-6 h-6" />, color: 'text-gray-600', bg: 'bg-gray-100 hover:bg-gray-200' },
};

export function Dashboard({ cases, onStartCase }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { stats, completedCases } = useProgressStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = useMemo(() => getAvailableCategories(cases), [cases]);

  const filteredCases = useMemo(() => {
    if (!selectedCategory) return cases;
    return getCasesForCategory(cases, selectedCategory);
  }, [cases, selectedCategory]);

  const uncompletedCases = useMemo(() => {
    const completedMrns = new Set(completedCases.map(c => c.mrn));
    return filteredCases.filter(c => !completedMrns.has(c.mrn));
  }, [filteredCases, completedCases]);

  const handleQuickStart = () => {
    const availableCases = uncompletedCases.length > 0 ? uncompletedCases : filteredCases;
    if (availableCases.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCases.length);
      onStartCase(availableCases[randomIndex]);
    }
  };

  const handleCategoryClick = (category: Category) => {
    // Start a random case from this category
    const categoryCases = getCasesForCategory(cases, category);

    if (categoryCases.length === 0) {
      return; // No cases for this category
    }

    const completedMrns = new Set(completedCases.map(c => c.mrn));
    const uncompletedInCategory = categoryCases.filter(c => !completedMrns.has(c.mrn));
    const availableCases = uncompletedInCategory.length > 0 ? uncompletedInCategory : categoryCases;

    const randomIndex = Math.floor(Math.random() * availableCases.length);
    onStartCase(availableCases[randomIndex]);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Stats Row */}
          {stats.totalCases > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                <span className="text-slate-300">{stats.totalCases} done</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-slate-300">{stats.averageScore}%</span>
              </div>
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-slate-300">{stats.currentStreak}d</span>
                </div>
              )}
            </div>
          )}

          {/* Main CTA */}
          <div className="text-center py-4 sm:py-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Sharpen Your <span className="text-purple-400">Clinical Edge</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Learn from peer-reviewed cases. Build diagnostic expertise.
            </p>

            <button
              onClick={handleQuickStart}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-purple-600 hover:bg-purple-500 text-white text-base sm:text-xl font-semibold px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all hover:scale-105 shadow-lg shadow-purple-900/50"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              {selectedCategory ? `Start ${selectedCategory}` : 'Start Case'}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-slate-400 text-xs sm:text-sm mt-3 sm:mt-4">
              {uncompletedCases.length} waiting • {cases.length} total
            </p>
          </div>
        </div>
      </div>

      {/* Specialty Filter Dropdown */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4 mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:border-purple-300 transition-colors w-full md:w-auto"
          >
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <span className={(CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG.default).color}>
                    {selectedCategory}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({getCasesForCategory(cases, selectedCategory).length} cases)
                  </span>
                </span>
              ) : (
                'All Specialties'
              )}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 md:right-auto md:w-80 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 ${
                  !selectedCategory ? 'bg-purple-50' : ''
                }`}
              >
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="font-medium">All Specialties</span>
                <span className="text-gray-400 text-sm ml-auto">{cases.length}</span>
              </button>
              {categories.map(({ category, count }) => {
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <span className={config.color}>{config.icon}</span>
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-400 text-sm ml-auto">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(showAllCategories ? categories : categories.slice(0, 8)).map(({ category, count }) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                    : `border-transparent ${config.bg}`
                }`}
              >
                <div className={`${config.color} mb-2`}>{config.icon}</div>
                <div className="font-semibold text-gray-900">{category}</div>
                <div className="text-sm text-gray-500">{count} cases</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4">
          {categories.length > 8 && !showAllCategories && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Show all {categories.length} specialties →
            </button>
          )}
          {showAllCategories && (
            <button
              onClick={() => setShowAllCategories(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Show fewer
            </button>
          )}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              ← Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Case List */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {selectedCategory ? `${selectedCategory} Cases` : 'Recent Cases'}
        </h2>

        <div className="grid gap-3">
          {(showAll ? filteredCases : filteredCases.slice(0, 12)).map((caseData) => {
            const isCompleted = completedCases.some(c => c.mrn === caseData.mrn);
            const completedRecord = completedCases.find(c => c.mrn === caseData.mrn);

            return (
              <button
                key={caseData.mrn}
                onClick={() => onStartCase(caseData)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md hover:scale-[1.01] ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm text-gray-400">
                        {caseData.age}y {caseData.gender}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{caseData.unit}</span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          {completedRecord?.score}%
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 truncate">
                      {caseData.chief_complaint}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </button>
            );
          })}
        </div>

        {filteredCases.length > 12 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-3 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-colors font-medium"
          >
            Show all {filteredCases.length} cases
          </button>
        )}
        {showAll && filteredCases.length > 12 && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
