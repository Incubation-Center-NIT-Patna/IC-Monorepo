/**
 * Main Website Content Management Service (CMS)
 * 
 * Manages full CRUD operations with LocalStorage persistence and initial fallback datasets.
 */

const STORAGE_PREFIX = 'ic_cms_';

// Initial default seed datasets
const SEED_DATA = {
  notices: [
    {
      id: 'ntc-1',
      title: 'Call for Incubation - Batch 2026 Seed Cohort Applications Open',
      tag: 'Incubation',
      date: '2026-08-10',
      active: true,
      priority: 'High',
      link: 'https://incubationcenter.nitp.ac.in',
      description: 'Inviting deep-tech, IoT, and clean energy student and alumni startups for seed grants up to 10 Lakhs.',
    },
    {
      id: 'ntc-2',
      title: 'Pitchtember 2026 Annual Startup Showcase & Angel Pitch Day',
      tag: 'Event',
      date: '2026-09-20',
      active: true,
      priority: 'High',
      link: '#',
      description: 'Annual flagship pitching competition with 25+ venture capitalists and angel networks attending.',
    },
    {
      id: 'ntc-3',
      title: 'Intellectual Property & Patent Grant Workshop by Faculty Mentors',
      tag: 'Workshop',
      date: '2026-08-25',
      active: true,
      priority: 'Medium',
      link: '#',
      description: 'Hands-on patent filing and prior art search workshop for engineering innovators.',
    },
  ],
  leadership: [
    {
      id: 'director',
      role: 'Director, NIT Patna',
      name: 'Prof. Pradip K. Ray',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901704/director_yasexw.jpg',
      accentColor: '#0ef',
      link: 'https://www.linkedin.com/in/pradip-k-ray-nitp/',
      message: 'Innovation and entrepreneurship are the true cornerstones of national technological growth. At NIT Patna, the Incubation Center stands committed to empowering young creative minds with the knowledge, resources, and institutional support required to build impactful technological solutions for the nation and beyond.',
    },
    {
      id: 'pic',
      role: 'Professor-In-Charge, Incubation Center',
      name: 'Prof. Bharat Gupta',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_bharat_gupta_ubqzlo.jpg',
      accentColor: '#e11d48',
      link: 'https://www.linkedin.com/in/bharatgupta-nitp/',
      message: 'Our vision at the Incubation Center is to bridge academia and industry by nurturing deep-tech ventures, fostering interdisciplinary startup collaborations, and mentoring student innovators to transform groundbreaking ideas into sustainable businesses that drive real societal value.',
    },
  ],
  incubations: [
    {
      id: 'inc-1',
      name: 'Shekhar Telesystems',
      founder: 'Alok Shekhar',
      sector: 'Telecommunications & Embedded IoT',
      status: 'Incubated',
      funding: 'Seed Grant (₹10 Lakhs)',
      website: 'https://shekhartelesystems.com',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890649/shekhartele_nuuffg.png',
      description: 'Pioneering rural wireless telemetry systems and low-power IoT transceivers for smart agricultural monitoring.',
    },
    {
      id: 'inc-2',
      name: 'Busy Mechanic',
      founder: 'Ravi Verma',
      sector: 'Automotive On-Demand Services',
      status: 'Graduated',
      funding: 'Series Pre-A',
      website: 'https://busymechanic.in',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890648/busymech_r5chgu.png',
      description: 'Real-time on-demand doorstep vehicle repair and certified roadside diagnostics network across East India.',
    },
    {
      id: 'inc-3',
      name: 'Vendospot Smart Solutions',
      founder: 'Pooja Agarwal',
      sector: 'Smart Retail & IoT Hardware',
      status: 'Incubated',
      funding: 'Seed Stage',
      website: 'https://vendospot.com',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890649/onibus_eqijau.png',
      description: 'Automated contactless dispensing kiosks with integrated UPI telemetry and temperature-controlled lockers.',
    },
  ],
  events: [
    {
      id: 'evt-1',
      title: 'Pitchtember 2026: Eastern India Startup Conclave',
      category: 'Flagship Event',
      date: '2026-09-18',
      time: '10:00 AM - 5:00 PM',
      venue: 'Main Auditorium, NIT Patna',
      status: 'Upcoming',
      registrationLink: 'https://incubationcenter.nitp.ac.in/events/pitchtember',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890669/pitchtember_ax6djs.jpg',
      description: 'The biggest entrepreneurship festival bringing 40+ angels, institutional mentors, and founders under one roof.',
    },
    {
      id: 'evt-2',
      title: 'Hack-Incubate 48-Hour Deep Tech Sprint',
      category: 'Hackathon',
      date: '2026-10-05',
      time: '48 Hours Continuous',
      venue: 'Incubation Prototyping Lab',
      status: 'Upcoming',
      registrationLink: '#',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890669/orientation_fdo0yp.jpg',
      description: 'Rapid prototyping hackathon on renewable energy grids, smart sensors, and AI healthcare tools.',
    },
  ],
  team: [
    // Faculty Mentors
    {
      id: 'fac-head-1',
      name: 'Prof. Bharat Gupta',
      category: 'faculty',
      post: 'Professor-In-Charge',
      email: 'bharat@nitp.ac.in',
      department: 'Electronics & Communication Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_bharat_gupta_ubqzlo.jpg',
      about: 'Merging future tech with purposeful leadership—pioneering advances in IoT, AI, and communication to empower innovation. Shaping ecosystems where technology meets entrepreneurship.',
    },
    {
      id: 'fac-mentor-1',
      name: 'Dr. Amitesh Kumar',
      category: 'faculty',
      post: 'Faculty Mentor',
      email: 'amitesh.ee@nitp.ac.in',
      department: 'Electrical Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901329/dr_amitesh_kumar_nr3s4s.png',
      about: 'Driving innovation in sustainable technology — Dr. Amitesh Kumar blends renewable energy, electric vehicles, and advanced semiconductor research to power the future.',
    },
    {
      id: 'fac-mentor-2',
      name: 'Dr. Devarani Devi Ningombam',
      category: 'faculty',
      post: 'Faculty Mentor',
      email: 'devrani.cs@nitp.ac.in',
      department: 'Computer Science & Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901327/dr_devrani_lc6crh.jpg',
      about: 'Advancing intelligence with purpose — exploring Artificial Intelligence, Machine Learning, Optimization Algorithms, and Deep Learning to revolutionize Biomedical Engineering.',
    },
    {
      id: 'fac-mentor-3',
      name: 'Dr. Om Ji Shukla',
      category: 'faculty',
      post: 'Faculty Mentor',
      email: 'omjishukla.me@nitp.ac.in',
      department: 'Mechanical Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901327/dr_omji_shukla_xejduf.jpg',
      about: 'Empowering intelligent systems for smarter industries — integrating Agent-Based Modeling, Multi-Agent Systems, and AI-driven manufacturing with advanced Operations Research.',
    },
    {
      id: 'fac-mentor-4',
      name: 'Prof. Arunangshu Ghosh',
      category: 'faculty',
      post: 'Faculty Mentor',
      email: 'arunangshu.ghosh@nitp.ac.in',
      department: 'Electronics & Communication Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_ghosh_wkm0nd.jpg',
      about: 'Driving innovation at the intersection of bio-inspired electronics and intelligent sensing — transforming the future with advancements in machine olfaction and smart sensing.',
    },
    {
      id: 'fac-mentor-5',
      name: 'Dr. Rakesh Ranjan',
      category: 'faculty',
      post: 'Faculty Mentor',
      email: 'rr@nitp.ac.in',
      department: 'Electronics & Communication Engineering',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901327/dr_rakesh_ranjan_zblmx7.jpg',
      about: 'Shaping the future of connectivity — advancing Wireless Communications, IoT, Optical Technologies, and Photonics to build smarter and more resilient systems.',
    },

    // Student Team & Coordinators
    {
      id: 'std-coord-1',
      name: 'Himanshu Bharti',
      category: 'student',
      post: 'Student Co-ordinator',
      email: 'himanshu.ic@nitp.ac.in',
      department: 'Executive Student Body',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901449/himanshu_bharti_tepyp3.jpg',
      about: 'Leading from the front with clarity and confidence—turning vision into action, aligning every step with purpose, and ensuring that even the smallest detail reflects dedication and passion.',
    },
    {
      id: 'std-coord-2',
      name: 'Sameer Gupta',
      category: 'student',
      post: 'Student Co-ordinator',
      email: 'sameer.ic@nitp.ac.in',
      department: 'Executive Student Body',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901453/sameer_gupta_pwg1mi.jpg',
      about: 'Balancing leadership and teamwork with ease — orchestrating every move behind the scenes to keep the show running smoothly and the spirit alive.',
    },
    {
      id: 'std-coord-3',
      name: 'Arpita Dwivedi',
      category: 'student',
      post: 'Student Co-ordinator',
      email: 'arpita.ic@nitp.ac.in',
      department: 'Executive Student Body',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901447/arpita_dwivedi_zyvifw.jpg',
      about: 'Blending grace with grit, handling every challenge with a smile — ensuring every plan unfolds perfectly, no matter what comes her way.',
    },
    {
      id: 'std-sec-1',
      name: 'Ashish Yadav',
      category: 'student',
      post: 'Secretary',
      email: 'ashish.sec@nitp.ac.in',
      department: 'Incubation Executive Body',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901448/ashish_yadav_yabczj.jpg',
      about: 'Officially Secretary of NITP Incubation Centre! UI/UX enthusiast crafting human-centered digital experiences.',
    },
    {
      id: 'std-web-1',
      name: 'Abhishek Keshri',
      category: 'student',
      post: 'Web Team Co-Lead',
      email: 'abhishek.web@nitp.ac.in',
      department: 'Web Development Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901445/abhishek_keshri_yuimey.jpg',
      about: 'Merging logic with creativity, building digital foundations turning code into seamless user experiences.',
    },
    {
      id: 'std-web-2',
      name: 'Manikanta',
      category: 'student',
      post: 'Web Team Committee Co-ordinator',
      email: 'manikanta.web@nitp.ac.in',
      department: 'Web Development Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901450/manikanta_swvndr.jpg',
      about: 'Building seamless digital experiences with precision and passion, ensuring every click leads to clarity and connection.',
    },
    {
      id: 'std-des-1',
      name: 'Sumit Vishwakarma',
      category: 'student',
      post: 'Design Team Committee Co-ordinator',
      email: 'sumit.design@nitp.ac.in',
      department: 'Design & Media Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901456/sumit_vishwakarma_d59que.jpg',
      about: 'Blending creativity with strategy, shaping narratives that inform, inspire, and elevate every message with clarity.',
    },
    {
      id: 'std-cnt-1',
      name: 'Manya Chandra',
      category: 'student',
      post: 'Content Team Committee Co-Coordinator',
      email: 'manya.content@nitp.ac.in',
      department: 'Content & Editorial Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901451/manya_chandra_hz1nlt.jpg',
      about: 'Weaving words into impact — curating content that speaks volumes and brings every idea to life with purpose.',
    },
    {
      id: 'std-med-1',
      name: 'Aarsi Kumari',
      category: 'student',
      post: 'Media Team Committee Co-ordinator',
      email: 'aarsi.media@nitp.ac.in',
      department: 'Media & Branding Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901444/aarsi_kumari_b0bc0i.jpg',
      about: 'Shaping narratives through visuals, leading with intent, and ensuring our media speaks louder than words.',
    },
    {
      id: 'std-tech-1',
      name: 'Anusha Tank',
      category: 'student',
      post: 'Technical Team Committee Co-ordinator',
      email: 'anusha.tech@nitp.ac.in',
      department: 'Technical Prototyping Committee',
      image: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901447/anusha_tank_dhibly.jpg',
      about: 'Calm yet vibrant, tackling challenges with logic, patience, and poise — uplifting her team with focus and reliability.',
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      title: 'Annual Pitchtember Demo Day Stage',
      category: 'Events',
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60',
      date: '2025-09-20',
    },
    {
      id: 'gal-2',
      title: 'IoT & Prototyping Hardware Lab',
      category: 'Labs',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60',
      date: '2025-11-12',
    },
    {
      id: 'gal-3',
      title: 'Mentor Interaction & Idea Validation Cohort',
      category: 'Mentorship',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
      date: '2026-01-15',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'Who is eligible to apply for incubation at NIT Patna?',
      category: 'Eligibility',
      answer: 'Any student, research scholar, alumnus of NIT Patna or regional innovator with an innovative scalable prototype or idea can apply.',
    },
    {
      id: 'faq-2',
      question: 'What financial support and seed grants are provided?',
      category: 'Funding',
      answer: 'We provide pre-seed and seed funding support ranging from ₹2.5 Lakhs up to ₹10 Lakhs under state and central startup grant schemes.',
    },
    {
      id: 'faq-3',
      question: 'Does the Incubation Center provide patenting and IP support?',
      category: 'IP Support',
      answer: 'Yes, our designated IP cell assists in patent filing, trademark registration, and legal mentorship free of cost for incubated teams.',
    },
  ],
  talks: [
    {
      id: 'tlk-1',
      name: 'Antesh Anand',
      role: 'Founder, Brand Medix',
      photo: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890580/aa_lnsosp.jpg',
      content: 'Antesh Anand, founder of Brand Medix, innovates healthcare brand management and marketing strategies, reshaping audience connections and fostering sector growth through pioneering solutions.',
    },
    {
      id: 'tlk-2',
      name: 'Puja',
      role: 'Founder, Artkala',
      photo: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890581/puja_o9rzhz.jpg',
      content: 'Puja, founder of Artkala, has built a creative haven renowned for innovative art and craft tutorials. Her engaging content fosters a global community of DIY enthusiasts.',
    },
    {
      id: 'tlk-3',
      name: 'Rahul Samrat',
      role: 'CEO, CoWorking Studio',
      photo: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890581/rahul_zobher.jpg',
      content: 'Rahul Samrat, CEO of Coworking Studio, leads with innovation in flexible workspaces. His strategic direction emphasizes community, collaboration, and productivity enhancements.',
    },
    {
      id: 'tlk-4',
      name: 'Alok Kumar',
      role: 'Founder, NativeClap',
      photo: 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890581/alok_s5ag1j.jpg',
      content: 'Alok Kumar, founder of Native Clap, champions indigenous culture through a platform showcasing traditional craftsmanship and supporting local artisans.',
    },
  ],
  queries: [
    {
      id: 'qry-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      phone: '+91 98765 43210',
      domain: 'Agritech & AI Telemetry',
      stage: 'Prototype Stage',
      message: 'We have built an automated soil moisture and micro-climate IoT node and would like to apply for seed funding and prototyping space at NIT Patna IC.',
      submittedAt: '2026-08-20',
      status: 'New',
    },
    {
      id: 'qry-2',
      name: 'Priya Verma',
      email: 'priya.v@techspire.in',
      phone: '+91 91234 56789',
      domain: 'EV Charging Infrastructure',
      stage: 'Active Startup',
      message: 'Looking for technical mentorship on solar-powered smart EV battery swapping stations and Bihar startup grant guidance.',
      submittedAt: '2026-08-18',
      status: 'Contacted',
    },
    {
      id: 'qry-3',
      name: 'Vikram Singh',
      email: 'vikram@cleanwater.org',
      phone: '+91 94567 89012',
      domain: 'Clean Water & Filtration',
      stage: 'Concept',
      message: 'Our team is developing low-cost nanofiltration cartridges for rural flood prone zones in Bihar. Requesting incubation guidelines.',
      submittedAt: '2026-08-12',
      status: 'Reviewed',
    },
  ],
  about: {
    campusImage: 'https://images.collegedunia.com/public/college_data/images/campusimage/1611227237IMG_20201103_111253.jpg',
    galleryImages: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60',
    ],
    aboutHtml: `<p class="leading-relaxed">The Incubation Centre at the National Institute of Technology Patna is a vital hub for nurturing startups from inception to success. Equipped with tailored resources like office spaces, mentorship programs, and networking opportunities, we foster an environment conducive to growth and innovation. Our primary aim is to support early-stage startups by providing essential resources and guidance to accelerate their growth trajectory and minimize failure rates. We actively promote economic development, entrepreneurship, and the commercialization of research and innovation within the region by facilitating access to funding, mentorship, and networks.</p>
<ul class="space-y-3 mt-4 text-white/85 list-disc pl-5">
  <li><strong>Provide aspiring entrepreneurs</strong> with essential resources and networking opportunities through initiatives like mentorship programs, funding avenues, and networking events to help startups overcome challenges and thrive.</li>
  <li><strong>Highlight notable successes</strong> like Shekhar Telesystems, Busy Mechanic, and Vendospot, demonstrating our support's effectiveness and inspiring future generations of entrepreneurs.</li>
  <li><strong>Foster innovation and resilience</strong> within the NIT Patna community, creating a supportive ecosystem where startups can flourish and significantly contribute to society and the economy.</li>
</ul>`,
    visionPillars: [
      {
        id: 'nurture',
        step: '01',
        title: 'Nurture Entrepreneurship',
        tagline: 'Empowering Passionate Creators',
        description: 'To nurture entrepreneurship in those people who have a passion for creating something of their own which can benefit the society.',
      },
      {
        id: 'ecosystem',
        step: '02',
        title: 'Creating an Ecosystem',
        tagline: 'Driving Innovation & Problem-Solving',
        description: 'Creating an ecosystem in which people can get out of their comfort zone and work on new ideas, technology to solve existing problems.',
      },
      {
        id: 'bihar',
        step: '03',
        title: 'Help Bihar',
        tagline: 'Statewide Economic Transformation',
        description: 'Make Bihar a hub of entrepreneurship and entrepreneurs.',
      },
    ],
    supportSlides: [
      {
        id: 'mentorship',
        name: 'Mentorship',
        title: 'Guiding your vision to reality.',
        desc: 'Provides expert advice and guidance to entrepreneurs, helping them refine their business models and strategies.',
        btnText: 'Explore',
        link: '/team/faculty',
        img: 'https://kstatic.googleusercontent.com/files/9e0a5271a603f3c7c5022d2f2acc9605c9082f5cb8595ba13edbf307a869dfa5fb070f9e46719dea3f97fd12c50e07cfa154b6b61222a74af5d13ae779a770c8',
      },
      {
        id: 'funding',
        name: 'Funding',
        title: 'Fueling your dreams with capital.',
        desc: "Offers access to financial resources such as investments, grants, and venture capital to support the startup's growth.",
        btnText: 'Find tools',
        link: '#idea',
        img: 'https://kstatic.googleusercontent.com/files/20f7204c32c94a37bd3dd5495862d00b72e2b7fb5f0093313c607ef04f9fb33d48bdcca6efd58e3de3ad4e3f542f2fde4c36328dffb5ffc457bc090eb451cfa8',
      },
      {
        id: 'networking',
        name: 'Networking',
        title: 'Connecting you to endless possibilities.',
        desc: 'Facilitates connections with industry professionals, potential clients, partners, and investors, expanding business opportunities.',
        btnText: 'Learn',
        link: '#talks',
        img: 'https://kstatic.googleusercontent.com/files/cfcd5e259075efc8dd70bfc736c72c8a171ad394670f015ba24c19eaef85ab0dfa1bd34bbf8e55f130ec22adda82ff5a4200ac46e64f368fffc07eddc2d93cf4',
      },
      {
        id: 'workspace',
        name: 'Workspace',
        title: 'Empowering growth with the perfect space.',
        desc: 'Provides physical office space, equipment, and infrastructure at reduced costs, allowing startups to operate efficiently.',
        btnText: 'Learn more',
        link: 'https://tinkering-lab.onrender.com',
        img: 'https://kstatic.googleusercontent.com/files/acd18ca25e2b117831e384bb00d5a16b7a560253f99c51fd4299074656d2317c27693ba5837b95151143a3cf3d940a7cddec4593b6942ae3f67954a97383f0e5',
      },
    ],
  },
};

