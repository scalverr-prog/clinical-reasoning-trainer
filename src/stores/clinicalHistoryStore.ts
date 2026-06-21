import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClinicalCaseRecord {
  id: string;
  timestamp: string;
  // Case details
  clinicalNote: string;
  userAssessment: string;
  userDifferentials: string;
  userPlan: string;
  // AI evaluation
  actualDiagnosis: string;
  userAccuracy: 'correct' | 'partial' | 'incorrect';
  feedback: string;
  keyFindings: string[];
  missedFindings: string[];
  learningPoints: string[];
  treatmentProvided: string[];
  treatmentAccuracy: 'appropriate' | 'partially_appropriate' | 'needs_improvement';
  treatmentFeedback: string;
  recommendedTreatment: string[];
  // User notes
  userNotes?: string;
  starred?: boolean;
  tags?: string[];
}

export interface LearningInsight {
  id: string;
  timestamp: string;
  category: string; // e.g., "Cardiology", "Pulmonology"
  insight: string;
  relatedCaseIds: string[];
}

export interface ClinicalProfile {
  // Diagnostic patterns
  diagnosticAccuracy: {
    correct: number;
    partial: number;
    incorrect: number;
  };
  // Treatment patterns
  treatmentAccuracy: {
    appropriate: number;
    partiallyAppropriate: number;
    needsImprovement: number;
  };
  // Common areas
  strongAreas: string[];
  growthAreas: string[];
  // Categories seen
  categoriesSeen: Record<string, number>;
  // Common missed findings
  commonMissedFindings: string[];
}

interface ClinicalHistoryState {
  cases: ClinicalCaseRecord[];
  insights: LearningInsight[];
  profile: ClinicalProfile;

  // Actions
  addCase: (caseRecord: Omit<ClinicalCaseRecord, 'id' | 'timestamp'>) => string;
  updateCase: (id: string, updates: Partial<ClinicalCaseRecord>) => void;
  deleteCase: (id: string) => void;
  starCase: (id: string) => void;
  addNoteToCase: (id: string, note: string) => void;
  addInsight: (insight: Omit<LearningInsight, 'id' | 'timestamp'>) => void;
  getRecentCases: (limit?: number) => ClinicalCaseRecord[];
  getStarredCases: () => ClinicalCaseRecord[];
  getCasesByAccuracy: (accuracy: 'correct' | 'partial' | 'incorrect') => ClinicalCaseRecord[];
  getRelatedCases: (diagnosis: string) => ClinicalCaseRecord[];
  updateProfile: () => void;
  getContextForAI: () => string;
}

const initialProfile: ClinicalProfile = {
  diagnosticAccuracy: { correct: 0, partial: 0, incorrect: 0 },
  treatmentAccuracy: { appropriate: 0, partiallyAppropriate: 0, needsImprovement: 0 },
  strongAreas: [],
  growthAreas: [],
  categoriesSeen: {},
  commonMissedFindings: [],
};

