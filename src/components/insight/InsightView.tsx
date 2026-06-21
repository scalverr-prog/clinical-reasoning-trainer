import { useState } from 'react';
import { Plus, GitCompare, History, Lightbulb } from 'lucide-react';
import { InsightForm } from './InsightForm';
import { InsightList } from './InsightList';
import { CaseComparison } from './CaseComparison';
import { CaseHistory } from './CaseHistory';

type InsightViewMode = 'list' | 'add' | 'compare';
type TabType = 'insights' | 'history';

export function InsightView() {
  const [mode, setMode] = useState<InsightViewMode>('list');
  const [activeTab, setActiveTab] = useState<TabType>('history');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {mode === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Insights</h1>
              <p className="text-sm text-gray-600">
                Your personal clinical learning journey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('compare')}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </button>
              <button
                onClick={() => setMode('add')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Insight</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              Case History
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              My Notes
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'history' ? (
            <CaseHistory />
          ) : (
            <InsightList onAddNew={() => setMode('add')} />
          )}
        </>
      )}

      {mode === 'add' && (
        <InsightForm
          onComplete={() => setMode('list')}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'compare' && (
        <CaseComparison
          onComplete={() => setMode('list')}
          onCancel={() => setMode('list')}
        />
      )}
    </div>
  );
}
