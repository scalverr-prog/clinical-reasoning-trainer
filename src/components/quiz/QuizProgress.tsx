import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { QuizSession } from '../../types';

interface QuizProgressProps {
  session: QuizSession;
}

export function QuizProgress({ session }: QuizProgressProps) {
  const totalCards = session.cardIds.length;
  const currentCard = session.currentIndex + 1;
  const correctCount = session.results.filter((r) => r.correct).length;
  const incorrectCount = session.results.filter((r) => !r.correct).length;
  const progress = (session.results.length / totalCards) * 100;

  const avgTimeMs = session.results.length > 0
    ? session.results.reduce((sum, r) => sum + r.timeSpentMs, 0) / session.results.length
    : 0;
  const avgTimeSec = Math.round(avgTimeMs / 1000);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Card {currentCard} of {totalCards}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Correct</p>
            <p className="font-semibold text-green-600">{correctCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Incorrect</p>
            <p className="font-semibold text-red-600">{incorrectCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Time</p>
            <p className="font-semibold text-blue-600">{avgTimeSec}s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
