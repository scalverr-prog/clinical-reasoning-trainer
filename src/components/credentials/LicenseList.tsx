import { useState } from 'react';
import { Award, Plus, Edit2, Trash2, ExternalLink, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import { LicenseForm } from './LicenseForm';
import type { License } from '../../types';

interface LicenseListProps {
  onAddNew: () => void;
}

export function LicenseList({ onAddNew }: LicenseListProps) {
  const { licenses, deleteLicense } = useCredentialStore();
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'expiration' | 'type' | 'state'>('expiration');
  const [filterState, setFilterState] = useState<string>('all');

  const states = [...new Set(licenses.map((l) => l.state))];

  const sortedLicenses = [...licenses]
    .filter((l) => filterState === 'all' || l.state === filterState)
    .sort((a, b) => {
      if (sortBy === 'expiration') {
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      }
      if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      return a.state.localeCompare(b.state);
    });

  const handleDelete = (id: string) => {
    deleteLicense(id);
    setDeleteConfirm(null);
  };

  const getDaysUntilExpiration = (date: string) => {
    const expDate = new Date(date);
    const now = new Date();
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = (license: License) => {
    const daysUntil = getDaysUntilExpiration(license.expirationDate);

    if (daysUntil < 0) {
      return {
        label: 'Expired',
        color: 'red',
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }
    if (daysUntil <= 30) {
      return {
        label: `Expires in ${daysUntil} days`,
        color: 'red',
        icon: Clock,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }
    if (daysUntil <= 90) {
      return {
        label: `Expires in ${daysUntil} days`,
        color: 'amber',
        icon: Clock,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    }
    return {
      label: 'Active',
      color: 'green',
      icon: CheckCircle,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
    };
  };

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'expiration' | 'type' | 'state')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="expiration">Sort by Expiration</option>
            <option value="type">Sort by Type</option>
            <option value="state">Sort by State</option>
          </select>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add License
        </button>
      </div>

      {/* License List */}
      {sortedLicenses.length > 0 ? (
        <div className="space-y-3">
          {sortedLicenses.map((license) => {
            const statusInfo = getStatusInfo(license);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={license.id}
                className={`rounded-xl border p-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        statusInfo.color === 'red'
                          ? 'bg-red-100'
                          : statusInfo.color === 'amber'
                          ? 'bg-amber-100'
                          : 'bg-indigo-100'
                      }`}
                    >
                      <Award
                        className={`w-5 h-5 ${
                          statusInfo.color === 'red'
                            ? 'text-red-600'
                            : statusInfo.color === 'amber'
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {license.type} License
                        </h3>
                        <span className="text-sm text-gray-500">— {license.state}</span>
                      </div>
                      <p className="text-sm text-gray-600">#{license.licenseNumber}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            statusInfo.color === 'red'
                              ? 'bg-red-100 text-red-700'
                              : statusInfo.color === 'amber'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Expires: {new Date(license.expirationDate).toLocaleDateString()}
                        </span>

                        {license.issuedDate && (
                          <span className="text-xs text-gray-500">
                            Issued: {new Date(license.issuedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {license.notes && (
                        <p className="text-sm text-gray-500 mt-2">{license.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {license.verificationUrl && (
                      <a
                        href={license.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Verify"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => setEditingLicense(license)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirm === license.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(license.id)}
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
                        onClick={() => setDeleteConfirm(license.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No licenses added yet</p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first license
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingLicense && (
        <LicenseForm onClose={() => setEditingLicense(null)} editingLicense={editingLicense} />
      )}
    </div>
  );
}
