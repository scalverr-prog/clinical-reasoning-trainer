import { useState } from 'react';
import { X, FileText, Save } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import { useAuth } from '../../contexts/AuthContext';
import type { CreditType, CEURecord } from '../../types';

const CREDIT_TYPES: CreditType[] = ['CEU', 'CME', 'Contact Hour', 'CE', 'CNE'];

const CEU_CATEGORIES = [
  'Pharmacology',
  'Ethics',
  'Pain Management',
  'Infection Control',
  'Patient Safety',
  'Critical Care',
  'Pediatrics',
  'Emergency Medicine',
  'Mental Health',
  'Geriatrics',
  'Wound Care',
  'Oncology',
  'Cardiology',
  'Neurology',
  'General',
  'Other',
];

interface CEUFormProps {
  onClose: () => void;
  editingCEU?: CEURecord;
}

export function CEUForm({ onClose, editingCEU }: CEUFormProps) {
  const { user } = useAuth();
  const { addCEU, updateCEU } = useCredentialStore();

  const [title, setTitle] = useState(editingCEU?.title || '');
  const [provider, setProvider] = useState(editingCEU?.provider || '');
  const [creditsEarned, setCreditsEarned] = useState(editingCEU?.creditsEarned.toString() || '');
  const [creditType, setCreditType] = useState<CreditType>(editingCEU?.creditType || 'CEU');
  const [category, setCategory] = useState(editingCEU?.category || 'General');
  const [completionDate, setCompletionDate] = useState(
    editingCEU?.completionDate || new Date().toISOString().split('T')[0]
  );
  const [expirationDate, setExpirationDate] = useState(editingCEU?.expirationDate || '');
  const [verificationUrl, setVerificationUrl] = useState(editingCEU?.verificationUrl || '');
  const [notes, setNotes] = useState(editingCEU?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !provider || !creditsEarned || !completionDate) return;

    setIsSaving(true);

    try {
      const ceuData = {
        userId: user?.uid || '',
        title,
        provider,
        creditsEarned: parseFloat(creditsEarned),
        creditType,
        category,
        completionDate,
        expirationDate: expirationDate || null,
        certificateDocId: null,
        verificationUrl: verificationUrl || null,
        notes: notes || null,
      };

      if (editingCEU) {
        updateCEU(editingCEU.id, ceuData);
      } else {
        addCEU(ceuData);
      }

      onClose();
    } catch (err) {
      console.error('Failed to save CEU:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingCEU ? 'Edit CEU/CME' : 'Add CEU/CME'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course/Activity Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Cardiac Life Support"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider/Organization *
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., American Heart Association"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credits Earned *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={creditsEarned}
                onChange={(e) => setCreditsEarned(e.target.value)}
                placeholder="e.g., 4.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Type *
              </label>
              <select
                value={creditType}
                onChange={(e) => setCreditType(e.target.value as CreditType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CREDIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CEU_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date *
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification URL
            </label>
            <input
              type="url"
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title || !provider || !creditsEarned}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : editingCEU ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
