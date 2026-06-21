import { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertTriangle, Check, ArrowLeft, Mic, MicOff } from 'lucide-react';
import type { ClinicalInsight, Category } from '../../types';
import { useInsightStore } from '../../stores/insightStore';

import { structureInsight } from '../../services/llmService';
import { VALID_CATEGORIES } from '../../utils/insightPrompts';

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

interface InsightFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

type FormPhase = 'input' | 'processing' | 'preview' | 'saved';

export function InsightForm({ onComplete, onCancel }: InsightFormProps) {
  const [phase, setPhase] = useState<FormPhase>('input');
  const [rawNotes, setRawNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingInsight, setPendingInsight] = useState<ClinicalInsight | null>(null);
  const [editableCategory, setEditableCategory] = useState<Category>('Emergency');
  const [editableTags, setEditableTags] = useState<string>('');

  // Dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { addInsight } = useInsightStore();

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
          setRawNotes(prev => prev + final);
        }
        setInterimText(interim);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setError('Speech recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
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
      setInterimText('');
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleProcess = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter your clinical notes');
      return;
    }

    setError(null);
    setPhase('processing');

    try {
      const result = await structureInsight('', rawNotes);

      const insight: ClinicalInsight = {
        id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rawNotes,
        structuredCase: result.structuredCase,
        lessonLearned: result.lessonLearned,
        keyTakeaways: result.keyTakeaways,
        clinicalPearls: result.clinicalPearls,
        category: result.suggestedCategory,
        tags: result.suggestedTags,
        lastReviewedAt: null,
        reviewCount: 0,
      };

      setPendingInsight(insight);
      setEditableCategory(insight.category);
      setEditableTags(insight.tags.join(', '));
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process notes');
      setPhase('input');
    }
  };

  const handleSave = () => {
    if (!pendingInsight) return;

    const finalInsight: ClinicalInsight = {
      ...pendingInsight,
      category: editableCategory,
      tags: editableTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    addInsight(finalInsight);
    setPhase('saved');

    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Clinical Insight</h2>
          <p className="text-gray-600">
            Document a case from your practice to build your knowledge base
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Describe Your Clinical Experience
              </label>
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Dictate
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={rawNotes + interimText}
                onChange={(e) => {
                  if (!isRecording) {
                    setRawNotes(e.target.value);
                  }
                }}
                placeholder="Describe the case in your own words. Include:
- Patient presentation (age, symptoms, chief complaint)
- What you initially thought
- What actually happened / diagnosis
- What you learned

Example: '45 year old male came in with chest pain. We initially thought it was cardiac but it turned out to be esophageal spasm. The key learning was that the pain responded to nitroglycerin which threw us off...'"
                className={`w-full h-64 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  isRecording ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {isRecording && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-red-600">
                  <span className="inline-block w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording...</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {isRecording
                ? 'Speak clearly - your words will appear above'
                : 'Write or dictate naturally - AI will structure this into a learning case'}
            </p>
          </div>

          <button
            onClick={handleProcess}
            disabled={!rawNotes.trim()}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Structure My Experience
          </button>
        </div>
      )}

      {/* Phase: Processing */}
      {phase === 'processing' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
            <Sparkles className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-xl font-medium text-gray-700">
            Structuring your insight...
          </p>
          <p className="text-gray-500 mt-2">
            Extracting key learning points and clinical pearls
          </p>
        </div>
      )}

      {/* Phase: Preview */}
      {phase === 'preview' && pendingInsight && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800">
              Your insight has been structured. Review and save below.
            </p>
          </div>

          {/* Structured Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">
              {pendingInsight.structuredCase?.patientSummary}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Presentation</p>
                <p className="text-sm text-gray-600">
                  {pendingInsight.structuredCase?.presentation}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Outcome</p>
                <p className="text-sm text-gray-600">
                  {pendingInsight.structuredCase?.actualOutcome}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800 mb-1">
                Lesson Learned
              </p>
              <p className="text-sm text-purple-700">
                {pendingInsight.lessonLearned}
              </p>
            </div>

            {pendingInsight.clinicalPearls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Clinical Pearls
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pendingInsight.clinicalPearls.map((pearl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400">*</span>
                      {pearl}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editableCategory}
                onChange={(e) => setEditableCategory(e.target.value as Category)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {VALID_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editableTags}
                onChange={(e) => setEditableTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="chest pain, cardiac, differential"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setPhase('input')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Notes
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Save Insight
            </button>
          </div>
        </div>
      )}

      {/* Phase: Saved */}
      {phase === 'saved' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <p className="text-xl font-medium text-gray-700">Insight Saved!</p>
          <p className="text-gray-500 mt-2">
            Added to your personal knowledge base
          </p>
        </div>
      )}
    </div>
  );
}
