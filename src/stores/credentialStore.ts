import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CEURecord, License, Certification, CredentialSummary, CreditType } from '../types';

interface CredentialStore {
  ceus: CEURecord[];
  licenses: License[];
  certifications: Certification[];
  isLoading: boolean;
  error: string | null;

  // CEU actions
  addCEU: (ceu: Omit<CEURecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCEU: (id: string, updates: Partial<CEURecord>) => void;
  deleteCEU: (id: string) => void;

  // License actions
  addLicense: (license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLicense: (id: string, updates: Partial<License>) => void;
  deleteLicense: (id: string) => void;

  // Certification actions
  addCertification: (cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  // Queries
  getExpiringItems: (daysAhead: number) => { licenses: License[]; ceus: CEURecord[]; certifications: Certification[] };
  getCEUsByCategory: () => Record<string, number>;
  getCEUsByType: () => Record<CreditType, number>;
  getTotalCredits: () => number;
  getSummary: () => CredentialSummary;

  // Utility
  setError: (error: string | null) => void;
  clearAll: () => void;
}

const SPACED_REMINDER_DAYS = [90, 60, 30, 14, 7, 1];

export const useCredentialStore = create<CredentialStore>()(
  persist(
    (set, get) => ({
      ceus: [],
      licenses: [],
      certifications: [],
      isLoading: false,
      error: null,

      // CEU Actions
      addCEU: (ceuData) => {
        const now = new Date().toISOString();
        const newCEU: CEURecord = {
          ...ceuData,
          id: `ceu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ ceus: [...state.ceus, newCEU] }));
      },

      updateCEU: (id, updates) => {
        set((state) => ({
          ceus: state.ceus.map((ceu) =>
            ceu.id === id
              ? { ...ceu, ...updates, updatedAt: new Date().toISOString() }
              : ceu
          ),
        }));
      },

      deleteCEU: (id) => {
        set((state) => ({
          ceus: state.ceus.filter((ceu) => ceu.id !== id),
        }));
      },

      // License Actions
      addLicense: (licenseData) => {
        const now = new Date().toISOString();
        const newLicense: License = {
          ...licenseData,
          id: `lic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          renewalReminderDays: licenseData.renewalReminderDays || SPACED_REMINDER_DAYS,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ licenses: [...state.licenses, newLicense] }));
      },

      updateLicense: (id, updates) => {
        set((state) => ({
          licenses: state.licenses.map((lic) =>
            lic.id === id
              ? { ...lic, ...updates, updatedAt: new Date().toISOString() }
              : lic
          ),
        }));
      },

      deleteLicense: (id) => {
        set((state) => ({
          licenses: state.licenses.filter((lic) => lic.id !== id),
        }));
      },

      // Certification Actions
      addCertification: (certData) => {
        const now = new Date().toISOString();
        const newCert: Certification = {
          ...certData,
          id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ certifications: [...state.certifications, newCert] }));
      },

      updateCertification: (id, updates) => {
        set((state) => ({
          certifications: state.certifications.map((cert) =>
            cert.id === id
              ? { ...cert, ...updates, updatedAt: new Date().toISOString() }
              : cert
          ),
        }));
      },

      deleteCertification: (id) => {
        set((state) => ({
          certifications: state.certifications.filter((cert) => cert.id !== id),
        }));
      },

      // Queries
      getExpiringItems: (daysAhead) => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        const { ceus, licenses, certifications } = get();

        const expiringLicenses = licenses.filter((lic) => {
          const expDate = new Date(lic.expirationDate);
          return expDate <= futureDate && expDate >= now;
        });

        const expiringCEUs = ceus.filter((ceu) => {
          if (!ceu.expirationDate) return false;
          const expDate = new Date(ceu.expirationDate);
          return expDate <= futureDate && expDate >= now;
        });

        const expiringCertifications = certifications.filter((cert) => {
          const expDate = new Date(cert.expirationDate);
          return expDate <= futureDate && expDate >= now;
        });

        return { licenses: expiringLicenses, ceus: expiringCEUs, certifications: expiringCertifications };
      },

      getCEUsByCategory: () => {
        const { ceus } = get();
        return ceus.reduce((acc, ceu) => {
          const cat = ceu.category || 'General';
          acc[cat] = (acc[cat] || 0) + ceu.creditsEarned;
          return acc;
        }, {} as Record<string, number>);
      },

      getCEUsByType: () => {
        const { ceus } = get();
        return ceus.reduce((acc, ceu) => {
          acc[ceu.creditType] = (acc[ceu.creditType] || 0) + ceu.creditsEarned;
          return acc;
        }, {} as Record<CreditType, number>);
      },

      getTotalCredits: () => {
        const { ceus } = get();
        return ceus.reduce((sum, ceu) => sum + ceu.creditsEarned, 0);
      },

      getSummary: (): CredentialSummary => {
        const state = get();
        const now = new Date();

        const activeLicenses = state.licenses.filter(
          (lic) => lic.status === 'active' && new Date(lic.expirationDate) > now
        ).length;

        const activeCertifications = state.certifications.filter(
          (cert) => cert.status === 'active' && new Date(cert.expirationDate) > now
        ).length;

        const { licenses: expiringLicenses, ceus: expiringCEUs, certifications: expiringCertifications } = state.getExpiringItems(90);

        return {
          totalCEUs: state.getTotalCredits(),
          ceusByCategory: state.getCEUsByCategory(),
          ceusByType: state.getCEUsByType(),
          activeLicenses,
          activeCertifications,
          expiringLicenses,
          expiringCEUs,
          expiringCertifications,
        };
      },

      setError: (error) => set({ error }),

      clearAll: () => set({ ceus: [], licenses: [], certifications: [], error: null }),
    }),
    {
      name: 'clinical-credentials',
      version: 1,
    }
  )
);
