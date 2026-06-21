import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Brain,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useClinicalHistoryStore, type ClinicalCaseRecord } from '../../stores/clinicalHistoryStore';

export function CaseHistory() {
  const { cases, profile, starCase, deleteCase } = useClinicalHistoryStore();
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'starred' | 'correct' | 'needs_review'>('all');

  const filteredCases = cases.filter((c) => {
    if (filter === 'starred') return c.starred;
    if (filter === 'correct') return c.userAccuracy === 'correct';
    if (filter === 'needs_review') return c.userAccuracy === 'incorrect';
    return true;
  });

  const getAccuracyIcon = (accuracy: string) => {
    switch (accuracy) {
      case 'correct':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
          <Stethoscope className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Start using AI Consult to analyze cases. Your case history and learning patterns will appear here.
        </p>
      </div>
    );
  }

  const totalCases = cases.length;
  const correctPct = totalCases > 0
    ? Math.round((profile.diagnosticAccuracy.correct / totalCases) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Learning Profile Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Learning Profile</h3>
            <p className="text-sm text-gray-600">Based on {totalCases} case{totalCases !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{profile.diagnosticAccuracy.correct}</p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{profile.diagnosticAccuracy.partial}</p>
            <p className="text-xs text-gray-500">Partial</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{profile.diagnosticAccuracy.incorrect}</p>
            <p className="text-xs text-gray-500">Needs Work</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{correctPct}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
        </div>

        {profile.commonMissedFindings.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-1">Common areas to review:</p>
            <p className="text-sm text-amber-700">
              {profile.commonMissedFindings.slice(0, 3).join(' • ')}
            </p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Cases' },
          { key: 'starred', label: 'Starred' },
          { key: 'correct', label: 'Correct' },
          { key: 'needs_review', label: 'Needs Review' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No cases match this filter</p>
        ) : (
          filteredCases.map((caseRecord) => (
            <CaseCard
              key={caseRecord.id}
              caseRecord={caseRecord}
              isExpanded={expandedCase === caseRecord.id}
              onToggle={() => setExpandedCase(expandedCase === caseRecord.id ? null : caseRecord.id)}
              onStar={() => starCase(caseRecord.id)}
              onDelete={() => deleteCase(caseRecord.id)}
              getAccuracyIcon={getAccuracyIcon}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CaseCardProps {
  caseRecord: ClinicalCaseRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onStar: () => void;
  onDelete: () => void;
  getAccuracyIcon: (accuracy: string) => React.ReactNode;
  formatDate: (date: string) => string;
}

function CaseCard({
  caseRecord,
  isExpanded,
  onToggle,
  onStar,
  onDelete,
  getAccuracyIcon,
  formatDate,
}: CaseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {getAccuracyIcon(caseRecord.userAccuracy)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {caseRecord.actualDiagnosis}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(caseRecord.timestamp)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                caseRecord.userAccuracy === 'correct'
                  ? 'bg-green-100 text-green-700'
                  : caseRecord.userAccuracy === 'partial'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {caseRecord.userAccuracy === 'correct' ? 'Correct' : caseRecord.userAccuracy === 'partial' ? 'Partial' : 'Incorrect'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              {caseRecord.starred ? (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* Your Assessment */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Your Assessment:</p>
            <p className="text-sm text-gray-600">{caseRecord.userAssessment || 'Not provided'}</p>
            {caseRecord.userDifferentials && (
              <p className="text-sm text-gray-500 mt-1">
                <strong>Differentials:</strong> {caseRecord.userDifferentials}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-700">{caseRecord.feedback}</p>
          </div>

          {/* Key Findings */}
          {caseRecord.keyFindings.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Key Findings:</p>
              <ul className="text-sm text-green-600 space-y-1">
                {caseRecord.keyFindings.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missed Findings */}
          {caseRecord.missedFindings.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Missed:</p>
              <ul className="text-sm text-amber-600 space-y-1">
                {caseRecord.missedFindings.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Points */}
          {caseRecord.learningPoints.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Learning Points:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                {caseRecord.learningPoints.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Original Note Preview */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              View original case note
            </summary>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">
              {caseRecord.clinicalNote}
            </p>
          </details>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this case from your history?')) {
                  onDelete();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
