import { useState } from 'react';
import { Filter, Play, X } from 'lucide-react';
import type { QuizFilters as QuizFiltersType, Category, QuizCardType } from '../../types';
import { VALID_CATEGORIES } from '../../utils/insightPrompts';

interface QuizFiltersProps {
  onStartSession: (filters: QuizFiltersType, cardCount: number) => void;
  onCancel: () => void;
  totalCards: number;
  dueCards: number;
}

const CARD_TYPES: { value: QuizCardType; label: string; description: string }[] = [
  { value: 'workup', label: 'Workup', description: 'What tests/labs to order' },
  { value: 'diagnostic_criteria', label: 'Diagnostic Criteria', description: 'What defines a condition' },
  { value: 'dangerous_mimics', label: 'Dangerous Mimics', description: 'What could this be instead' },
  { value: 'management_pitfall', label: 'Management Pitfall', description: 'Common mistakes to avoid' },
];

export function QuizFilters({ onStartSession, onCancel, totalCards, dueCards }: QuizFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<QuizCardType[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>(undefined);
  const [onlyDue, setOnlyDue] = useState(false);
  const [cardCount, setCardCount] = useState(10);

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type: QuizCardType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleStart = () => {
    onStartSession(
      {
        categories: selectedCategories,
        cardTypes: selectedTypes,
        difficulty,
        onlyDue,
      },
      cardCount
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Quiz Settings</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-600">Total Cards</p>
          <p className="text-2xl font-bold text-purple-900">{totalCards}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-600">Due for Review</p>
          <p className="text-2xl font-bold text-amber-900">{dueCards}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Categories {selectedCategories.length > 0 && `(${selectedCategories.length} selected)`}
        </h3>
        <div className="flex flex-wrap gap-2">
          {VALID_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Leave empty to include all categories
        </p>
      </div>

      {/* Card Types */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Card Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {CARD_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleType(type.value)}
              className={`p-3 rounded-xl text-left transition-colors border-2 ${
                selectedTypes.includes(type.value)
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{type.label}</p>
              <p className="text-xs text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Difficulty</h3>
        <div className="flex gap-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(difficulty === level ? undefined : level)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                difficulty === level
                  ? level === 'easy'
                    ? 'bg-green-600 text-white'
                    : level === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDue}
            onChange={(e) => setOnlyDue(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Only show cards due for review</span>
        </label>
      </div>

      {/* Card Count */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Number of Cards: {cardCount}
        </h3>
        <input
          type="range"
          min={5}
          max={30}
          step={5}
          value={cardCount}
          onChange={(e) => setCardCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5</span>
          <span>30</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
      >
        <Play className="w-5 h-5" />
        Start Quiz Session
      </button>
    </div>
  );
}
