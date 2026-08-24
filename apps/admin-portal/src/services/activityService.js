

const STORAGE_KEY = 'ic_activity_logs';

export const SEED_ACTIVITY_LOGS = [
  {
    id: "act-1",
    user: "Prof. Bharat Gupta",
    role: "Super Admin",
    action: "Graded candidate Aarav Sharma with final score 88/100",
    category: "Evaluation",
    type: "evaluation-made",
    timestamp: "2026-08-16T17:45:00Z",
    status: "Completed",
  },
  {
    id: "act-2",
    user: "Himanshu Bharti",
    role: "Admin",
    action: "Published new marquee notice: Pitchtember 2026 Conclave",
    category: "Notices",
    type: "cms-update",
    timestamp: "2026-08-16T16:20:00Z",
    status: "Published",
  },
  {
    id: "act-3",
    user: "Dr. Amitesh Kumar",
    role: "Reviewer",
    action: "Approved hardware prototyping rubric for Round 2",
    category: "Settings",
    type: "settings-updated",
    timestamp: "2026-08-16T14:10:00Z",
    status: "Approved",
  },
  {
    id: "act-4",
    user: "Super Admin",
    role: "Super Admin",
    action: "Updated startup venture details: Shekhar Telesystems",
    category: "Startups",
    type: "cms-update",
    timestamp: "2026-08-16T12:00:00Z",
    status: "Updated",
  },
  {
    id: "act-5",
    user: "Alex Rivera",
    role: "Reviewer",
    action: "Interviewed candidate Sneha Kumari for PR Management",
    category: "Evaluation",
    type: "evaluation-made",
    timestamp: "2026-08-15T18:30:00Z",
    status: "Completed",
  },
  {
    id: "act-6",
    user: "Himanshu Bharti",
    role: "Admin",
    action: "Added new event: AI & Deep-Tech Venture Workshop",
    category: "Events",
    type: "cms-update",
    timestamp: "2026-08-15T15:10:00Z",
    status: "Published",
  },
  {
    id: "act-7",
    user: "Super Admin",
    role: "Super Admin",
    action: "Created new reviewer account for Prof. Amitesh Kumar",
    category: "Users",
    type: "rbac-change",
    timestamp: "2026-08-15T11:45:00Z",
    status: "Created",
  },
  {
    id: "act-8",
    user: "Prof. Bharat Gupta",
    role: "Super Admin",
    action: "Adjusted parameter weightages for Technical Assessment",
    category: "Settings",
    type: "settings-updated",
    timestamp: "2026-08-14T16:00:00Z",
    status: "Saved",
  },
  {
    id: "act-9",
    user: "Himanshu Bharti",
    role: "Admin",
    action: "Uploaded new media photos from Incubation Lab Launch",
    category: "Gallery",
    type: "cms-update",
    timestamp: "2026-08-14T10:30:00Z",
    status: "Uploaded",
  },
  {
    id: "act-10",
    user: "Sakshi",
    role: "Member",
    action: "Answered candidate inquiry regarding Pitchtember registration",
    category: "FAQs",
    type: "query-made",
    timestamp: "2026-08-13T14:20:00Z",
    status: "Resolved",
  },
  {
    id: "act-11",
    user: "Dr. Amitesh Kumar",
    role: "Reviewer",
    action: "Recorded interview feedback for candidate Rohan Mehta",
    category: "Evaluation",
    type: "evaluation-made",
    timestamp: "2026-08-13T11:15:00Z",
    status: "Completed",
  },
  {
    id: "act-12",
    user: "Super Admin",
    role: "Super Admin",
    action: "Synchronized startup directory with external alumni portal",
    category: "Startups",
    type: "system-sync",
    timestamp: "2026-08-12T09:00:00Z",
    status: "Synced",
  },
];

export const ActivityService = {
  getActivities: () => {
    if (typeof window === 'undefined') return SEED_ACTIVITY_LOGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACTIVITY_LOGS));
      return SEED_ACTIVITY_LOGS;
    } catch {
      return SEED_ACTIVITY_LOGS;
    }
  },

  logActivity: ({ user = 'Administrator', role = 'Admin', action, category = 'General', status = 'Completed' }) => {
    const currentLogs = ActivityService.getActivities();
    const newLog = {
      id: `act-${Date.now()}`,
      user,
      role,
      action,
      category,
      type: 'user-action',
      timestamp: new Date().toISOString(),
      status,
    };
    const updated = [newLog, ...currentLogs];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newLog;
  },
};

export async function getAllActivities() {
  return ActivityService.getActivities();
}

export async function getRecentActivitiesPreview(limit = 4) {
  const activities = ActivityService.getActivities();
  return activities.slice(0, limit);
}