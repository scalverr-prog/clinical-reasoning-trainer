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
  notificationPrefs: NotificationPreferences;
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

// ===== VIEW NAVIGATION =====

export type View =
  | 'dashboard'
  | 'cases'
  | 'case'
  | 'progress'
  | 'settings'
  | 'insight'
  | 'quiz'
  | 'login'
  | 'signup'
  | 'profile'
  | 'credentials'
  | 'documents'
  | 'conferences'
  | 'consult';

// ===== USER AUTHENTICATION & PROFILE =====

export type CredentialType = 'RN' | 'LPN' | 'MD' | 'DO' | 'PA' | 'NP' | 'APRN' | 'EMT' | 'Paramedic' | 'RT' | 'Other';

export interface ProfessionalCredential {
  id: string;
  type: CredentialType;
  licenseNumber: string;
  state: string;
  issuedDate: string;
  expirationDate: string;
  verified: boolean;
  documentId: string | null;
}

export interface ProfileNotificationPreferences {
  // Channels
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;

  // License & Credential Reminders
  licenseRenewalReminders: boolean;
  licenseReminderDays: number[]; // e.g., [90, 60, 30, 14, 7]

  // CEU/CME Reminders
  ceuExpirationReminders: boolean;
  ceuReminderDays: number[];

  // Conference Notifications
  conferenceRecommendations: boolean;
  savedConferenceReminders: boolean;
  conferenceReminderDays: number[];

  // Learning Reminders
  studyReminders: boolean;
  studyReminderFrequency: 'daily' | 'weekly' | 'none';
  preferredStudyTime: string; // e.g., "09:00"

  // Digest
  weeklyDigest: boolean;
  digestDay: 'monday' | 'friday' | 'sunday';
}

export const DEFAULT_NOTIFICATION_PREFERENCES: ProfileNotificationPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  inAppNotifications: true,
  licenseRenewalReminders: true,
  licenseReminderDays: [90, 60, 30, 14, 7],
  ceuExpirationReminders: true,
  ceuReminderDays: [60, 30, 14],
  conferenceRecommendations: true,
  savedConferenceReminders: true,
  conferenceReminderDays: [30, 7, 1],
  studyReminders: false,
  studyReminderFrequency: 'weekly',
  preferredStudyTime: '09:00',
  weeklyDigest: true,
  digestDay: 'monday',
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  credentials: ProfessionalCredential[];
  specialties: string[];
  employer: string | null;
  institution: string | null;
  title: string | null;
  bio: string | null;
  notificationPreferences: ProfileNotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

// ===== CEU/CME TRACKING =====

export type CreditType = 'CEU' | 'CME' | 'Contact Hour' | 'CE' | 'CNE';

export type LicenseType = 'RN' | 'LPN' | 'LVN' | 'APRN' | 'NP' | 'PA' | 'MD' | 'DO' | 'CNA' | 'Other';

export type LicenseStatus = 'active' | 'pending' | 'expired' | 'inactive';

