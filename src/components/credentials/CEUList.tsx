import { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, ExternalLink, Calendar, Award } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import { CEUForm } from './CEUForm';
import type { CEURecord } from '../../types';

interface CEUListProps {
  onAddNew: () => void;
}

export function CEUList({ onAddNew }: CEUListProps) {
  const { ceus, deleteCEU } = useCredentialStore();
  const [editingCEU, setEditingCEU] = useState<CEURecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'credits' | 'category'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [...new Set(ceus.map((c) => c.category))];

  const sortedCEUs = [...ceus]
    .filter((c) => filterCategory === 'all' || c.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      }
      if (sortBy === 'credits') {
        return b.creditsEarned - a.creditsEarned;
      }
      return a.category.localeCompare(b.category);
    });

  const handleDelete = (id: string) => {
    deleteCEU(id);
    setDeleteConfirm(null);
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 90 && daysUntil > 0;
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'credits' | 'category')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="credits">Sort by Credits</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add CEU/CME
        </button>
      </div>

      {/* CEU List */}
      {sortedCEUs.length > 0 ? (
        <div className="space-y-3">
          {sortedCEUs.map((ceu) => (
            <div
              key={ceu.id}
              className={`bg-white rounded-xl border p-4 ${
                isExpired(ceu.expirationDate)
                  ? 'border-red-200 bg-red-50'
                  : isExpiringSoon(ceu.expirationDate)
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      isExpired(ceu.expirationDate)
                        ? 'bg-red-100'
                        : isExpiringSoon(ceu.expirationDate)
                        ? 'bg-amber-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 ${
                        isExpired(ceu.expirationDate)
                          ? 'text-red-600'
                          : isExpiringSoon(ceu.expirationDate)
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{ceu.title}</h3>
                    <p className="text-sm text-gray-600">{ceu.provider}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <Award className="w-3 h-3" />
                        {ceu.creditsEarned} {ceu.creditType}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {ceu.category}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(ceu.completionDate).toLocaleDateString()}
                      </span>

                      {ceu.expirationDate && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            isExpired(ceu.expirationDate)
                              ? 'text-red-600'
                              : isExpiringSoon(ceu.expirationDate)
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {isExpired(ceu.expirationDate) ? 'Expired' : 'Expires'}:{' '}
                          {new Date(ceu.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {ceu.notes && <p className="text-sm text-gray-500 mt-2">{ceu.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ceu.verificationUrl && (
                    <a
                      href={ceu.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Verify"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => setEditingCEU(ceu)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deleteConfirm === ceu.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ceu.id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(ceu.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No CEU/CME records yet</p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first CEU/CME
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingCEU && (
        <CEUForm onClose={() => setEditingCEU(null)} editingCEU={editingCEU} />
      )}
    </div>
  );
}
