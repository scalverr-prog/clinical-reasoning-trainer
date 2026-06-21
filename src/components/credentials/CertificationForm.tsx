import { useState } from 'react';
import { X, Award, Calendar, Building2, Link, FileText } from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import type { CertificationType } from '../../types';

interface CertificationFormProps {
  onClose: () => void;
  editId?: string;
}

const CERTIFICATION_TYPES: { value: CertificationType; label: string; org: string }[] = [
  { value: 'BLS', label: 'BLS - Basic Life Support', org: 'American Heart Association' },
  { value: 'ACLS', label: 'ACLS - Advanced Cardiac Life Support', org: 'American Heart Association' },
  { value: 'PALS', label: 'PALS - Pediatric Advanced Life Support', org: 'American Heart Association' },
  { value: 'NRP', label: 'NRP - Neonatal Resuscitation Program', org: 'American Academy of Pediatrics' },
  { value: 'TNCC', label: 'TNCC - Trauma Nursing Core Course', org: 'Emergency Nurses Association' },
  { value: 'ENPC', label: 'ENPC - Emergency Nursing Pediatric Course', org: 'Emergency Nurses Association' },
  { value: 'STABLE', label: 'S.T.A.B.L.E. Program', org: 'S.T.A.B.L.E. Program' },
  { value: 'CCRN', label: 'CCRN - Critical Care Registered Nurse', org: 'AACN Certification Corporation' },
  { value: 'CEN', label: 'CEN - Certified Emergency Nurse', org: 'BCEN' },
  { value: 'CNOR', label: 'CNOR - Certified Perioperative Nurse', org: 'CCI' },
  { value: 'OCN', label: 'OCN - Oncology Certified Nurse', org: 'ONCC' },
  { value: 'RNC-OB', label: 'RNC-OB - Inpatient Obstetric Nursing', org: 'NCC' },
  { value: 'RNC-NIC', label: 'RNC-NIC - Neonatal Intensive Care', org: 'NCC' },
  { value: 'SCRN', label: 'SCRN - Stroke Certified Registered Nurse', org: 'AANN' },
  { value: 'TCRN', label: 'TCRN - Trauma Certified Registered Nurse', org: 'BCEN' },
  { value: 'CPEN', label: 'CPEN - Certified Pediatric Emergency Nurse', org: 'BCEN' },
  { value: 'CFRN', label: 'CFRN - Certified Flight Registered Nurse', org: 'BCEN' },
  { value: 'CMC', label: 'CMC - Cardiac Medicine Certification', org: 'AACN Certification Corporation' },
  { value: 'CSC', label: 'CSC - Cardiac Surgery Certification', org: 'AACN Certification Corporation' },
  { value: 'Other', label: 'Other Certification', org: '' },
];

export function CertificationForm({ onClose, editId }: CertificationFormProps) {
  const { certifications, addCertification, updateCertification } = useCredentialStore();

  const existingCert = editId ? certifications.find((c) => c.id === editId) : null;

  const [certType, setCertType] = useState<CertificationType>(existingCert?.type || 'BLS');
  const [customType, setCustomType] = useState(existingCert?.customType || '');
  const [credentialId, setCredentialId] = useState(existingCert?.credentialId || '');
  const [issuingOrg, setIssuingOrg] = useState(existingCert?.issuingOrganization || '');
  const [issuedDate, setIssuedDate] = useState(existingCert?.issuedDate || '');
  const [expirationDate, setExpirationDate] = useState(existingCert?.expirationDate || '');
  const [verificationUrl, setVerificationUrl] = useState(existingCert?.verificationUrl || '');
  const [notes, setNotes] = useState(existingCert?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill organization when certification type changes
  const handleTypeChange = (type: CertificationType) => {
    setCertType(type);
    const certInfo = CERTIFICATION_TYPES.find((c) => c.value === type);
    if (certInfo && certInfo.org) {
      setIssuingOrg(certInfo.org);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuedDate || !expirationDate) return;

    setIsSaving(true);

    const certInfo = CERTIFICATION_TYPES.find((c) => c.value === certType);
    const certName = certType === 'Other' ? customType : certInfo?.label || certType;

    const certData = {
      userId: 'local',
      type: certType,
      customType: certType === 'Other' ? customType : null,
      name: certName,
      issuingOrganization: issuingOrg,
      credentialId: credentialId || null,
      issuedDate,
      expirationDate,
      status: (new Date(expirationDate) > new Date() ? 'active' : 'expired') as 'active' | 'expired',
      documentId: null,
      verificationUrl: verificationUrl || null,
      notes: notes || null,
    };

    if (editId) {
      updateCertification(editId, certData);
    } else {
      addCertification(certData);
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {editId ? 'Edit Certification' : 'Add Certification'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Certification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Award className="w-4 h-4 inline mr-1" />
              Certification Type
            </label>
            <select
              value={certType}
              onChange={(e) => handleTypeChange(e.target.value as CertificationType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CERTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Type (if Other) */}
          {certType === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name
              </label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter certification name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Issuing Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Issuing Organization
            </label>
            <input
              type="text"
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              placeholder="e.g., American Heart Association"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Credential ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Credential ID (Optional)
            </label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter credential or card number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Issue Date
              </label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Verification URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Link className="w-4 h-4 inline mr-1" />
              Verification URL (Optional)
            </label>
            <input
              type="url"
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !issuedDate || !expirationDate || (certType === 'Other' && !customType)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editId ? 'Update' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
