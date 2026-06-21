import { FileText, Image, File, Download, Trash2, Eye, Calendar, Tag, Clock, AlertTriangle, Shield, Award, GraduationCap, FileCheck, Briefcase } from 'lucide-react';
import { formatFileSize, getFileIconType } from '../../services/documentService';
import type { StoredDocument } from '../../types';

interface DocumentCardProps {
  document: StoredDocument;
  viewMode?: 'grid' | 'list';
  onView: (doc: StoredDocument) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; iconBg: string }> = {
  license: { label: 'License', icon: Shield, bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100' },
  certificate: { label: 'Certificate', icon: Award, bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  diploma: { label: 'Diploma', icon: GraduationCap, bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  ceu_certificate: { label: 'CEU/CME', icon: FileCheck, bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
  verification_letter: { label: 'Letter', icon: FileText, bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
  resume: { label: 'Resume', icon: Briefcase, bg: 'bg-slate-50', text: 'text-slate-700', iconBg: 'bg-slate-100' },
  other: { label: 'Other', icon: File, bg: 'bg-gray-50', text: 'text-gray-600', iconBg: 'bg-gray-100' },
};

export function DocumentCard({ document, viewMode = 'grid', onView, onDelete }: DocumentCardProps) {
  const iconType = getFileIconType(document.mimeType);
  const FileIcon = iconType === 'pdf' ? FileText : iconType === 'image' ? Image : File;
  const categoryConfig = CATEGORY_CONFIG[document.category] || CATEGORY_CONFIG.other;
  const CategoryIcon = categoryConfig.icon;

  const now = new Date();
  const expDate = document.expirationDate ? new Date(document.expirationDate) : null;
  const daysUntilExpiry = expDate ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  const getExpiryStatus = () => {
    if (isExpired) {
      return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-100' };
    }
    if (isExpiringSoon) {
      return { text: `${daysUntilExpiry}d left`, color: 'text-amber-600', bg: 'bg-amber-100' };
    }
    if (daysUntilExpiry !== null) {
      return { text: `${daysUntilExpiry}d`, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    return null;
  };

  const expiryStatus = getExpiryStatus();

  // List View
  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all group ${
          isExpired
            ? 'border-red-200 bg-red-50/50'
            : isExpiringSoon
            ? 'border-amber-200 bg-amber-50/50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Icon/Thumbnail */}
          <div className={`w-12 h-12 rounded-xl ${categoryConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
            {iconType === 'image' && document.thumbnailUrl ? (
              <img
                src={document.thumbnailUrl}
                alt={document.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <CategoryIcon className={`w-6 h-6 ${categoryConfig.text}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
              {expiryStatus && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${expiryStatus.bg} ${expiryStatus.color} flex items-center gap-1`}>
                  {isExpired && <AlertTriangle className="w-3 h-3" />}
                  {isExpiringSoon && <Clock className="w-3 h-3" />}
                  {expiryStatus.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text}`}>
                {categoryConfig.label}
              </span>
              <span>{formatFileSize(document.fileSize)}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(document.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(document)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-5 h-5" />
            </button>
            <a
              href={document.fileUrl}
              download={document.name}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => onDelete(document.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group ${
        isExpired
          ? 'border-red-200'
          : isExpiringSoon
          ? 'border-amber-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Thumbnail / Preview Area */}
      <div className={`relative h-32 ${categoryConfig.bg} flex items-center justify-center`}>
        {iconType === 'image' && document.thumbnailUrl ? (
          <img
            src={document.thumbnailUrl}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FileIcon className={`w-12 h-12 ${categoryConfig.text} opacity-50 mx-auto`} />
            <p className="text-xs text-gray-500 mt-1">{iconType.toUpperCase()}</p>
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg ${categoryConfig.iconBg} flex items-center gap-1`}>
          <CategoryIcon className={`w-3.5 h-3.5 ${categoryConfig.text}`} />
          <span className={`text-xs font-medium ${categoryConfig.text}`}>{categoryConfig.label}</span>
        </div>

        {/* Expiry Badge */}
        {expiryStatus && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg ${expiryStatus.bg} flex items-center gap-1`}>
            {isExpired ? (
              <AlertTriangle className={`w-3.5 h-3.5 ${expiryStatus.color}`} />
            ) : (
              <Clock className={`w-3.5 h-3.5 ${expiryStatus.color}`} />
            )}
            <span className={`text-xs font-medium ${expiryStatus.color}`}>{expiryStatus.text}</span>
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onView(document)}
            className="p-3 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
            title="View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <a
            href={document.fileUrl}
            download={document.name}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition-colors shadow-lg"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={() => onDelete(document.id)}
            className="p-3 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-2" title={document.name}>
          {document.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(document.uploadedAt).toLocaleDateString()}
          </span>
          <span>{formatFileSize(document.fileSize)}</span>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{document.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Expiration Date */}
        {document.expirationDate && (
          <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 text-xs ${
            isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-gray-500'
          }`}>
            {isExpired ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>
              {isExpired ? 'Expired on' : 'Expires'}: {new Date(document.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
