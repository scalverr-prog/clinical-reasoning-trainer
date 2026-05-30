import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Award, FileText, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import type { EvaluationFeedback, CaseWithCategory } from '../types';
import { getScoreGrade } from '../utils/scoring';

interface EvaluationProps {
  feedback: EvaluationFeedback;
  caseData: CaseWithCategory;
  onViewExpert: () => void;
  onComplete: () => void;
}

export function Evaluation({ feedback, caseData, onViewExpert, onComplete }: EvaluationProps) {
  const [showCaseSummary, setShowCaseSummary] = useState(false);
  const { grade, color } = getScoreGrade(feedback.scores.overall);

  const scoreCategories = [
    { key: 'clinicalReasoning', label: 'Clinical Reasoning', weight: '25%' },
    { key: 'differentialDiagnosis', label: 'Differential Diagnosis', weight: '20%' },
    { key: 'informationGathering', label: 'Information Gathering', weight: '20%' },
    { key: 'treatmentPlan', label: 'Treatment Plan', weight: '20%' },
    { key: 'safetyAwareness', label: 'Safety Awareness', weight: '15%' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
          <div className="text-6xl font-bold mb-2">{feedback.scores.overall}</div>
          <div className="text-xl opacity-90">out of 100</div>
          <div className={`mt-2 inline-block px-4 py-1 rounded-full bg-white/20 ${color}`}>
            {grade}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {scoreCategories.map(({ key, label, weight }) => {
              const score = feedback.scores[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {label} <span className="text-gray-400">({weight})</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, idx) => (
              <li key={idx} className="text-green-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.areasForImprovement.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.areasForImprovement.map((area, idx) => (
              <li key={idx} className="text-amber-700 flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missed Findings */}
      {feedback.missedFindings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Missed Findings
          </h3>
          <ul className="space-y-2">
            {feedback.missedFindings.map((finding, idx) => (
              <li key={idx} className="text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expert Comparison Summary */}
      {feedback.expertComparison && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Expert Comparison
          </h3>
          <p className="text-blue-700">{feedback.expertComparison}</p>
        </div>
      )}

      {/* Review Case Summary */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCaseSummary(!showCaseSummary)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-gray-800">Review Case Summary</span>
            <span className="text-sm text-gray-500">(What you were presented)</span>
          </div>
          {showCaseSummary ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showCaseSummary && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-slate-50">
            {/* Patient Header */}
            <div className="bg-slate-800 text-white rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xl font-bold">{caseData.age}y {caseData.gender}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">{caseData.unit}</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-400">Room {caseData.room}</span>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Chief Complaint:</span>
                <span className="text-lg">{caseData.chief_complaint}</span>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <h4 className="font-semibold text-gray-700">Clinical Notes</h4>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{caseData.recent_notes}</p>
            </div>

            {/* Documented Assessment & Plan */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5 text-amber-700" />
                <h4 className="font-semibold text-amber-800">Documented Assessment & Plan</h4>
              </div>
              <p className="text-lg font-medium text-gray-900">{caseData.diagnosis}</p>
              {caseData.medications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">Current Orders:</p>
                  <ul className="text-sm text-gray-700">
                    {caseData.medications.map((med, i) => (
                      <li key={i}>• {med}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onViewExpert}
          className="flex-1 py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
        >
          View Expert Analysis
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Complete Case
        </button>
      </div>
    </div>
  );
}
