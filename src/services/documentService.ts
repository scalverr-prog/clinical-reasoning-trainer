import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../config/firebase';
import type { DocumentCategory } from '../types';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadDocument(
  userId: string,
  file: File,
  category: DocumentCategory,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  if (!storage || !isFirebaseConfigured) {
    throw new Error('Firebase Storage is not configured. Please set up Firebase to upload documents.');
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `users/${userId}/documents/${category}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      category,
      uploadedAt: new Date().toISOString(),
    },
  };

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress,
          state: snapshot.state as UploadProgress['state'],
        });
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            fileUrl: downloadURL,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteDocument(fileUrl: string): Promise<void> {
  if (!storage || !isFirebaseConfigured) {
    console.warn('Firebase Storage is not configured. Cannot delete document.');
    return;
  }

  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return allowedTypes.includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get icon type based on file mime type
 */
export function getFileIconType(mimeType: string): 'pdf' | 'image' | 'doc' | 'other' {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  return 'other';
}

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isAllowedFileType(file)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, images, or Word documents.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit.`,
    };
  }

  return { valid: true };
}