export interface CEURecord {
  id: string;
  userId: string;
  title: string;
  provider: string;
  creditsEarned: number;
  creditType: CreditType;
  category: string;
  completionDate: string;
  expirationDate: string | null;
  certificateDocId: string | null;
  verificationUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  userId: string;
  type: LicenseType;
  licenseNumber: string;
  state: string;
  issuedDate: string | null;
  expirationDate: string;
  status: LicenseStatus;
  renewalReminderDays: number[];
  documentId: string | null;
  verificationUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===== CERTIFICATIONS =====

export type CertificationType =
  | 'BLS'
  | 'ACLS'
  | 'PALS'
  | 'NRP'
  | 'TNCC'
  | 'ENPC'
  | 'STABLE'
  | 'CCRN'
  | 'CEN'
  | 'CNOR'
  | 'OCN'
  | 'RNC-OB'
  | 'RNC-NIC'
  | 'SCRN'
  | 'TCRN'
  | 'CPEN'
  | 'CFRN'
  | 'CMC'
  | 'CSC'
  | 'Other';

export interface Certification {
  id: string;
  userId: string;
  type: CertificationType;
  customType: string | null; // For 'Other' type
  name: string;
  issuingOrganization: string;
  credentialId: string | null;
  issuedDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending';
  documentId: string | null;
  verificationUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialSummary {
  totalCEUs: number;
  ceusByCategory: Record<string, number>;
  ceusByType: Record<CreditType, number>;
  activeLicenses: number;
  activeCertifications: number;
  expiringLicenses: License[];
  expiringCEUs: CEURecord[];
  expiringCertifications: Certification[];
}

// ===== DOCUMENT REPOSITORY =====

export type DocumentCategory = 'license' | 'certificate' | 'diploma' | 'ceu_certificate' | 'verification_letter' | 'resume' | 'other';

export interface StoredDocument {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  linkedCredentialId: string | null;
  linkedCredentialType: 'license' | 'ceu' | null;
  expirationDate: string | null;
  tags: string[];
  uploadedAt: string;
  updatedAt: string;
}

// ===== CONFERENCE INTEGRATION =====

export interface ConferenceLocation {
  venue: string;
  city: string;
  state: string;
  country: string;
  virtual: boolean;
  hybridAvailable: boolean;
}

export interface ConferenceCredits {
  cme: number;
  ceu: number;
  contactHours: number;
  pharmacology: number;
}

export interface Conference {
  id: string;
  name: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: ConferenceLocation;
  specialties: string[];
  creditOffered: ConferenceCredits;
  registrationUrl: string;
  registrationDeadline: string | null;
  earlyBirdDeadline: string | null;
  cost: {
    early: number | null;
    regular: number;
    late: number | null;
    virtual: number | null;
  };
  imageUrl: string | null;
  featured: boolean;
  source: 'triago' | 'manual';
}

export interface SavedConference {
  id: string;
  userId: string;
  conferenceId: string;
  conference: Conference;
  savedAt: string;
  registered: boolean;
  registrationDate: string | null;
  attendanceType: 'in_person' | 'virtual' | null;
  notes: string;
  reminderSet: boolean;
  reminderDate: string | null;
}

export interface ConferenceFilters {
  searchQuery: string;
  specialties: string[];
  dateRange: { start: string; end: string } | null;
  location: string | null;
  virtual: boolean | null;
  hasCME: boolean;
  hasCEU: boolean;
  maxCost: number | null;
}

// ===== PLATFORM NOTIFICATIONS =====

export type PlatformNotificationType =
  | 'license_expiring'
  | 'ceu_expiring'
  | 'document_expiring'
  | 'conference_reminder'
  | 'conference_recommendation'
  | 'study_reminder'
  | 'achievement'
  | 'system';

export interface PlatformNotification {
  id: string;
  userId: string;
  type: PlatformNotificationType;
  title: string;
  message: string;
  link: string | null;
  linkView: View | null;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
}

export interface NotificationSchedule {
  type: PlatformNotificationType;
  enabled: boolean;
  daysBeforeExpiry: number[];
  channels: ('in_app' | 'email' | 'push')[];
}

// ===== INSIGHT FEATURE =====

export interface StructuredInsightCase {
  patientSummary: string;
  presentation: string;
  initialAssessment: string;
  actualOutcome: string;
  keyFindings: string[];
  teachingPoints: string[];
}

export interface ClinicalInsight {
  id: string;
  createdAt: string;
  updatedAt: string;
  rawNotes: string;
  structuredCase: StructuredInsightCase | null;
  lessonLearned: string;
  keyTakeaways: string[];
  clinicalPearls: string[];
  category: Category;
  tags: string[];
  lastReviewedAt: string | null;
  reviewCount: number;
}

// ===== NOTIFICATIONS =====

export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  preferredTime: string;
  lastNotificationAt: string | null;
}

export interface SuggestedCase {
  mrn: string;
  reason: 'weak_category' | 'spaced_repetition' | 'new_category' | 'random';
  category: Category;
  daysSinceLastAttempt?: number;
  categoryScore?: number;
}

// ===== QUIZ CARDS =====

export type QuizCardType =
  | 'workup'
  | 'diagnostic_criteria'
  | 'dangerous_mimics'
  | 'management_pitfall';

export interface QuizCard {
  id: string;
  type: QuizCardType;
  category: Category;
  sourceMrn: string;
  question: string;
  answer: string;
  hints?: string[];
  relatedConcepts?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  consecutiveCorrect: number;
  totalAttempts: number;
  correctAttempts: number;
}

export interface QuizCardResult {
  cardId: string;
  correct: boolean;
  timeSpentMs: number;
  answeredAt: string;
}

export interface QuizFilters {
  categories: Category[];
  cardTypes: QuizCardType[];
  difficulty?: 'easy' | 'medium' | 'hard';
  onlyDue?: boolean;
}

export interface QuizSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  cardIds: string[];
  currentIndex: number;
  results: QuizCardResult[];
  filters: QuizFilters;
}

// ===== CASE COMPARISON =====

export interface CaseComparisonInput {
  scenario: string;
  userAssessment: string;
  userWorkup: string;
  userTreatment: string;
}

export interface ExpertAnalysis {
  assessment: string;
  differentials: string[];
  workup: string[];
  treatment: string[];
  criticalActions: string[];
  pitfalls: string[];
}

export interface ComparisonResult {
  id: string;
  createdAt: string;
  scenario: string;
  userInput: CaseComparisonInput;
  expertAnalysis: ExpertAnalysis;
  scores: {
    assessment: number;
    workup: number;
    treatment: number;
    overall: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    missed: string[];
  };
}
