import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, XCircle, AlertTriangle, Lightbulb, Target, Mic, MicOff, Loader2 } from 'lucide-react';
import type { CaseComparisonInput, ExpertAnalysis } from '../../types';
import { useProgressStore } from '../../stores/progressStore';
import { generateExpertAnalysis, compareWithExpert, parseDictation, type ComparisonFeedback } from '../../services/llmService';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface CaseComparisonProps {
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = 'input' | 'parsing' | 'analyzing' | 'comparing' | 'results';

export function CaseComparison({ onComplete, onCancel }: CaseComparisonProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [scenario, setScenario] = useState('');
  const [userAssessment, setUserAssessment] = useState('');
  const [userWorkup, setUserWorkup] = useState('');
  const [userTreatment, setUserTreatment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expertAnalysis, setExpertAnalysis] = useState<ExpertAnalysis | null>(null);
  const [comparison, setComparison] = useState<ComparisonFeedback | null>(null);

  // Dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { apiKey } = useProgressStore();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setDictationText(prev => prev + final);
        }
        setInterimText(interim);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setError('Speech recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setDictationText('');
      setInterimText('');
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleParseDictation = async () => {
    const textToParse = dictationText.trim();
    if (!textToParse) {
      setError('No dictation to parse. Please record first.');
      return;
    }
    if (!apiKey) {
      setError('Please add your API key in Settings');
      return;
    }

    setPhase('parsing');
    setError(null);

    try {
      const parsed = await parseDictation(apiKey, textToParse);
      setScenario(parsed.scenario);
      setUserAssessment(parsed.assessment);
      setUserWorkup(parsed.workup);
      setUserTreatment(parsed.treatment);
      setDictationText('');
      setPhase('input');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse dictation');
      setPhase('input');
    }
  };

  const handleSubmit = async () => {
    if (!scenario.trim()) {
      setError('Please enter a clinical scenario');
      return;
    }
    if (!userAssessment.trim() && !userWorkup.trim() && !userTreatment.trim()) {
      setError('Please provide at least one of: assessment, workup, or treatment plan');
      return;
    }
    if (!apiKey) {
      setError('Please add your API key in Settings');
      return;
    }

    setError(null);
    setPhase('analyzing');

    try {
      // Step 1: Generate expert analysis
      const expert = await generateExpertAnalysis(apiKey, scenario);
      setExpertAnalysis(expert);
      setPhase('comparing');

      // Step 2: Compare user's response with expert
      const userInput: CaseComparisonInput = {
        scenario,
        userAssessment,
        userWorkup,
        userTreatment,
      };
      const comparisonResult = await compareWithExpert(apiKey, scenario, userInput, expert);
      setComparison(comparisonResult);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setPhase('input');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Case Comparison</h2>
          <p className="text-gray-600">
            Create a case and compare your plan with expert analysis
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Phase: Input */}
      {phase === 'input' && (
        <div className="space-y-6">
          {/* Dictation Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600" />
              Voice Dictation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Dictate your case and reasoning - AI will parse it into the form fields automatically.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Dictation
                  </>
                )}
              </button>

              {dictationText && !isRecording && (
                <button
                  onClick={handleParseDictation}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Parse into Form
                </button>
              )}
            </div>

            {(dictationText || interimText || isRecording) && (
              <div className="bg-white rounded-lg border border-indigo-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isRecording ? 'Listening...' : 'Dictation:'}
                </p>
                <p className="text-gray-800">
                  {dictationText}
                  <span className="text-gray-400 italic">{interimText}</span>
                  {isRecording && <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" />}
                </p>
              </div>
            )}
          </div>

          {/* Scenario Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Clinical Scenario
            </h3>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the clinical scenario...

Example: A 58-year-old male presents to the ED with sudden onset chest pain radiating to the left arm, diaphoresis, and shortness of breath. He has a history of hypertension and diabetes. Vitals: BP 160/95, HR 110, RR 22, SpO2 94% on room air."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Your Response */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Your Clinical Reasoning
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment / Differential Diagnosis
              </label>
              <textarea
                value={userAssessment}
                onChange={(e) => setUserAssessment(e.target.value)}
                placeholder="What do you think is going on? List your differential diagnoses..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workup Plan
              </label>
              <textarea
                value={userWorkup}
                onChange={(e) => setUserWorkup(e.target.value)}
                placeholder="What tests/imaging would you order? What questions would you ask?"
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Plan
              </label>
              <textarea
                value={userTreatment}
                onChange={(e) => setUserTreatment(e.target.value)}
                placeholder="What treatments would you initiate? Any time-critical interventions?"
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!scenario.trim()}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Compare with Expert Analysis
          </button>
        </div>
      )}

      {/* Phase: Parsing Dictation */}
      {phase === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
            <Loader2 className="w-10 h-10 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            Parsing your dictation...
          </p>
          <p className="text-gray-500 mt-2">
            Extracting scenario, assessment, workup, and treatment
          </p>
        </div>
      )}

      {/* Phase: Analyzing */}
      {(phase === 'analyzing' || phase === 'comparing') && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
            <Sparkles className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            {phase === 'analyzing' ? 'Generating expert analysis...' : 'Comparing your response...'}
          </p>
          <p className="text-gray-500 mt-2">
            {phase === 'analyzing'
              ? 'Creating comprehensive clinical assessment'
              : 'Evaluating your clinical reasoning'}
          </p>
        </div>
      )}

      {/* Phase: Results */}
      {phase === 'results' && expertAnalysis && comparison && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Your Scores</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(comparison.scores).map(([key, score]) => (
                <div key={key} className="text-center">
                  <div className={`text-3xl font-bold rounded-xl py-2 ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <p className="text-purple-200 text-sm mt-1 capitalize">{key}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Your Response */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Your Response
              </h3>
              <div className="space-y-4">
                {userAssessment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assessment</p>
                    <p className="text-sm text-gray-600 mt-1">{userAssessment}</p>
                  </div>
                )}
                {userWorkup && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Workup</p>
                    <p className="text-sm text-gray-600 mt-1">{userWorkup}</p>
                  </div>
                )}
                {userTreatment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Treatment</p>
                    <p className="text-sm text-gray-600 mt-1">{userTreatment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expert Analysis */}
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Expert Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Assessment</p>
                  <p className="text-sm text-gray-600 mt-1">{expertAnalysis.assessment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Differentials</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    {expertAnalysis.differentials.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Workup</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    {expertAnalysis.workup.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Treatment</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    {expertAnalysis.treatment.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Actions */}
          {expertAnalysis.criticalActions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Actions
              </h3>
              <ul className="space-y-2">
                {expertAnalysis.criticalActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-red-700">
                    <span className="text-red-400 mt-1">!</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pitfalls */}
          {expertAnalysis.pitfalls.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Pitfalls to Avoid
              </h3>
              <ul className="space-y-2">
                {expertAnalysis.pitfalls.map((pitfall, i) => (
                  <li key={i} className="flex items-start gap-2 text-amber-700">
                    <span className="text-amber-400 mt-1">*</span>
                    {pitfall}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {comparison.feedback.strengths.map((s, i) => (
                  <li key={i}>+ {s}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Areas to Improve
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {comparison.feedback.improvements.map((s, i) => (
                  <li key={i}>* {s}</li>
                ))}
              </ul>
            </div>

            {/* Missed */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Missed
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {comparison.feedback.missed.map((s, i) => (
                  <li key={i}>- {s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setPhase('input');
                setScenario('');
                setUserAssessment('');
                setUserWorkup('');
                setUserTreatment('');
                setExpertAnalysis(null);
                setComparison(null);
              }}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Try Another Case
            </button>
            <button
              onClick={onComplete}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