export const useClinicalHistoryStore = create<ClinicalHistoryState>()(
  persist(
    (set, get) => ({
      cases: [],
      insights: [],
      profile: initialProfile,

      addCase: (caseRecord) => {
        const id = `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newCase: ClinicalCaseRecord = {
          ...caseRecord,
          id,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          cases: [newCase, ...state.cases],
        }));

        // Update profile after adding case
        get().updateProfile();

        return id;
      },

      updateCase: (id, updates) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        }));
        get().updateProfile();
      },

      starCase: (id) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, starred: !c.starred } : c
          ),
        }));
      },

      addNoteToCase: (id, note) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, userNotes: note } : c
          ),
        }));
      },

      addInsight: (insight) => {
        const id = `insight-${Date.now()}`;
        set((state) => ({
          insights: [
            { ...insight, id, timestamp: new Date().toISOString() },
            ...state.insights,
          ],
        }));
      },

      getRecentCases: (limit = 10) => {
        return get().cases.slice(0, limit);
      },

      getStarredCases: () => {
        return get().cases.filter((c) => c.starred);
      },

      getCasesByAccuracy: (accuracy) => {
        return get().cases.filter((c) => c.userAccuracy === accuracy);
      },

      getRelatedCases: (diagnosis) => {
        const searchTerms = diagnosis.toLowerCase().split(' ');
        return get().cases.filter((c) => {
          const caseDiagnosis = c.actualDiagnosis.toLowerCase();
          return searchTerms.some((term) => caseDiagnosis.includes(term));
        });
      },

      updateProfile: () => {
        const cases = get().cases;

        // Calculate diagnostic accuracy
        const diagnosticAccuracy = {
          correct: cases.filter((c) => c.userAccuracy === 'correct').length,
          partial: cases.filter((c) => c.userAccuracy === 'partial').length,
          incorrect: cases.filter((c) => c.userAccuracy === 'incorrect').length,
        };

        // Calculate treatment accuracy
        const treatmentAccuracy = {
          appropriate: cases.filter((c) => c.treatmentAccuracy === 'appropriate').length,
          partiallyAppropriate: cases.filter((c) => c.treatmentAccuracy === 'partially_appropriate').length,
          needsImprovement: cases.filter((c) => c.treatmentAccuracy === 'needs_improvement').length,
        };

        // Find common missed findings
        const missedFindingsCount: Record<string, number> = {};
        cases.forEach((c) => {
          c.missedFindings.forEach((finding) => {
            const key = finding.toLowerCase().trim();
            missedFindingsCount[key] = (missedFindingsCount[key] || 0) + 1;
          });
        });
        const commonMissedFindings = Object.entries(missedFindingsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([finding]) => finding);

        // Identify strong and growth areas based on patterns
        const strongAreas: string[] = [];
        const growthAreas: string[] = [];

        if (diagnosticAccuracy.correct > diagnosticAccuracy.incorrect * 2) {
          strongAreas.push('Diagnostic reasoning');
        } else if (diagnosticAccuracy.incorrect > diagnosticAccuracy.correct) {
          growthAreas.push('Diagnostic accuracy');
        }

        if (treatmentAccuracy.appropriate > treatmentAccuracy.needsImprovement * 2) {
          strongAreas.push('Treatment planning');
        } else if (treatmentAccuracy.needsImprovement > treatmentAccuracy.appropriate) {
          growthAreas.push('Treatment decisions');
        }

        set({
          profile: {
            diagnosticAccuracy,
            treatmentAccuracy,
            strongAreas,
            growthAreas,
            categoriesSeen: {},
            commonMissedFindings,
          },
        });
      },

      getContextForAI: () => {
        const { cases, profile } = get();
        const recentCases = cases.slice(0, 5);

        if (cases.length === 0) {
          return '';
        }

        let context = `\n\nLEARNER PROFILE (based on ${cases.length} previous cases):\n`;

        // Accuracy stats
        const totalDiag = profile.diagnosticAccuracy.correct + profile.diagnosticAccuracy.partial + profile.diagnosticAccuracy.incorrect;
        if (totalDiag > 0) {
          const correctPct = Math.round((profile.diagnosticAccuracy.correct / totalDiag) * 100);
          context += `- Diagnostic accuracy: ${correctPct}% correct\n`;
        }

        // Strong areas
        if (profile.strongAreas.length > 0) {
          context += `- Strengths: ${profile.strongAreas.join(', ')}\n`;
        }

        // Growth areas
        if (profile.growthAreas.length > 0) {
          context += `- Areas for growth: ${profile.growthAreas.join(', ')}\n`;
        }

        // Common missed findings
        if (profile.commonMissedFindings.length > 0) {
          context += `- Commonly missed: ${profile.commonMissedFindings.slice(0, 3).join(', ')}\n`;
        }

        // Recent diagnoses for context
        if (recentCases.length > 0) {
          context += `\nRecent cases reviewed:\n`;
          recentCases.forEach((c, i) => {
            context += `${i + 1}. ${c.actualDiagnosis} (${c.userAccuracy})\n`;
          });
        }

        context += `\nUse this profile to personalize feedback - acknowledge improvements, reference similar past cases, and focus on their growth areas.`;

        return context;
      },
    }),
    {
      name: 'clinical-history',
      version: 1,
    }
  )
);
