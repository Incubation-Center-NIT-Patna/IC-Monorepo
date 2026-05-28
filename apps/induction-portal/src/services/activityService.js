

// Mock Central Database Table
export const MASTER_DATABASE_LOGS = [
  {
    id: "1",
    user: "Alex Rivera",
    category: "evaluation-made",
    timestamp: "2026-05-28T12:30:00Z" 
  },
  {
    id: "2",
    user: "Sakshi",
    category: "query-made",
    timestamp: "2026-05-26T10:00:00Z" 
  },
  {
    id: "3",
    user: "Ayush",
    category: "settings-updated",
    timestamp: "2026-05-26T10:00:00Z" 
  },
  {
    id: "4",
    user: "Shweta",
    category: "task-submitted",
    timestamp: "2026-05-26T10:00:00Z" 
  }
];


export async function getRecentActivitiesPreview() {
  return MASTER_DATABASE_LOGS.slice(0, 3); // Delivers just the top 3 items
}


export async function getAllActivities() {
  return MASTER_DATABASE_LOGS; // Returns the full array
}