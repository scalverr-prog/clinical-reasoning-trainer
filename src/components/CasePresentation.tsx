import { AlertTriangle, FileText, Stethoscope, Activity, History, FlaskConical } from 'lucide-react';
import type { CaseWithCategory } from '../types';

interface CasePresentationProps {
  caseData: CaseWithCategory;
}

export function CasePresentation({ caseData }: CasePresentationProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Patient Header */}
      <div className="bg-slate-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">
              {caseData.age}y {caseData.gender}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">{caseData.unit}</span>
            <span className="text-slate-400">|</span>
            <span className="text-blue-400">Room {caseData.room}</span>
          </div>
          <div className="flex gap-2">
            {caseData.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Chief Complaint:</span>
          <span className="text-lg">{caseData.chief_complaint}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-700">Vital Signs</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">BP</div>
            <div className="font-semibold text-gray-900">{caseData.vitals.bp}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">HR</div>
            <div className="font-semibold text-gray-900">{caseData.vitals.hr}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">RR</div>
            <div className="font-semibold text-gray-900">{caseData.vitals.rr}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Temp</div>
            <div className="font-semibold text-gray-900">{caseData.vitals.temp}°F</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">SpO2</div>
            <div className="font-semibold text-gray-900">{caseData.vitals.spo2}%</div>
          </div>
        </div>
      </div>

      {/* Past Medical History */}
      {caseData.pmh.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Past Medical History</h3>
          </div>
          <ul className="space-y-1">
            {caseData.pmh.map((item, idx) => (
              <li key={idx} className="text-gray-700 flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinical Notes */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-700">Clinical Notes</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {caseData.recent_notes}
        </div>
      </div>

      {/* Labs (if available, but NOT the critical analysis) */}
      {caseData.labs && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold text-gray-700">Labs / Additional Data</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-gray-800">
            {/* Only show labs info before "CRITICAL:" if present */}
            {caseData.labs.includes('CRITICAL:')
              ? caseData.labs.split('CRITICAL:')[0].trim() || 'See documented assessment'
              : caseData.labs}
          </div>
        </div>
      )}

      {/* Documented Assessment - This is often WRONG */}
      <div className="p-6 bg-amber-50">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-amber-700" />
          <h3 className="font-semibold text-amber-800">Documented Assessment & Plan</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200">
          <p className="text-lg font-medium text-gray-900">{caseData.diagnosis}</p>
          {caseData.medications.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Current Orders:</p>
              <ul className="text-sm text-gray-700">
                {caseData.medications.map((med, i) => (
                  <li key={i}>• {med}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
