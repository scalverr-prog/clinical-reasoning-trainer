import { useState } from 'react';
import { Send, AlertCircle, Lightbulb, ClipboardList } from 'lucide-react';
import type { UserResponse } from '../types';

interface ResponseFormProps {
  onSubmit: (response: UserResponse) => void;
  isSubmitting: boolean;
}

export function ResponseForm({ onSubmit, isSubmitting }: ResponseFormProps) {
  const [concerns, setConcerns] = useState('');
  const [whatsMissed, setWhatsMissed] = useState('');
  const [whatWouldYouDo, setWhatWouldYouDo] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: string[] = [];
    if (!concerns.trim() && !whatsMissed.trim() && !whatWouldYouDo.trim()) {
      newErrors.push('Please provide at least one response');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSubmit({
      informationRequested: [],
      differentialDiagnosis: whatsMissed,
      workupPlan: whatWouldYouDo,
      treatmentPlan: whatWouldYouDo,
      safetyConsiderations: concerns,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-1">What Do You Think?</h2>
        <p className="text-purple-200">
          Review the case above. Something might be wrong or missing...
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* What concerns you? */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            What concerns you about this case?
          </label>
          <textarea
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="Any red flags? Worrying symptoms? Things that don't add up?"
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-800"
            disabled={isSubmitting}
          />
        </div>

        {/* What's being missed? */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            What's being missed?
          </label>
          <textarea
            value={whatsMissed}
            onChange={(e) => setWhatsMissed(e.target.value)}
            placeholder="Is the diagnosis correct? What else could this be? What critical findings are being overlooked?"
            className="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-800"
            disabled={isSubmitting}
          />
        </div>

        {/* What would you do? */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            What would you do differently?
          </label>
          <textarea
            value={whatWouldYouDo}
            onChange={(e) => setWhatWouldYouDo(e.target.value)}
            placeholder="What tests would you order? What treatment would you start? What needs to happen right now?"
            className="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-800"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit My Analysis
            </>
          )}
        </button>
      </div>
    </form>
  );
}
