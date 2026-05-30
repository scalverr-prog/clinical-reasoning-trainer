import type { Category } from '../types';

export const CATEGORY_INFO: Record<Category, { description: string; color: string; icon: string }> = {
  Cardiac: {
    description: 'Heart conditions including arrhythmias, MI, heart failure',
    color: 'red',
    icon: 'Heart',
  },
  Pulmonary: {
    description: 'Respiratory conditions including pneumonia, COPD, PE',
    color: 'blue',
    icon: 'Stethoscope',
  },
  Neurology: {
    description: 'Neurological conditions including stroke, seizures, headaches',
    color: 'purple',
    icon: 'Brain',
  },
  Infectious: {
    description: 'Infections including sepsis, cellulitis, osteomyelitis',
    color: 'yellow',
    icon: 'Syringe',
  },
  Surgical: {
    description: 'Surgical conditions including appendicitis, bowel obstruction',
    color: 'indigo',
    icon: 'Scissors',
  },
  Pediatric: {
    description: 'Cases involving patients under 18 years old',
    color: 'pink',
    icon: 'Baby',
  },
  Emergency: {
    description: 'Acute emergency presentations',
    color: 'orange',
    icon: 'AlertTriangle',
  },
  'Wound Care': {
    description: 'Wound management including diabetic foot ulcers',
    color: 'green',
    icon: 'Bandage',
  },
  Obstetric: {
    description: 'Pregnancy and obstetric conditions',
    color: 'rose',
    icon: 'Heart',
  },
  Endocrine: {
    description: 'Endocrine conditions including diabetes, thyroid',
    color: 'teal',
    icon: 'Activity',
  },
  Renal: {
    description: 'Kidney conditions including AKI, CKD',
    color: 'cyan',
    icon: 'Droplet',
  },
  GI: {
    description: 'Gastrointestinal conditions',
    color: 'amber',
    icon: 'Circle',
  },
  Psychiatry: {
    description: 'Mental health conditions',
    color: 'violet',
    icon: 'Brain',
  },
  Trauma: {
    description: 'Traumatic injuries and accidents',
    color: 'red',
    icon: 'AlertTriangle',
  },
  Oncology: {
    description: 'Cancer-related conditions',
    color: 'gray',
    icon: 'Activity',
  },
};

export const ALL_CATEGORIES: Category[] = [
  'Cardiac',
  'Pulmonary',
  'Neurology',
  'Infectious',
  'Surgical',
  'Pediatric',
  'Emergency',
  'Wound Care',
  'Obstetric',
  'Endocrine',
  'Renal',
  'GI',
  'Psychiatry',
  'Trauma',
  'Oncology',
];
