import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, FileText, ChevronDown, ChevronUp, AlertTriangle, Stethoscope } from 'lucide-react';
import type { CaseWithCategory } from '../types';
import { MarkdownRenderer } from './shared/MarkdownRenderer';

interface ExpertComparisonProps {
  expertAnalysis: string;
  caseData: CaseWithCategory;
  onBack: () => void;
  onComplete: () => void;
}

export function ExpertComparison({
  expertAnalysis,
  caseData,
  onBack,
  onComplete,
}: ExpertComparisonProps) {
  const [showCaseSummary, setShowCaseSummary] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Evaluation
      </button>

      {/* Expert Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Expert Analysis</h3>
        </div>
        <div className="p-6 overflow-y-auto">
          <MarkdownRenderer content={expertAnalysis} />
        </div>
      </div>

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

      {/* Complete Button */}
      <div className="flex justify-center">
        <button
          onClick={onComplete}
          className="py-3 px-8 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Complete Case & Return to Dashboard
        </button>
      </div>
    </div>
  );
}
