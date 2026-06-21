import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Eye, Clock, Tag } from 'lucide-react';
import type { ClinicalInsight } from '../../types';
import { useInsightStore } from '../../stores/insightStore';

interface InsightCardProps {
  insight: ClinicalInsight;
  onReview?: () => void;
}

export function InsightCard({ insight, onReview }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteInsight, markReviewed } = useInsightStore();

  const handleDelete = () => {
    deleteInsight(insight.id);
    setShowDeleteConfirm(false);
  };

  const handleReview = () => {
    markReviewed(insight.id);
    onReview?.();
  };

  const daysSinceReview = insight.lastReviewedAt
    ? Math.floor(
        (Date.now() - new Date(insight.lastReviewedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const needsReview = daysSinceReview === null || daysSinceReview >= 7;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {insight.category}
              </span>
              {needsReview && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Review Due
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">
              {insight.structuredCase?.patientSummary || 'Clinical Insight'}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {insight.lessonLearned}
            </p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Tags */}
        {insight.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Tag className="w-3 h-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {insight.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Structured Case */}
          {insight.structuredCase && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Presentation
                </h4>
                <p className="text-sm text-gray-600">
                  {insight.structuredCase.presentation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Initial Assessment
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.structuredCase.initialAssessment}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Actual Outcome
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.structuredCase.actualOutcome}
                  </p>
                </div>
              </div>

              {insight.structuredCase.keyFindings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Key Findings
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {insight.structuredCase.keyFindings.map((finding, i) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Clinical Pearls */}
          {insight.clinicalPearls.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-purple-800 mb-2">
                Clinical Pearls
              </h4>
              <ul className="text-sm text-purple-700 space-y-1">
                {insight.clinicalPearls.map((pearl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400">*</span>
                    {pearl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Takeaways */}
          {insight.keyTakeaways.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Key Takeaways
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {insight.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400">-</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Created {new Date(insight.createdAt).toLocaleDateString()}
            </span>
            <span>Reviewed {insight.reviewCount} times</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleReview}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Mark Reviewed
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
