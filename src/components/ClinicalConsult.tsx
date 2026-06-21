import { useState } from 'react';
import {
  FileText,
  Loader2,
  AlertTriangle,
  Stethoscope,
  ClipboardPaste,
  RotateCcw,
  CheckCircle,
  Activity,
  Pill,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Clock,
  Clipboard,
} from 'lucide-react';
import { MarkdownRenderer } from './shared/MarkdownRenderer';
import { useClinicalHistoryStore } from '../stores/clinicalHistoryStore';

type Step = 'input' | 'result';

interface AnalysisResult {
  primaryDiagnosis: string;
  differentialDiagnoses: string[];
  keyFindings: string[];
  criticalActions: string[];
  treatmentProvided: string[];
  treatmentAccuracy: 'appropriate' | 'partially_appropriate' | 'needs_improvement';
  treatmentFeedback: string;
  recommendedTreatment: string[];
  clinicalPearls: string[];
  redFlags: string[];
}

export function ClinicalConsult() {
  const [step, setStep] = useState<Step>('input');
  const [clinicalNote, setClinicalNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addCase, getContextForAI, cases } = useClinicalHistoryStore();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClinicalNote(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleRunAnalysis = async () => {
    if (!clinicalNote.trim()) {
      setError('Please enter a clinical note first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const learnerContext = getContextForAI();

      const prompt = `You are an experienced clinical educator providing comprehensive case analysis and clinical insights. Analyze this clinical case thoroughly.
${learnerContext}

CLINICAL CASE:
${clinicalNote}

INSTRUCTIONS:
1. Identify the most likely primary diagnosis based on the clinical presentation
2. List reasonable differential diagnoses
3. Extract key clinical findings from the note
4. Identify any critical/time-sensitive actions needed
5. Parse out any treatments, interventions, medications, or procedures documented
6. Evaluate the appropriateness of treatment if provided
7. Provide relevant clinical pearls for this case type
8. Note any red flags or concerning findings

Please provide your analysis in the following JSON format (and ONLY JSON, no other text):
{
  "primaryDiagnosis": "The most likely primary diagnosis with brief supporting rationale",
  "differentialDiagnoses": ["List of 3-5 other diagnoses to consider"],
  "keyFindings": ["List of 4-6 key clinical findings from the case"],
  "criticalActions": ["Time-sensitive or critical actions needed for this presentation"],
  "treatmentProvided": ["List treatments/interventions documented in the note. Use ['No treatment documented'] if none found"],
  "treatmentAccuracy": "appropriate" | "partially_appropriate" | "needs_improvement",
  "treatmentFeedback": "2-3 sentences evaluating the treatment approach",
  "recommendedTreatment": ["Standard treatment recommendations for this diagnosis"],
  "clinicalPearls": ["3-4 teaching points or clinical pearls relevant to this case"],
  "redFlags": ["Any concerning findings or red flags to monitor"]
}

Be thorough and educational in your analysis.`;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const content = data.content[0]?.text || '';
      setRawResponse(content);

      let parsedAnalysis: AnalysisResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        parsedAnalysis = {
          primaryDiagnosis: 'See detailed analysis below',
          differentialDiagnoses: [],
          keyFindings: [],
          criticalActions: [],
          treatmentProvided: [],
          treatmentAccuracy: 'partially_appropriate',
          treatmentFeedback: '',
          recommendedTreatment: [],
          clinicalPearls: [],
          redFlags: [],
        };
      }

      setAnalysis(parsedAnalysis);

      addCase({
        clinicalNote,
        userAssessment: '',
        userDifferentials: '',
        userPlan: '',
        actualDiagnosis: parsedAnalysis.primaryDiagnosis,
        userAccuracy: 'correct',
        feedback: `Analyzed case: ${parsedAnalysis.primaryDiagnosis}`,
        keyFindings: parsedAnalysis.keyFindings,
        missedFindings: [],
        learningPoints: parsedAnalysis.clinicalPearls,
        treatmentProvided: parsedAnalysis.treatmentProvided,
        treatmentAccuracy: parsedAnalysis.treatmentAccuracy,
        treatmentFeedback: parsedAnalysis.treatmentFeedback,
        recommendedTreatment: parsedAnalysis.recommendedTreatment,
      });

      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setClinicalNote('');
    setAnalysis(null);
    setRawResponse(null);
    setError(null);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Professional Header */}
      <div className="bg-slate-900 rounded-t-xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                Clinical Case Analysis
              </h1>
              <p className="text-slate-400 text-sm">{currentDate}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-slate-400">Cases Analyzed</p>
              <p className="text-2xl font-bold text-white">{cases.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center gap-2 text-cyan-400">
              <Activity className="w-4 h-4" />
              <span>AI-Assisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 px-4 sm:px-5 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">STATUS:</span>
          <span className={`flex items-center gap-1.5 ${step === 'input' ? 'text-amber-400' : 'text-emerald-400'}`}>
            <span className={`w-2 h-2 rounded-full ${step === 'input' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {step === 'input' ? 'AWAITING INPUT' : 'ANALYSIS COMPLETE'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl">
        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>
              <span className="font-semibold">Educational Use Only</span> — This analysis is for learning purposes and should not replace clinical judgment.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Step 1: Input */}
          {step === 'input' && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-5 h-5 text-slate-600" />
                    <h2 className="font-semibold text-slate-900">Clinical Documentation</h2>
                  </div>
                  <button
                    onClick={handlePaste}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-300"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Paste from Clipboard
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    placeholder="Enter clinical case documentation...

Include relevant history, physical exam findings, vital signs, laboratory values, and any interventions performed."
                    className="w-full h-64 p-4 bg-slate-50 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm font-mono text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {clinicalNote.length} characters
                  </div>
                </div>
              </div>

              {/* Analysis Options */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Analysis will include:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { icon: Activity, label: 'Primary Dx' },
                    { icon: FileText, label: 'Differentials' },
                    { icon: Pill, label: 'Treatment Review' },
                    { icon: BookOpen, label: 'Clinical Pearls' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-600">
                      <Icon className="w-4 h-4 text-cyan-600" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={!clinicalNote.trim() || isAnalyzing}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Clinical Data...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Generate Clinical Analysis</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Step 2: Results */}
          {step === 'result' && analysis && (
            <div className="space-y-4">
              {/* Primary Diagnosis Card */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-5 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      Primary Assessment
                    </p>
                    <p className="text-lg font-semibold leading-snug">
                      {analysis.primaryDiagnosis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Differential Diagnoses */}
                {analysis.differentialDiagnoses.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Differential Diagnoses
                    </h3>
                    <ul className="space-y-2">
                      {analysis.differentialDiagnoses.map((dx, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="w-5 h-5 bg-slate-100 rounded text-xs flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {dx}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Findings */}
                {analysis.keyFindings.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Key Clinical Findings
                    </h3>
                    <ul className="space-y-2">
                      {analysis.keyFindings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Red Flags - Full Width Alert */}
              {analysis.redFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Red Flags / Critical Concerns
                  </h3>
                  <ul className="space-y-2">
                    {analysis.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Critical Actions */}
              {analysis.criticalActions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time-Sensitive Actions
                  </h3>
                  <ul className="space-y-2">
                    {analysis.criticalActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Section */}
              {analysis.treatmentProvided && analysis.treatmentProvided.length > 0 &&
               analysis.treatmentProvided[0] !== 'No treatment documented' && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    analysis.treatmentAccuracy === 'appropriate'
                      ? 'bg-emerald-50 border-emerald-200'
                      : analysis.treatmentAccuracy === 'partially_appropriate'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Treatment Analysis
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      analysis.treatmentAccuracy === 'appropriate'
                        ? 'bg-emerald-100 text-emerald-700'
                        : analysis.treatmentAccuracy === 'partially_appropriate'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {analysis.treatmentAccuracy === 'appropriate' ? 'APPROPRIATE'
                        : analysis.treatmentAccuracy === 'partially_appropriate' ? 'PARTIAL'
                        : 'NEEDS REVIEW'}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Documented Interventions</p>
                      <ul className="space-y-1">
                        {analysis.treatmentProvided.map((treatment, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                            {treatment}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {analysis.treatmentFeedback && (
                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3">
                        {analysis.treatmentFeedback}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Treatment */}
              {analysis.recommendedTreatment && analysis.recommendedTreatment.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Recommended Management
                  </h3>
                  <ul className="space-y-2">
                    {analysis.recommendedTreatment.map((treatment, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-cyan-800">
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinical Pearls */}
              {analysis.clinicalPearls.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Clinical Pearls
                  </h3>
                  <ul className="space-y-3">
                    {analysis.clinicalPearls.map((pearl, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-indigo-900">
                        <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600 flex-shrink-0">
                          {i + 1}
                        </span>
                        {pearl}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Source Note */}
              <details className="bg-slate-50 rounded-lg border border-slate-200">
                <summary className="p-4 cursor-pointer flex items-center gap-2 text-slate-600 text-sm font-medium hover:text-slate-900">
                  <FileText className="w-4 h-4" />
                  View Source Documentation
                </summary>
                <div className="px-4 pb-4">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white p-4 rounded border border-slate-200 font-mono">
                    {clinicalNote}
                  </pre>
                </div>
              </details>

              {/* Raw Response Fallback */}
              {!analysis.keyFindings.length && !analysis.clinicalPearls.length && rawResponse && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Detailed Analysis</h3>
                  <MarkdownRenderer content={rawResponse} />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Analyze New Case</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-slate-400">
        Powered by AI Clinical Analysis Engine • For Educational Purposes Only
      </div>
    </div>
  );
}
