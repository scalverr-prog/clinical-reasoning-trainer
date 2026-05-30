import type { PatientCase, CaseWithCategory, Category } from '../types';

const CATEGORY_KEYWORDS: Record<Category, RegExp> = {
  'Cardiac': /chest pain|myocardial|cardiac|afib|arrhythmia|heart|palpitation|hypertens|angina|stemi|nstemi|CHF|heart failure|EF \d+%|cardiomyopathy|bradycardia|tachycardia/i,
  'Pulmonary': /shortness of breath|pneumonia|copd|respiratory|dyspnea|asthma|spo2|oxygen|hypoxia|pulmonary|lung|bronch|pleural|cough/i,
  'Neurology': /seizure|stroke|headache|weakness|neuro|altered mental|confusion|TIA|migraine|encephalopathy|meningitis|neuropathy|paralysis/i,
  'Infectious': /infection|sepsis|cellulitis|fever|abscess|osteomyelitis|MRSA|MSSA|pseudomonas|bacteremia|UTI|pneumonia.*fever/i,
  'Surgical': /appendicitis|cholecystitis|bowel|surgical|abdomen.*pain|obstruction|perforation|I&D|incision|drain/i,
  'Pediatric': /pediatric|child|infant|newborn|neonatal/i,
  'Emergency': /trauma|accident|fall|injury|laceration|fracture|overdose|intoxication/i,
  'Wound Care': /wound|ulcer|DFU|diabetic foot|decubitus|pressure injury|debridement|NPWT/i,
  'Obstetric': /pregnancy|pregnant|G\dP\d|LMP|gestational|obstetric|L&D|labor|delivery|trimester|fetal/i,
  'Endocrine': /diabet|thyroid|adrenal|glucose|HbA1c|insulin|hypoglycemia|hyperglycemia|DKA|HHS/i,
  'Renal': /kidney|renal|CKD|GFR|creatinine|dialysis|AKI|nephro/i,
  'GI': /abdominal|GI|gastro|nausea|vomiting|diarrhea|constipation|liver|hepat|pancreat|GERD|bowel/i,
  'Psychiatry': /anxiety|depression|suicidal|psychiatric|mental health|psychosis|bipolar|schizophrenia/i,
  'Trauma': /trauma|MVA|fall|assault|injury|fracture|contusion|laceration|blunt|penetrating/i,
  'Oncology': /cancer|tumor|malignancy|oncology|metastatic|chemo|radiation/i,
};

const UNIT_CATEGORY_MAP: Record<string, Category[]> = {
  'ED': ['Emergency'],
  'ICU': ['Emergency'],
  'Wound Care': ['Wound Care', 'Infectious'],
  'L&D': ['Obstetric'],
  'Peds': ['Pediatric'],
  'Peds ED': ['Pediatric', 'Emergency'],
  'Pediatric ED': ['Pediatric', 'Emergency'],
  'PICU': ['Pediatric', 'Emergency'],
  'NICU': ['Pediatric', 'Emergency'],
  'Telemetry': ['Cardiac'],
  'Med-Surg': [],
  'Oncology': ['Oncology'],
};

function getDifficultyFromCase(patient: PatientCase): 'beginner' | 'intermediate' | 'advanced' {
  let complexityScore = 0;

  // More barriers = more complex
  complexityScore += patient.barriers.length * 2;

  // More medications = more complex
  complexityScore += Math.min(patient.medications.length, 5);

  // More PMH = more complex
  complexityScore += Math.min(patient.pmh.length, 4);

  // Longer notes often indicate more complexity
  if (patient.recent_notes.length > 1000) complexityScore += 2;
  if (patient.recent_notes.length > 2000) complexityScore += 2;

  // Certain keywords indicate complexity
  const complexKeywords = /allergies?|contraindicated|renal|hepatic|interaction|life-threatening|critical|unstable|emergency/i;
  if (complexKeywords.test(patient.recent_notes)) complexityScore += 3;

  // Age extremes add complexity
  if (patient.age < 18 || patient.age > 75) complexityScore += 1;

  if (complexityScore <= 4) return 'beginner';
  if (complexityScore <= 10) return 'intermediate';
  return 'advanced';
}

export function categorizeCase(patient: PatientCase): CaseWithCategory {
  const categories: Category[] = [];

  // Check unit-based categories first
  const unitCategories = UNIT_CATEGORY_MAP[patient.unit] || [];
  categories.push(...unitCategories);

  // Check age for pediatric
  if (patient.age < 18) {
    if (!categories.includes('Pediatric')) {
      categories.push('Pediatric');
    }
  }

  // Check all keyword patterns against relevant fields
  const searchText = [
    patient.chief_complaint,
    patient.diagnosis,
    patient.recent_notes,
    patient.pmh.join(' '),
    patient.barriers.join(' '),
    patient.labs || '',
  ].join(' ');

  for (const [category, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
    if (pattern.test(searchText) && !categories.includes(category as Category)) {
      categories.push(category as Category);
    }
  }

  // If no categories found, assign based on unit or default to Emergency
  if (categories.length === 0) {
    categories.push('Emergency');
  }

  return {
    ...patient,
    categories,
    difficulty: getDifficultyFromCase(patient),
  };
}

export function categorizeCases(patients: PatientCase[]): CaseWithCategory[] {
  return patients.map(categorizeCase);
}

export function getCasesForCategory(
  cases: CaseWithCategory[],
  category: Category | 'All'
): CaseWithCategory[] {
  if (category === 'All') return cases;
  return cases.filter((c) => c.categories.includes(category));
}

export function getCasesForDifficulty(
  cases: CaseWithCategory[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all'
): CaseWithCategory[] {
  if (difficulty === 'all') return cases;
  return cases.filter((c) => c.difficulty === difficulty);
}

export function getAvailableCategories(cases: CaseWithCategory[]): { category: Category; count: number }[] {
  const counts: Record<string, number> = {};

  for (const c of cases) {
    for (const cat of c.categories) {
      counts[cat] = (counts[cat] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category: category as Category, count }))
    .sort((a, b) => b.count - a.count);
}
