export interface PatientCase {
  name: string;
  mrn: string;
  age: number;
  gender: 'M' | 'F';
  unit: string;
  room: string;
  chief_complaint: string;
  admission_date: string;
  days_admitted: number;
  diagnosis: string;
  vitals: {
    bp: string;
    hr: number;
    rr: number;
    temp: number;
    spo2: number;
  };
  medications: string[];
  pmh: string[];
  barriers: string[];
  recent_notes: string;
  labs?: string;
}

export interface CaseWithCategory extends PatientCase {
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type Category =
  | 'Cardiac'
  | 'Pulmonary'
  | 'Neurology'
  | 'Infectious'
  | 'Surgical'
  | 'Pediatric'
  | 'Emergency'
  | 'Wound Care'
  | 'Obstetric'
  | 'Endocrine'
  | 'Renal'
  | 'GI'
  | 'Psychiatry'
  | 'Trauma'
  | 'Oncology';

export interface UserResponse {
  informationRequested: string[];
  differentialDiagnosis: string;
  workupPlan: string;
  treatmentPlan: string;
  safetyConsiderations: string;
}

export interface EvaluationScore {
  clinicalReasoning: number;
  differentialDiagnosis: number;
  informationGathering: number;
  treatmentPlan: number;
  safetyAwareness: number;
  overall: number;
}

export interface EvaluationFeedback {
  scores: EvaluationScore;
  strengths: string[];
  areasForImprovement: string[];
  missedFindings: string[];
  expertComparison: string;
}

export interface CompletedCase {
  mrn: string;
  score: number;
  date: string;
  category: string;
}

export interface CategoryProgress {
  completed: number;
  total: number;
  avgScore: number;
}

export interface LearnerStats {
  totalCases: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ProgressData {
  version: number;
  learnerName: string;
  apiKey: string;
  stats: LearnerStats;
  categoryProgress: Record<string, CategoryProgress>;
  completedCases: CompletedCase[];
  achievements: string[];
}

export type QuizState =
  | 'intro'
  | 'gathering'
  | 'assessment'
  | 'evaluating'
  | 'review'
  | 'complete';

export interface InfoSection {
  id: string;
  label: string;
  icon: string;
  revealed: boolean;
}
