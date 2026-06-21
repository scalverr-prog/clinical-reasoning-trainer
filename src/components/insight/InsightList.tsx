import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import type { Category } from '../../types';
import { useInsightStore } from '../../stores/insightStore';
import { InsightCard } from './InsightCard';
import { VALID_CATEGORIES } from '../../utils/insightPrompts';

interface InsightListProps {
  onAddNew: () => void;
}

export function InsightList({ onAddNew }: InsightListProps) {
  const { insights, getInsightsForReview } = useInsightStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [showDueOnly, setShowDueOnly] = useState(false);

  const insightsForReview = useMemo(() => getInsightsForReview(), [insights]);

  const filteredInsights = useMemo(() => {
    let filtered = showDueOnly ? insightsForReview : insights;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((i) => i.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.lessonLearned.toLowerCase().includes(query) ||
          i.structuredCase?.patientSummary.toLowerCase().includes(query) ||
          i.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [insights, insightsForReview, selectedCategory, showDueOnly, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: insights.length };
    insights.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [insights]);

  if (insights.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Insights Yet
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Start documenting your clinical experiences to build your personal
          knowledge base.
        </p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Add Your First Insight
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
        <div>
          <p className="text-blue-100 text-sm">Your Knowledge Base</p>
          <p className="text-2xl font-bold">{insights.length} Insights</p>
        </div>
        {insightsForReview.length > 0 && (
          <div className="text-right">
            <p className="text-blue-100 text-sm">Due for Review</p>
            <p className="text-2xl font-bold">{insightsForReview.length}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories ({categoryCounts.all})</option>
            {VALID_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Due Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDueOnly}
            onChange={(e) => setShowDueOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Due for review only</span>
        </label>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No insights match your filters.
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>
    </div>
  );
}
