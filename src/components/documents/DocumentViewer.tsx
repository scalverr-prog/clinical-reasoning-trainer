import { X, Download, ExternalLink, Calendar, Tag, FileText, Image, File } from 'lucide-react';
import { formatFileSize, getFileIconType } from '../../services/documentService';
import type { StoredDocument } from '../../types';

interface DocumentViewerProps {
  document: StoredDocument;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  license: 'License',
  certificate: 'Certificate',
  diploma: 'Diploma',
  ceu_certificate: 'CEU Certificate',
  verification_letter: 'Verification Letter',
  resume: 'Resume/CV',
  other: 'Other',
};

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const iconType = getFileIconType(document.mimeType);
  const isImage = iconType === 'image';
  const isPdf = iconType === 'pdf';
  const Icon = isPdf ? FileText : isImage ? Image : File;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{document.name}</h2>
              <p className="text-sm text-gray-500">
                {CATEGORY_LABELS[document.category]} • {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
            <a
              href={document.fileUrl}
              download={document.name}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              title={document.name}
              className="w-full h-full min-h-[500px]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <File className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">Preview not available for this file type</p>
              <a
                href={document.fileUrl}
                download={document.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download to view
              </a>
            </div>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
            </div>

            {document.expirationDate && (
              <div
                className={`flex items-center gap-1 ${
                  new Date(document.expirationDate) < new Date()
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {new Date(document.expirationDate) < new Date() ? 'Expired' : 'Expires'}:{' '}
                {new Date(document.expirationDate).toLocaleDateString()}
              </div>
            )}

            {document.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