function sanitizeData(data) {
  if (!data) return data;
  const str = JSON.stringify(data);
  if (str.includes('dclhpeiw0')) {
    return JSON.parse(str.replaceAll('dclhpeiw0', 'ddb6lsyht'));
  }
  return data;
}

function getStorage(key) {
  if (typeof window === 'undefined') return SEED_DATA[key] || [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(SEED_DATA[key] || []));
      return SEED_DATA[key] || [];
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeData(parsed);
    if (JSON.stringify(sanitized) !== raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (e) {
    console.warn('Storage read error', e);
    return SEED_DATA[key] || [];
  }
}

function setStorage(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write error', e);
  }
}

export const ContentService = {
  // Generic section helpers
  getItems: (section) => getStorage(section),

  getAboutSection: () => getStorage('about'),

  saveAboutSection: (aboutData) => {
    setStorage('about', aboutData);
    return aboutData;
  },
  
  addItem: (section, item) => {
    const items = getStorage(section);
    const newItem = {
      ...item,
      id: `${section.slice(0, 3)}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    setStorage(section, updated);
    return newItem;
  },

  updateItem: (section, id, updatedFields) => {
    const items = getStorage(section);
    const updated = items.map((itm) => (itm.id === id ? { ...itm, ...updatedFields } : itm));
    setStorage(section, updated);
    return updated.find((itm) => itm.id === id);
  },

  deleteItem: (section, id) => {
    const items = getStorage(section);
    const filtered = items.filter((itm) => itm.id !== id);
    setStorage(section, filtered);
    return filtered;
  },

  getStats: () => {
    const notices = getStorage('notices');
    const incubations = getStorage('incubations');
    const events = getStorage('events');
    const team = getStorage('team');
    const queries = getStorage('queries');
    return {
      activeNotices: notices.filter((n) => n.active).length,
      totalIncubations: incubations.length,
      graduatedStartups: incubations.filter((i) => i.status === 'Graduated').length,
      upcomingEvents: events.filter((e) => e.status === 'Upcoming').length,
      totalMentors: team.filter((t) => t.category === 'faculty').length,
      totalStudents: team.filter((t) => t.category === 'student').length,
      pendingQueries: queries.filter((q) => q.status === 'New').length,
    };
  },
};

