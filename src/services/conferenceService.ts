import type { Conference, ConferenceFilters } from '../types';

const TRIAGO_API_URL = import.meta.env.VITE_TRIAGO_API_URL || 'https://api.triago.com';
const TRIAGO_API_KEY = import.meta.env.VITE_TRIAGO_API_KEY;

interface TriagoSearchResponse {
  conferences: Conference[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Search conferences using Triago API
 */
export async function searchConferences(
  filters: ConferenceFilters,
  page = 1,
  pageSize = 20
): Promise<TriagoSearchResponse> {
  // If no API key, return mock data for development
  if (!TRIAGO_API_KEY) {
    return getMockConferences(filters, page, pageSize);
  }

  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (filters.searchQuery) params.append('q', filters.searchQuery);
  if (filters.specialties.length > 0) params.append('specialties', filters.specialties.join(','));
  if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
  if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
  if (filters.location) params.append('location', filters.location);
  if (filters.virtual !== null) params.append('virtual', filters.virtual.toString());
  if (filters.hasCME) params.append('hasCME', 'true');
  if (filters.hasCEU) params.append('hasCEU', 'true');
  if (filters.maxCost) params.append('maxCost', filters.maxCost.toString());

  try {
    const response = await fetch(`${TRIAGO_API_URL}/v1/conferences?${params}`, {
      headers: {
        'Authorization': `Bearer ${TRIAGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Triago API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Conference search failed:', error);
    // Fallback to mock data on error
    return getMockConferences(filters, page, pageSize);
  }
}

/**
 * Get conference by ID
 */
export async function getConference(id: string): Promise<Conference | null> {
  if (!TRIAGO_API_KEY) {
    const mock = MOCK_CONFERENCES.find(c => c.id === id);
    return mock || null;
  }

  try {
    const response = await fetch(`${TRIAGO_API_URL}/v1/conferences/${id}`, {
      headers: {
        'Authorization': `Bearer ${TRIAGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to get conference:', error);
    return null;
  }
}

// Mock data for development/demo - all conferences are current (2026)
const MOCK_CONFERENCES: Conference[] = [
  {
    id: 'conf-001',
    name: 'American Nurses Association Annual Conference 2026',
    description: 'Join thousands of nursing professionals for the premier nursing event of the year. Network, learn, and advance your career.',
    organizer: 'American Nurses Association',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    location: {
      venue: 'San Diego Convention Center',
      city: 'San Diego',
      state: 'CA',
      country: 'USA',
      virtual: false,
      hybridAvailable: true,
    },
    specialties: ['General Nursing', 'Leadership', 'Education'],
    creditOffered: { cme: 0, ceu: 24, contactHours: 24, pharmacology: 4 },
    registrationUrl: 'https://nursingworld.org/conference',
    registrationDeadline: '2026-07-01',
    earlyBirdDeadline: '2026-05-15',
    cost: { early: 495, regular: 595, late: 695, virtual: 295 },
    imageUrl: null,
    featured: true,
    source: 'triago',
  },
  {
    id: 'conf-002',
    name: 'Critical Care Medicine Conference 2026',
    description: 'Advanced critical care topics including ventilator management, sepsis protocols, and hemodynamic monitoring.',
    organizer: 'Society of Critical Care Medicine',
    startDate: '2026-08-20',
    endDate: '2026-08-23',
    location: {
      venue: 'Marriott Marquis',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      virtual: false,
      hybridAvailable: true,
    },
    specialties: ['Critical Care', 'Emergency Medicine', 'Pulmonology'],
    creditOffered: { cme: 32, ceu: 32, contactHours: 32, pharmacology: 8 },
    registrationUrl: 'https://sccm.org/conference',
    registrationDeadline: '2026-08-10',
    earlyBirdDeadline: '2026-06-20',
    cost: { early: 650, regular: 795, late: 895, virtual: 395 },
    imageUrl: null,
    featured: true,
    source: 'triago',
  },
  {
    id: 'conf-003',
    name: 'Wound Care & Ostomy Management Symposium 2026',
    description: 'Latest advances in wound healing, pressure injury prevention, and ostomy care.',
    organizer: 'Wound, Ostomy and Continence Nurses Society',
    startDate: '2026-09-05',
    endDate: '2026-09-07',
    location: {
      venue: 'Hilton Orlando',
      city: 'Orlando',
      state: 'FL',
      country: 'USA',
      virtual: true,
      hybridAvailable: true,
    },
    specialties: ['Wound Care', 'Ostomy', 'Dermatology'],
    creditOffered: { cme: 18, ceu: 18, contactHours: 18, pharmacology: 2 },
    registrationUrl: 'https://wocn.org/symposium',
    registrationDeadline: '2026-08-25',
    earlyBirdDeadline: '2026-07-15',
    cost: { early: 425, regular: 525, late: 625, virtual: 275 },
    imageUrl: null,
    featured: false,
    source: 'triago',
  },
  {
    id: 'conf-004',
    name: 'Emergency Nursing Conference 2026',
    description: 'Trauma care, triage best practices, and emergency department innovations.',
    organizer: 'Emergency Nurses Association',
    startDate: '2026-10-10',
    endDate: '2026-10-13',
    location: {
      venue: 'Las Vegas Convention Center',
      city: 'Las Vegas',
      state: 'NV',
      country: 'USA',
      virtual: false,
      hybridAvailable: false,
    },
    specialties: ['Emergency Medicine', 'Trauma', 'Pediatric Emergency'],
    creditOffered: { cme: 28, ceu: 28, contactHours: 28, pharmacology: 6 },
    registrationUrl: 'https://ena.org/conference',
    registrationDeadline: '2026-09-30',
    earlyBirdDeadline: '2026-08-15',
    cost: { early: 550, regular: 675, late: 775, virtual: null },
    imageUrl: null,
    featured: true,
    source: 'triago',
  },
  {
    id: 'conf-005',
    name: 'Pediatric Nursing Virtual Summit 2026',
    description: 'Online conference covering pediatric assessment, developmental care, and family-centered practice.',
    organizer: 'Society of Pediatric Nurses',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    location: {
      venue: 'Virtual Event',
      city: '',
      state: '',
      country: 'Online',
      virtual: true,
      hybridAvailable: false,
    },
    specialties: ['Pediatrics', 'Neonatal', 'Family Practice'],
    creditOffered: { cme: 12, ceu: 12, contactHours: 12, pharmacology: 2 },
    registrationUrl: 'https://pedsnurses.org/summit',
    registrationDeadline: '2026-10-28',
    earlyBirdDeadline: '2026-09-15',
    cost: { early: 175, regular: 225, late: 275, virtual: 225 },
    imageUrl: null,
    featured: false,
    source: 'triago',
  },
  {
    id: 'conf-006',
    name: 'Oncology Nursing Society Congress 2026',
    description: 'Comprehensive oncology nursing education including chemotherapy administration, symptom management, and survivorship.',
    organizer: 'Oncology Nursing Society',
    startDate: '2026-12-08',
    endDate: '2026-12-11',
    location: {
      venue: 'Phoenix Convention Center',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      virtual: false,
      hybridAvailable: true,
    },
    specialties: ['Oncology', 'Palliative Care', 'Infusion'],
    creditOffered: { cme: 30, ceu: 30, contactHours: 30, pharmacology: 10 },
    registrationUrl: 'https://ons.org/congress',
    registrationDeadline: '2026-11-28',
    earlyBirdDeadline: '2026-10-01',
    cost: { early: 575, regular: 695, late: 795, virtual: 345 },
    imageUrl: null,
    featured: true,
    source: 'triago',
  },
];

function getMockConferences(
  filters: ConferenceFilters,
  page: number,
  pageSize: number
): TriagoSearchResponse {
  let filtered = [...MOCK_CONFERENCES];

  // Apply filters
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.organizer.toLowerCase().includes(query)
    );
  }

  if (filters.specialties.length > 0) {
    filtered = filtered.filter(c =>
      filters.specialties.some(s => c.specialties.includes(s))
    );
  }

  if (filters.virtual !== null) {
    filtered = filtered.filter(c =>
      filters.virtual ? c.location.virtual || c.location.hybridAvailable : !c.location.virtual
    );
  }

  if (filters.hasCME) {
    filtered = filtered.filter(c => c.creditOffered.cme > 0);
  }

  if (filters.hasCEU) {
    filtered = filtered.filter(c => c.creditOffered.ceu > 0);
  }

  if (filters.maxCost) {
    filtered = filtered.filter(c => c.cost.regular <= filters.maxCost!);
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.location.city.toLowerCase().includes(loc) ||
        c.location.state.toLowerCase().includes(loc)
    );
  }

  // Pagination
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    conferences: paged,
    total: filtered.length,
    page,
    pageSize,
  };
}

export const HEALTHCARE_SPECIALTIES = [
  'General Nursing',
  'Critical Care',
  'Emergency Medicine',
  'Pediatrics',
  'Oncology',
  'Cardiology',
  'Neurology',
  'Wound Care',
  'Palliative Care',
  'Mental Health',
  'Geriatrics',
  'Obstetrics',
  'Neonatal',
  'Infection Control',
  'Leadership',
  'Education',
  'Informatics',
  'Public Health',
];
