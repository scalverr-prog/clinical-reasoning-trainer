import { useState, useEffect } from 'react';
import { Eye, Lightbulb, CheckCircle, XCircle, Link } from 'lucide-react';
import type { QuizCard as QuizCardType } from '../../types';

interface QuizCardProps {
  card: QuizCardType;
  onAnswer: (correct: boolean, timeSpentMs: number) => void;
  showingAnswer: boolean;
  onReveal: () => void;
}

const CARD_TYPE_LABELS = {
  workup: 'Workup',
  diagnostic_criteria: 'Diagnostic Criteria',
  dangerous_mimics: 'Dangerous Mimics',
  management_pitfall: 'Management Pitfall',
};

const CARD_TYPE_COLORS = {
  workup: 'bg-blue-100 text-blue-700',
  diagnostic_criteria: 'bg-green-100 text-green-700',
  dangerous_mimics: 'bg-red-100 text-red-700',
  management_pitfall: 'bg-amber-100 text-amber-700',
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export function QuizCard({ card, onAnswer, showingAnswer, onReveal }: QuizCardProps) {
  const [startTime] = useState(Date.now());
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  useEffect(() => {
    setShowHints(false);
    setHintsRevealed(0);
  }, [card.id]);

  const handleRevealHint = () => {
    if (hintsRevealed < (card.hints?.length || 0)) {
      setHintsRevealed((prev) => prev + 1);
      setShowHints(true);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const timeSpent = Date.now() - startTime;
    onAnswer(correct, timeSpent);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${CARD_TYPE_COLORS[card.type]}`}>
              {CARD_TYPE_LABELS[card.type]}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[card.difficulty]}`}>
              {card.difficulty}
            </span>
          </div>
          <span className="text-slate-400 text-sm">{card.category}</span>
        </div>
      </div>

      {/* Question Side */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {card.question}
        </h3>

        {/* Hints Section */}
        {card.hints && card.hints.length > 0 && !showingAnswer && (
          <div className="mb-4">
            {showHints && hintsRevealed > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-amber-800 mb-2">Hints:</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {card.hints.slice(0, hintsRevealed).map((hint, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hintsRevealed < card.hints.length && (
              <button
                onClick={handleRevealHint}
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
              >
                <Lightbulb className="w-4 h-4" />
                Show hint ({hintsRevealed}/{card.hints.length})
              </button>
            )}
          </div>
        )}

        {/* Reveal Button */}
        {!showingAnswer && (
          <button
            onClick={onReveal}
            className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Reveal Answer
          </button>
        )}

        {/* Answer Side */}
        {showingAnswer && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-800 mb-2">Answer:</p>
              <div className="text-green-900 whitespace-pre-wrap">
                {card.answer}
              </div>
            </div>

            {/* Related Concepts */}
            {card.relatedConcepts && card.relatedConcepts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Link className="w-4 h-4 text-gray-400" />
                {card.relatedConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            )}

            {/* Self-Assessment Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                I Got It Wrong
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                I Got It Right
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer - Stats */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Streak: {card.consecutiveCorrect}
          </span>
          <span>
            {card.correctAttempts}/{card.totalAttempts} correct
          </span>
        </div>
      </div>
    </div>
  );
}
