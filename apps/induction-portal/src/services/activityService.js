

// Mock Central Database Table
const MASTER_DATABASE_LOGS = [
  { id: 'db-row-01', user: 'Alex Rivera', category: 'evaluation-made', timeAgo: '2 mins ago' },
  { id: 'db-row-02', user: 'Ayush', category: 'query-made', timeAgo: '45 mins ago' },
  { id: 'db-row-03', user: 'Sakshi', category: 'task-submitted', timeAgo: '1 hour ago' },
  { id: 'db-row-04', user: 'Shweta', category: 'task-submitted', timeAgo: '3 hours ago' },
  { id: 'db-row-05', user: 'Nikhil', category: 'settings-updated', timeAgo: '5 hours ago' },
  { id: 'db-row-06', user: 'Ananya', category: 'query-made', timeAgo: '1 day ago' },
  { id: 'db-row-07', user: 'Rahul', category: 'evaluation-made', timeAgo: '2 days ago' }
];


export async function getRecentActivitiesPreview() {
  return MASTER_DATABASE_LOGS.slice(0, 3); // Delivers just the top 3 items
}


export async function getAllActivities() {
  return MASTER_DATABASE_LOGS; // Returns the full array
}