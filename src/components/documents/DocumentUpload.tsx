import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle, Award, GraduationCap, FileCheck, Briefcase, FolderOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentStore } from '../../stores/documentStore';
import {
  uploadDocument,
  validateFile,
  formatFileSize,
  getFileIconType,
  type UploadProgress,
} from '../../services/documentService';
import type { DocumentCategory } from '../../types';

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'license', label: 'License', icon: <Award className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600 border-blue-300' },
  { value: 'certificate', label: 'Certificate', icon: <FileCheck className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
  { value: 'diploma', label: 'Diploma', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600 border-purple-300' },
  { value: 'ceu_certificate', label: 'CEU/CME', icon: <FileText className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600 border-amber-300' },
  { value: 'verification_letter', label: 'Verification', icon: <FileCheck className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-600 border-cyan-300' },
  { value: 'resume', label: 'Resume/CV', icon: <Briefcase className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600 border-rose-300' },
  { value: 'other', label: 'Other', icon: <FolderOpen className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600 border-gray-300' },
];

interface DocumentUploadProps {
  onClose: () => void;
  onSuccess?: (documentId: string) => void;
  presetCategory?: DocumentCategory;
  linkedCredentialId?: string;
  linkedCredentialType?: 'license' | 'ceu';
}

export function DocumentUpload({
  onClose,
  onSuccess,
  presetCategory,
  linkedCredentialId,
  linkedCredentialType,
}: DocumentUploadProps) {
  const { user } = useAuth();
  const { addDocument } = useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(presetCategory || 'other');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    setSelectedFile(file);
    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadDocument(
        user.uid,
        selectedFile,
        category,
        setUploadProgress
      );

      const documentId = addDocument({
        userId: user.uid,
        name: name || selectedFile.name,
        category,
        fileUrl: result.fileUrl,
        thumbnailUrl: null,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        linkedCredentialId: linkedCredentialId || null,
        linkedCredentialType: linkedCredentialType || null,
        expirationDate: expirationDate || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      onSuccess?.(documentId);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const FileIcon = selectedFile
    ? {
        pdf: FileText,
        image: Image,
        doc: FileText,
        other: File,
      }[getFileIconType(selectedFile.type)]
    : File;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Folder Selection - Always Visible */}
          {!presetCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Folder
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${opt.color} border-current ring-2 ring-offset-1 ring-current/30`
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={isSelected ? '' : 'text-gray-400'}>{opt.icon}</span>
                      <span className={`text-xs font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset Category Display */}
          {presetCategory && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">
                Uploading to: <strong>{CATEGORY_OPTIONS.find(c => c.value === presetCategory)?.label}</strong>
              </span>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FileIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setUploadProgress(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700 text-sm">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  PDF, Images, Word docs up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-900 font-medium">
                  {Math.round(uploadProgress.progress)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Document Details */}
          {selectedFile && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter document name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration (optional)
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="nursing, 2024"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
