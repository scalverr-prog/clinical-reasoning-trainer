import { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Grid,
  List,
  AlertTriangle,
  FileText,
  GraduationCap,
  Award,
  Shield,
  FileCheck,
  Briefcase,
  File,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { useDocumentStore } from '../../stores/documentStore';
import { DocumentUpload } from './DocumentUpload';
import { DocumentCard } from './DocumentCard';
import { DocumentViewer } from './DocumentViewer';
import { deleteDocument as deleteFromStorage } from '../../services/documentService';
import type { StoredDocument, DocumentCategory } from '../../types';

interface CategoryFolder {
  value: DocumentCategory | 'all';
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORY_FOLDERS: CategoryFolder[] = [
  { value: 'all', label: 'All Documents', icon: FolderOpen, color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
  { value: 'license', label: 'Licenses', icon: Shield, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { value: 'certificate', label: 'Certificates', icon: Award, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { value: 'diploma', label: 'Diplomas', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { value: 'ceu_certificate', label: 'CEU/CME', icon: FileCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { value: 'verification_letter', label: 'Letters', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { value: 'resume', label: 'Resume/CV', icon: Briefcase, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  { value: 'other', label: 'Other', icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

export function DocumentsView() {
  const { documents, deleteDocument, getExpiringDocuments } = useDocumentStore();
  const [showUpload, setShowUpload] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<StoredDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const expiringDocs = getExpiringDocuments(90);
  const expiredDocs = documents.filter(d => d.expirationDate && new Date(d.expirationDate) < new Date());

  const filteredDocuments = documents
    .filter((doc) => {
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const handleDelete = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    try {
      await deleteFromStorage(doc.fileUrl);
      deleteDocument(id);
    } catch (err) {
      console.error('Failed to delete document:', err);
      deleteDocument(id);
    }
    setDeleteConfirm(null);
  };

  const getCategoryCount = (category: DocumentCategory | 'all') => {
    if (category === 'all') return documents.length;
    return documents.filter(d => d.category === category).length;
  };

  const activeFolder = CATEGORY_FOLDERS.find(f => f.value === categoryFilter) || CATEGORY_FOLDERS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-emerald-600" />
            Clinical Portfolio
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your professional credentials, licenses & documents
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 mb-6 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <FolderOpen className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-80">Total</span>
            </div>
            <p className="text-3xl font-bold">{documents.length}</p>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <CheckCircle className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-80">Active</span>
            </div>
            <p className="text-3xl font-bold">{documents.length - expiredDocs.length}</p>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Clock className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-80">Expiring</span>
            </div>
            <p className="text-3xl font-bold text-amber-200">{expiringDocs.length}</p>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-80">Expired</span>
            </div>
            <p className="text-3xl font-bold text-red-200">{expiredDocs.length}</p>
          </div>
        </div>
      </div>

      {/* Expiring Documents Alert */}
      {expiringDocs.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Renewal Reminder</p>
              <p className="text-sm text-amber-700 mt-1">
                {expiringDocs.length} document{expiringDocs.length !== 1 ? 's' : ''} will expire within 90 days.
                Stay compliant by renewing them soon.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expiringDocs.slice(0, 3).map(doc => (
                  <span
                    key={doc.id}
                    className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-lg font-medium"
                  >
                    {doc.name}
                  </span>
                ))}
                {expiringDocs.length > 3 && (
                  <span className="px-2 py-1 text-amber-700 text-xs">
                    +{expiringDocs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Folders */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORY_FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const count = getCategoryCount(folder.value);
            const isActive = categoryFilter === folder.value;

            return (
              <button
                key={folder.value}
                onClick={() => setCategoryFilter(folder.value)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center group ${
                  isActive
                    ? `${folder.bgColor} ${folder.borderColor} ring-2 ring-offset-2 ring-${folder.color.replace('text-', '')}`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 mx-auto rounded-xl ${folder.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${folder.color}`} />
                </div>
                <p className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'} truncate`}>
                  {folder.label}
                </p>
                <p className={`text-lg font-bold ${isActive ? folder.color : 'text-gray-900'}`}>
                  {count}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Folder Header & Search */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${activeFolder.bgColor} flex items-center justify-center`}>
                <activeFolder.icon className={`w-5 h-5 ${activeFolder.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{activeFolder.label}</h3>
                <p className="text-sm text-gray-500">{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Grid/List */}
        <div className="p-4">
          {filteredDocuments.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="relative">
                  <DocumentCard
                    document={doc}
                    viewMode={viewMode}
                    onView={setViewingDoc}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                  {deleteConfirm === doc.id && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-gray-900 font-medium mb-1">Delete Document?</p>
                        <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className={`w-20 h-20 mx-auto mb-4 ${activeFolder.bgColor} rounded-2xl flex items-center justify-center`}>
                <activeFolder.icon className={`w-10 h-10 ${activeFolder.color} opacity-50`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? 'No documents found'
                  : categoryFilter !== 'all'
                  ? `No ${activeFolder.label.toLowerCase()} yet`
                  : 'Your portfolio is empty'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? 'Try a different search term or browse by category'
                  : 'Upload your licenses, certificates, and credentials to keep them organized and secure.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
                >
                  <Plus className="w-5 h-5" />
                  Upload your first document
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      {documents.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <ChevronRight className="w-5 h-5" />
            Getting Started with Your Portfolio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <p className="text-sm text-blue-800">Upload your professional licenses, certifications, and diplomas</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <p className="text-sm text-blue-800">Set expiration dates to receive renewal reminders</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <p className="text-sm text-blue-800">Access your documents anytime, anywhere - all in one place</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUpload && <DocumentUpload onClose={() => setShowUpload(false)} />}
      {viewingDoc && <DocumentViewer document={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </div>
  );
}
