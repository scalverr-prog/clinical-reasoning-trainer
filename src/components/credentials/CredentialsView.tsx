import { useState } from 'react';
import {
  Award,
  Plus,
  FileText,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { useCredentialStore } from '../../stores/credentialStore';
import { CEUForm } from './CEUForm';
import { LicenseForm } from './LicenseForm';
import { CertificationForm } from './CertificationForm';
import { CEUList } from './CEUList';
import { LicenseList } from './LicenseList';
import { CertificationList } from './CertificationList';
import { RenewalTimeline } from './RenewalTimeline';

type Tab = 'overview' | 'ceus' | 'licenses' | 'certifications';
type ModalType = 'ceu' | 'license' | 'certification' | null;

export function CredentialsView() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showModal, setShowModal] = useState<ModalType>(null);

  const { getSummary, ceus, licenses } = useCredentialStore();
  const summary = getSummary();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'ceus', label: 'CEUs/CMEs', icon: <FileText className="w-4 h-4" /> },
    { id: 'licenses', label: 'Licenses', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="text-sm sm:text-base text-gray-600">Track CEUs, licenses & certifications</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal('certification')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Certification</span>
            <span className="sm:hidden">Cert</span>
          </button>
          <button
            onClick={() => setShowModal('ceu')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            CEU
          </button>
          <button
            onClick={() => setShowModal('license')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            License
          </button>
        </div>
      </div>

      {/* Expiring Items Alert */}
      {(summary.expiringLicenses.length > 0 || summary.expiringCEUs.length > 0 || summary.expiringCertifications.length > 0) && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Items Expiring Soon</p>
              <p className="text-sm text-amber-700">
                {summary.expiringCertifications.length} certification(s), {summary.expiringLicenses.length} license(s), and {summary.expiringCEUs.length} CEU(s)
                expire within the next 90 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Certs</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.activeCertifications}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Licenses</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.activeLicenses}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Credits</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.totalCEUs.toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hidden lg:block">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Records</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{ceus.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hidden sm:block">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Expiring</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600">
            {summary.expiringCertifications.length + summary.expiringLicenses.length + summary.expiringCEUs.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <nav className="flex gap-2 sm:gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 pb-2 sm:pb-3 px-1 border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'certifications' ? 'Certs' : tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Renewal Timeline */}
          <RenewalTimeline />

          {/* Credits by Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Credits by Category</h3>
              {Object.keys(summary.ceusByCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.ceusByCategory).map(([category, credits]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-700">{category}</span>
                      <span className="font-semibold text-gray-900">{credits.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No CEUs recorded yet</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits by Type</h3>
              {Object.keys(summary.ceusByType).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.ceusByType).map(([type, credits]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-semibold text-gray-900">{credits.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No CEUs recorded yet</p>
              )}
            </div>
          </div>

          {/* License Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">License Status</h3>
            {licenses.length > 0 ? (
              <div className="space-y-3">
                {licenses.map((license) => {
                  const isExpired = new Date(license.expirationDate) < new Date();
                  const isExpiringSoon =
                    !isExpired &&
                    new Date(license.expirationDate) <
                      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={license.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isExpired
                          ? 'bg-red-50'
                          : isExpiringSoon
                          ? 'bg-amber-50'
                          : 'bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isExpired ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : isExpiringSoon ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {license.type} - {license.state}
                          </p>
                          <p className="text-sm text-gray-600">#{license.licenseNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            isExpired
                              ? 'text-red-600'
                              : isExpiringSoon
                              ? 'text-amber-600'
                              : 'text-green-600'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Expires'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(license.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No licenses added yet</p>
                <button
                  onClick={() => setShowModal('license')}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first license
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'certifications' && <CertificationList onAddNew={() => setShowModal('certification')} />}
      {activeTab === 'ceus' && <CEUList onAddNew={() => setShowModal('ceu')} />}
      {activeTab === 'licenses' && <LicenseList onAddNew={() => setShowModal('license')} />}

      {/* Modals */}
      {showModal === 'certification' && <CertificationForm onClose={() => setShowModal(null)} />}
      {showModal === 'ceu' && <CEUForm onClose={() => setShowModal(null)} />}
      {showModal === 'license' && <LicenseForm onClose={() => setShowModal(null)} />}
    </div>
  );
}
