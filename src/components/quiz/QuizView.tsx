import { useState, useMemo } from 'react';
import { HelpCircle, Plus, Trophy, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import type { QuizFilters as QuizFiltersType, Category } from '../../types';
import { useQuizStore } from '../../stores/quizStore';

import { generateQuizCards } from '../../services/llmService';
import { CACHED_ANALYSES } from '../../data/analyses';
import { QuizCard } from './QuizCard';
import { QuizFilters } from './QuizFilters';
import { QuizProgress } from './QuizProgress';
import { VALID_CATEGORIES } from '../../utils/insightPrompts';

type QuizViewMode = 'home' | 'filters' | 'session' | 'results' | 'generate';

export function QuizView() {
  const [mode, setMode] = useState<QuizViewMode>('home');
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [generateCategory, setGenerateCategory] = useState<Category>('Cardiac');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const {
    cards,
    currentSession,
    startSession,
    answerCard,
    nextCard,
    endSession,
    addCards,
    getCardStats,
    getDueCards,
  } = useQuizStore();

  const stats = useMemo(() => getCardStats(), [cards]);
  const dueCards = useMemo(() => getDueCards(), [cards]);

  const currentCard = useMemo(() => {
    if (!currentSession) return null;
    const cardId = currentSession.cardIds[currentSession.currentIndex];
    return cards.find((c) => c.id === cardId) || null;
  }, [currentSession, cards]);

  const handleStartSession = (filters: QuizFiltersType, cardCount: number) => {
    startSession(filters, cardCount);
    setMode('session');
    setShowingAnswer(false);
  };

  const handleAnswer = (correct: boolean, timeSpentMs: number) => {
    if (!currentCard || !currentSession) return;

    answerCard(currentCard.id, correct, timeSpentMs);

    // Check if session is complete
    if (currentSession.currentIndex >= currentSession.cardIds.length - 1) {
      endSession();
      setMode('results');
    } else {
      nextCard();
      setShowingAnswer(false);
    }
  };

  const handleGenerateCards = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      // Get a random analysis from the category
      const analysisEntries = Object.entries(CACHED_ANALYSES);
      const randomEntry = analysisEntries[Math.floor(Math.random() * analysisEntries.length)];

      if (!randomEntry) {
        throw new Error('No analyses available');
      }

      const [mrn, analysis] = randomEntry;
      const newCards = await generateQuizCards('', analysis, mrn, generateCategory);
      addCards(newCards);
      setMode('home');
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const sessionResults = useMemo(() => {
    if (!currentSession?.completedAt) return null;
    const correct = currentSession.results.filter((r) => r.correct).length;
    const total = currentSession.results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  }, [currentSession]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Home View */}
      {mode === 'home' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Cards</h1>
              <p className="text-gray-600">Test your clinical knowledge</p>
            </div>
            <button
              onClick={() => setMode('generate')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Generate Cards
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Mastered</p>
              <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Learning</p>
              <p className="text-2xl font-bold text-blue-600">{stats.learning}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Due Today</p>
              <p className="text-2xl font-bold text-amber-600">{stats.due}</p>
            </div>
          </div>

          {/* Empty State or Start Quiz */}
          {cards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Quiz Cards Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Generate quiz cards from the clinical case library to start testing
                your knowledge.
              </p>
              <button
                onClick={() => setMode('generate')}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Generate Your First Cards
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setMode('filters')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-6 text-left hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Start Quiz Session</h3>
                    <p className="text-purple-200">
                      {dueCards.length > 0
                        ? `${dueCards.length} cards due for review`
                        : 'Practice your knowledge'}
                    </p>
                  </div>
                  <HelpCircle className="w-8 h-8 text-purple-200" />
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {/* Filter Selection */}
      {mode === 'filters' && (
        <QuizFilters
          onStartSession={handleStartSession}
          onCancel={() => setMode('home')}
          totalCards={stats.total}
          dueCards={stats.due}
        />
      )}

      {/* Active Session */}
      {mode === 'session' && currentSession && currentCard && (
        <div>
          <button
            onClick={() => {
              endSession();
              setMode('home');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit Quiz
          </button>

          <QuizProgress session={currentSession} />

          <QuizCard
            card={currentCard}
            onAnswer={handleAnswer}
            showingAnswer={showingAnswer}
            onReveal={() => setShowingAnswer(true)}
          />
        </div>
      )}

      {/* Results */}
      {mode === 'results' && sessionResults && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h2>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {sessionResults.percentage}%
          </p>
          <p className="text-gray-600 mb-8">
            {sessionResults.correct} out of {sessionResults.total} correct
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMode('filters')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              New Session
            </button>
            <button
              onClick={() => setMode('home')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Quiz Home
            </button>
          </div>
        </div>
      )}

      {/* Generate Cards */}
      {mode === 'generate' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl mx-auto">
          <button
            onClick={() => setMode('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Generate Quiz Cards</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Generate flashcards from the clinical case library. Cards will be
            created based on expert analyses for the selected category.
          </p>

          {generateError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {generateError}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={generateCategory}
              onChange={(e) => setGenerateCategory(e.target.value as Category)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateCards}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate 3-5 Cards
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
