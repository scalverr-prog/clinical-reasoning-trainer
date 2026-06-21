import { useState } from 'react';
import { Award, Plus, Edit2, Trash2, ExternalLink, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import { CertificationForm } from './CertificationForm';

interface CertificationListProps {
  onAddNew: () => void;
}

export function CertificationList({ onAddNew }: CertificationListProps) {
  const { certifications, deleteCertification } = useCredentialStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sortedCerts = [...certifications].sort((a, b) => {
    // Sort by expiration date (soonest first)
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  const handleDelete = (id: string) => {
    deleteCertification(id);
    setDeleteConfirm(null);
  };

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Certifications</h3>
        <p className="text-gray-500 mb-6">
          Add your professional certifications like BLS, ACLS, PALS, and specialty certifications.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      <div className="grid gap-4">
        {sortedCerts.map((cert) => {
          const now = new Date();
          const expDate = new Date(cert.expirationDate);
          const isExpired = expDate < now;
          const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = !isExpired && daysUntilExpiry <= 90;

          return (
            <div
              key={cert.id}
              className={`bg-white rounded-xl border p-5 ${
                isExpired
                  ? 'border-red-200 bg-red-50'
                  : isExpiringSoon
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <Award className={`w-5 h-5 ${
                        isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                    {cert.credentialId && (
                      <span>ID: {cert.credentialId}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Expired {new Date(cert.expirationDate).toLocaleDateString()}
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Expires in {daysUntilExpiry} days
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Valid until {new Date(cert.expirationDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {cert.verificationUrl && (
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verify Online
                    </a>
                  )}

                  {cert.notes && (
                    <p className="text-sm text-gray-500 mt-2">{cert.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(cert.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === cert.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(cert.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Edit Modal */}
      {editingId && (
        <CertificationForm
          editId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
