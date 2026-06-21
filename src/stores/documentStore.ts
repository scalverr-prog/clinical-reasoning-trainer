import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoredDocument, DocumentCategory } from '../types';

interface DocumentStore {
  documents: StoredDocument[];
  isLoading: boolean;
  error: string | null;

  // Document actions
  addDocument: (doc: Omit<StoredDocument, 'id' | 'uploadedAt' | 'updatedAt'>) => string;
  updateDocument: (id: string, updates: Partial<StoredDocument>) => void;
  deleteDocument: (id: string) => void;

  // Queries
  getDocumentsByCategory: (category: DocumentCategory) => StoredDocument[];
  getDocumentsByCredential: (credentialId: string, credentialType: 'license' | 'ceu') => StoredDocument[];
  getExpiringDocuments: (daysAhead: number) => StoredDocument[];
  searchDocuments: (query: string) => StoredDocument[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      error: null,

      addDocument: (docData) => {
        const now = new Date().toISOString();
        const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newDoc: StoredDocument = {
          ...docData,
          id,
          uploadedAt: now,
          updatedAt: now,
        };
        set((state) => ({ documents: [...state.documents, newDoc] }));
        return id;
      },

      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
              : doc
          ),
        }));
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },

      getDocumentsByCategory: (category) => {
        return get().documents.filter((doc) => doc.category === category);
      },

      getDocumentsByCredential: (credentialId, credentialType) => {
        return get().documents.filter(
          (doc) =>
            doc.linkedCredentialId === credentialId &&
            doc.linkedCredentialType === credentialType
        );
      },

      getExpiringDocuments: (daysAhead) => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        return get().documents.filter((doc) => {
          if (!doc.expirationDate) return false;
          const expDate = new Date(doc.expirationDate);
          return expDate <= futureDate && expDate >= now;
        });
      },

      searchDocuments: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().documents.filter(
          (doc) =>
            doc.name.toLowerCase().includes(lowerQuery) ||
            doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
            doc.category.toLowerCase().includes(lowerQuery)
        );
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearAll: () => set({ documents: [], error: null }),
    }),
    {
      name: 'clinical-documents',
      version: 1,
    }
  )
);
