import { CLOUDINARY_BASE_URL, pitchtember_url } from './const';

export const EVENTS_DATA = [
  {
    id: 'orientation-2023',
    title: 'Orientation Session 2023',
    tagline: 'Welcoming New Innovators & Startup Founders',
    category: 'Workshop',
    status: 'Past',
    date: '21/09/2023',
    startDate: '2023-09-21',
    endDate: null,
    time: '04:00 PM - 06:30 PM IST',
    venue: 'CV Raman Hall',
    mode: 'In-Person',
    image: `${CLOUDINARY_BASE_URL}/v1782890669/orientation_fdo0yp.jpg`,
    url: '/timeline',
    description:
      'Orientation session for incoming student founders and innovators introducing incubation center facilities, Tinkering Lab access, and funding guidance.',
    highlights: [
      'Introduction to Incubation Center support pillars.',
      'Interactive Q&A with student coordinators and faculty mentors.',
      'Overview of prototype seed grants and lab hardware facilities.',
    ],
    speakers: [
      { name: 'Prof. Bharat Gupta', role: 'Professor-In-Charge, IC NITP' },
    ],
    eligibility: 'All NIT Patna students and aspiring student entrepreneurs.',
  },
  {
    id: 'pitchtember-2023',
    title: 'PitchTember 2023',
    tagline: 'Flagship National Startup Pitching Competition',
    category: 'Competition',
    status: 'Past',
    date: '24/11/2023 to 18/12/2023',
    startDate: '2023-11-24',
    endDate: '2023-12-18',
    time: '10:00 AM - 06:00 PM IST',
    venue: 'CV Raman Hall',
    mode: 'Hybrid',
    image: `${CLOUDINARY_BASE_URL}/v1782890669/pitchtember_ax6djs.jpg`,
    url: pitchtember_url,
    description:
      'The annual flagship startup pitching event at NIT Patna bringing together promising early-stage founders, angel investor panels, and enterprise mentors.',
    highlights: [
      'National startup pitch presentations before investor panel.',
      'Incubation seed support and mentorship awards.',
      'Keynotes on fundraising strategy and MVP validation.',
    ],
    speakers: [
      { name: 'Antesh Anand', role: 'Founder, Brand Medix' },
    ],
    eligibility: 'Open to student founders and early-stage startup teams.',
  },
  {
    id: 'stock-market-simulation-2024',
    title: 'Stock Market Simulation',
    tagline: 'Real-Time Financial Markets & Investment Challenge',
    category: 'Competition',
    status: 'Past',
    date: '09/02/2024',
    startDate: '2024-02-09',
    endDate: null,
    time: '02:00 PM - 06:00 PM IST',
    venue: 'Online',
    mode: 'Online',
    image: `${CLOUDINARY_BASE_URL}/v1782890671/sms_a5537x.jpg`,
    url: '/timeline',
    description:
      'An interactive online virtual trading challenge giving participants hands-on experience in portfolio management, risk evaluation, and equity analysis.',
    highlights: [
      'Real-time virtual stock market simulation environment.',
      'Cash prizes and certificates for top performing portfolio managers.',
      'Expert session on equity valuation and risk management.',
    ],
    speakers: [
      { name: 'Dr. Amitesh Kumar', role: 'Faculty Advisor' },
    ],
    eligibility: 'Open to all students interested in finance, trading, and markets.',
  },
];
