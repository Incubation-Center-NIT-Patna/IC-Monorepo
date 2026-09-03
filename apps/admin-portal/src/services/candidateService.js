/**
 * Candidate Management & Induction Service
 * 
 * Provides candidate listing, scoring, status transitions, and persistence.
 */

const STORAGE_KEY = 'ic_candidates_data';

const SEED_CANDIDATES = [
  {
    id: 'app-101',
    name: 'Aarav Sharma',
    rollNo: '2304081',
    email: 'aarav.sharma@nitp.ac.in',
    branch: 'Computer Science & Engineering',
    domain: 'Technical & Web Development',
    score: 88,
    status: 'Selected',
    evaluator: 'Prof. Bharat Gupta',
    notes: 'Strong knowledge of React, Next.js, and Node.js. Built 2 full-stack products.',
    submittedAt: '2026-08-12T14:30:00Z',
  },
  {
    id: 'app-102',
    name: 'Sneha Kumari',
    rollNo: '2306012',
    email: 'sneha.kumari@nitp.ac.in',
    branch: 'Electronics & Communication',
    domain: 'Media & PR Management',
    score: 84,
    status: 'Interviewed',
    evaluator: 'Himanshu Bharti',
    notes: 'Excellent public speaking and graphic design skills. Handled social media campaigns.',
    submittedAt: '2026-08-13T09:15:00Z',
  },
  {
    id: 'app-103',
    name: 'Rohan Mehta',
    rollNo: '2401045',
    email: 'rohan.mehta@nitp.ac.in',
    branch: 'Mechanical Engineering',
    domain: 'IoT & Hardware Prototyping',
    score: 91,
    status: 'Selected',
    evaluator: 'Dr. Amitesh Kumar',
    notes: 'Hands-on experience with Arduino, Raspberry Pi, and telemetry sensors.',
    submittedAt: '2026-08-13T16:45:00Z',
  },
  {
    id: 'app-104',
    name: 'Ananya Verma',
    rollNo: '2407029',
    email: 'ananya.verma@nitp.ac.in',
    branch: 'Architecture & Design',
    domain: 'UI/UX Design',
    score: 76,
    status: 'In Review',
    evaluator: 'Pending Evaluation',
    notes: 'Great Figma portfolio with mobile app wireframes and brand guidelines.',
    submittedAt: '2026-08-14T11:20:00Z',
  },
  {
    id: 'app-105',
    name: 'Aditya Raj',
    rollNo: '2303055',
    email: 'aditya.raj@nitp.ac.in',
    branch: 'Information Technology',
    domain: 'Technical & Web Development',
    score: 82,
    status: 'Interviewed',
    evaluator: 'Prof. Bharat Gupta',
    notes: 'Proficient in Python, FastAPI, and database indexing.',
    submittedAt: '2026-08-14T15:00:00Z',
  },
  {
    id: 'app-106',
    name: 'Pooja Singh',
    rollNo: '2405018',
    email: 'pooja.singh@nitp.ac.in',
    branch: 'Civil Engineering',
    domain: 'Events & Operations',
    score: 79,
    status: 'In Review',
    evaluator: 'Himanshu Bharti',
    notes: 'Experienced in logistics, campus outreach, and sponsorship management.',
    submittedAt: '2026-08-15T08:30:00Z',
  },
  {
    id: 'app-107',
    name: 'Kavya Patel',
    rollNo: '2302067',
    email: 'kavya.patel@nitp.ac.in',
    branch: 'Electrical Engineering',
    domain: 'IoT & Hardware Prototyping',
    score: 86,
    status: 'Selected',
    evaluator: 'Dr. Amitesh Kumar',
    notes: 'Built PCB designs for EV battery management system prototype.',
    submittedAt: '2026-08-15T12:10:00Z',
  },
  {
    id: 'app-108',
    name: 'Manish Kumar',
    rollNo: '2408011',
    email: 'manish.kumar@nitp.ac.in',
    branch: 'Computer Science & Engineering',
    domain: 'Technical & Web Development',
    score: 70,
    status: 'In Review',
    evaluator: 'Pending Evaluation',
    notes: 'Practicing frontend fundamentals with Tailwind CSS and Next.js.',
    submittedAt: '2026-08-15T17:40:00Z',
  },
];

export const CandidateService = {
  getCandidates: () => {
    if (typeof window === 'undefined') return SEED_CANDIDATES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CANDIDATES));
      return SEED_CANDIDATES;
    } catch {
      return SEED_CANDIDATES;
    }
  },

  getCandidateById: (id) => {
    const candidates = CandidateService.getCandidates();
    return candidates.find((c) => c.id === id) || null;
  },

  updateCandidate: (id, updates) => {
    const candidates = CandidateService.getCandidates();
    const index = candidates.findIndex((c) => c.id === id);
    if (index !== -1) {
      candidates[index] = { ...candidates[index], ...updates, updatedAt: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
      }
      return candidates[index];
    }
    return null;
  },

  addCandidate: (candidateData) => {
    const candidates = CandidateService.getCandidates();
    const newCandidate = {
      id: `app-${Date.now()}`,
      score: 0,
      status: 'In Review',
      submittedAt: new Date().toISOString(),
      ...candidateData,
    };
    const updated = [newCandidate, ...candidates];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newCandidate;
  },

  getStats: () => {
    const candidates = CandidateService.getCandidates();
    const total = candidates.length;
    const selected = candidates.filter((c) => c.status === 'Selected').length;
    const interviewed = candidates.filter((c) => c.status === 'Interviewed').length;
    const inReview = candidates.filter((c) => c.status === 'In Review' || c.status === 'In Queue').length;

    return { total, selected, interviewed, inReview };
  },
};
