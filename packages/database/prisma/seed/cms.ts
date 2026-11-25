import type { PrismaClient } from "../../generated/prisma";

export async function seedCms(prisma: PrismaClient) {
  console.log("\n📦 Seeding Main Website CMS, Categories, and Settings (Minimal 1-2 records per section)...");

  // 1. Notices (2 records)
  const defaultNotices = [
    {
      id: "ntc-1",
      title: "Call for Incubation - Batch 2026 Seed Cohort Applications Open",
      tag: "Incubation",
      date: "2026-08-10",
      active: true,
      priority: "High",
      link: "https://incubationcenter.nitp.ac.in",
      description: "Inviting deep-tech, IoT, and clean energy student and alumni startups for seed grants up to 10 Lakhs.",
    },
    {
      id: "ntc-2",
      title: "Pitchtember 2026 Annual Startup Showcase & Angel Pitch Day",
      tag: "Event",
      date: "2026-09-20",
      active: true,
      priority: "High",
      link: "#",
      description: "Annual flagship pitching competition with 25+ venture capitalists and angel networks attending.",
    },
  ];

  for (const n of defaultNotices) {
    await prisma.cmsNotice.upsert({
      where: { id: n.id },
      update: n,
      create: n,
    });
  }

  // 2. Incubations / Startups (2 records: 1 Incubated, 1 Graduated)
  const defaultIncubations = [
    {
      id: "inc-1",
      name: "Shekhar Telesystems",
      founder: "Alok Shekhar",
      sector: "Telecommunications & Embedded IoT",
      status: "Incubated",
      funding: "Seed Grant (₹10 Lakhs)",
      website: "https://shekhartelesystems.com",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890649/shekhartele_nuuffg.png",
      description: "Pioneering rural wireless telemetry systems and low-power IoT transceivers for smart agricultural monitoring.",
      order: 1,
    },
    {
      id: "inc-2",
      name: "Busy Mechanic",
      founder: "Ravi Verma",
      sector: "Automotive On-Demand Services",
      status: "Graduated",
      funding: "Series Pre-A",
      website: "https://busymechanic.in",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890648/busymech_r5chgu.png",
      description: "Real-time on-demand doorstep vehicle repair and certified roadside diagnostics network across East India.",
      order: 2,
    },
  ];

  for (const inc of defaultIncubations) {
    await prisma.cmsIncubation.upsert({
      where: { id: inc.id },
      update: inc,
      create: inc,
    });
  }

  // 4. CMS Events (2 records)
  const defaultEvents = [
    {
      id: "evt-1",
      title: "Pitchtember 2026: Eastern India Startup Conclave",
      category: "Flagship Event",
      date: "2026-09-18",
      time: "10:00 AM - 5:00 PM",
      venue: "Main Auditorium, NIT Patna",
      status: "Upcoming",
      registrationLink: "https://incubationcenter.nitp.ac.in/events/pitchtember",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890669/pitchtember_ax6djs.jpg",
      description: "The biggest entrepreneurship festival bringing 40+ angels, institutional mentors, and founders under one roof.",
    },
    {
      id: "evt-2",
      title: "Hack-Incubate 48-Hour Deep Tech Sprint",
      category: "Hackathon",
      date: "2026-10-05",
      time: "48 Hours Continuous",
      venue: "Incubation Prototyping Lab",
      status: "Upcoming",
      registrationLink: "#",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890669/orientation_fdo0yp.jpg",
      description: "Rapid prototyping hackathon on renewable energy grids, smart sensors, and AI healthcare tools.",
    },
  ];

  for (const ev of defaultEvents) {
    await prisma.cmsEvent.upsert({
      where: { id: ev.id },
      update: ev,
      create: ev,
    });
  }

  // 5. Team Members (2 records: 1 Faculty, 1 Student Coordinator)
  const defaultTeam = [
    {
      id: "fac-head-1",
      name: "Prof. Bharat Gupta",
      category: "faculty",
      post: "Professor-In-Charge",
      email: "bharat@nitp.ac.in",
      department: "Electronics & Communication Engineering",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_bharat_gupta_ubqzlo.jpg",
      about: "Merging future tech with purposeful leadership—pioneering advances in IoT, AI, and communication to empower innovation. Shaping ecosystems where technology meets entrepreneurship.",
      order: 1,
    },
    {
      id: "std-coord-1",
      name: "Himanshu Bharti",
      category: "student",
      post: "Student Co-ordinator",
      email: "himanshu.ic@nitp.ac.in",
      department: "Executive Student Body",
      image: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901449/himanshu_bharti_tepyp3.jpg",
      about: "Leading from the front with clarity and confidence—turning vision into action, aligning every step with purpose.",
      order: 2,
    },
  ];

  for (const tm of defaultTeam) {
    await prisma.cmsTeamMember.upsert({
      where: { id: tm.id },
      update: tm,
      create: tm,
    });
  }

  // 6. Gallery (2 records)
  const defaultGallery = [
    {
      id: "gal-1",
      title: "Annual Pitchtember Demo Day Stage",
      category: "Events",
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60",
      date: "2025-09-20",
    },
    {
      id: "gal-2",
      title: "IoT & Prototyping Hardware Lab",
      category: "Labs",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
      date: "2025-11-12",
    },
  ];

  for (const g of defaultGallery) {
    await prisma.cmsGalleryItem.upsert({
      where: { id: g.id },
      update: g,
      create: g,
    });
  }

  // 7. FAQs (2 records)
  const defaultFaqs = [
    {
      id: "faq-1",
      question: "Who is eligible to apply for incubation at NIT Patna?",
      category: "Eligibility",
      answer: "Any student, research scholar, alumnus of NIT Patna or regional innovator with an innovative scalable prototype or idea can apply.",
      order: 1,
    },
    {
      id: "faq-2",
      question: "What financial support and seed grants are provided?",
      category: "Funding",
      answer: "We provide pre-seed and seed funding support ranging from ₹2.5 Lakhs up to ₹10 Lakhs under state and central startup grant schemes.",
      order: 2,
    },
  ];

  for (const f of defaultFaqs) {
    await prisma.cmsFaq.upsert({
      where: { id: f.id },
      update: f,
      create: f,
    });
  }

  // 8. Talks (2 records)
  const defaultTalks = [
    {
      id: "tlk-1",
      name: "Antesh Anand",
      role: "Founder, Brand Medix",
      photo: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890580/aa_lnsosp.jpg",
      content: "Antesh Anand, founder of Brand Medix, innovates healthcare brand management and marketing strategies, reshaping audience connections and fostering sector growth through pioneering solutions.",
      order: 1,
    },
    {
      id: "tlk-2",
      name: "Puja",
      role: "Founder, Artkala",
      photo: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782890581/puja_o9rzhz.jpg",
      content: "Puja, founder of Artkala, has built a creative haven renowned for innovative art and craft tutorials. Her engaging content fosters a global community of DIY enthusiasts.",
      order: 2,
    },
  ];

  for (const t of defaultTalks) {
    await prisma.cmsTalk.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // 9. Public Inquiries / Queries (2 records)
  const defaultQueries = [
    {
      id: "qry-1",
      name: "Aarav Sharma",
      email: "aarav.sharma@gmail.com",
      phone: "+91 98765 43210",
      domain: "Agritech & AI Telemetry",
      stage: "Prototype Stage",
      message: "We have built an automated soil moisture and micro-climate IoT node and would like to apply for seed funding and prototyping space at NIT Patna IC.",
      status: "New",
    },
    {
      id: "qry-2",
      name: "Priya Verma",
      email: "priya.v@techspire.in",
      phone: "+91 91234 56789",
      domain: "EV Charging Infrastructure",
      stage: "Active Startup",
      message: "Looking for technical mentorship on solar-powered smart EV battery swapping stations and Bihar startup grant guidance.",
      status: "Contacted",
    },
  ];

  for (const q of defaultQueries) {
    await prisma.cmsQuery.upsert({
      where: { id: q.id },
      update: q,
      create: q,
    });
  }

  // 10. Dynamic Categories (2 per module)
  const defaultCategories: Record<string, string[]> = {
    events: ["Flagship Event", "Hackathon"],
    notices: ["Incubation", "Event"],
    incubations: ["CleanTech", "EdTech"],
    gallery: ["Events", "Labs"],
    faqs: ["Eligibility", "Funding"],
    team: ["faculty", "student"],
  };

  for (const [moduleName, cats] of Object.entries(defaultCategories)) {
    for (const catName of cats) {
      await prisma.cmsCategory.upsert({
        where: {
          module_name: {
            module: moduleName,
            name: catName,
          },
        },
        update: {},
        create: {
          module: moduleName,
          name: catName,
        },
      });
    }
  }

  // 12. System Settings (2 records: Privacy & Scoring Scale)
  await prisma.systemSetting.upsert({
    where: { key: "privacy_settings" },
    update: {},
    create: {
      key: "privacy_settings",
      category: "privacy",
      value: [
        { id: "eval_scores", label: "Mask candidate evaluation raw scores from other evaluators until round concludes", enabled: true },
        { id: "auto_sync", label: "Automatically sync qualified candidates with main website member directory", enabled: true },
      ],
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "scoring_scale" },
    update: {},
    create: {
      key: "scoring_scale",
      category: "scoring",
      value: {
        scale: "1-5",
        shortlistThreshold: 75,
        selectionThreshold: 85,
      },
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "evaluation_parameters" },
    update: {},
    create: {
      key: "evaluation_parameters",
      category: "evaluation",
      value: [
        { id: "tech", name: "Technical Proficiency", weight: 40 },
        { id: "prob", name: "Problem Solving & Logic", weight: 35 },
        { id: "comm", name: "Communication Skills", weight: 25 },
      ],
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "feedback_tags" },
    update: {},
    create: {
      key: "feedback_tags",
      category: "evaluation",
      value: [
        "Quick Learner",
        "Strong Problem Solving",
        "Great Communication",
      ],
    },
  });

  // 13. System Activity Logs (2 records, only seed if empty)
  const existingLogCount = await prisma.systemActivityLog.count();
  if (existingLogCount === 0) {
    const seedActivities = [
      {
        userName: "Prof. Bharat Gupta",
        userRole: "Super Admin",
        action: "Graded candidate Aarav Sharma with final score 88/100",
        category: "Evaluation",
        status: "Completed",
      },
      {
        userName: "Himanshu Bharti",
        userRole: "Admin",
        action: "Published new notice: Pitchtember 2026 Conclave",
        category: "Notices",
        status: "Published",
      },
    ];

    for (const act of seedActivities) {
      await prisma.systemActivityLog.create({
        data: act,
      });
    }
  }

  console.log("✅ CMS, Categories, Settings, and Activity Logs seeded (1-2 records per section).");
}
