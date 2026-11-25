import apiClient from '@/lib/api';

export const ActivityService = {
  getActivities: async (params = {}) => {
    try {
      const res = await apiClient.get('/activity-logs', { params });
      return res.logs || [];
    } catch (err) {
      console.error('Failed to fetch activity logs from API:', err);
      return [];
    }
  },

  logActivity: async ({ user = 'Administrator', role = 'Admin', action, category = 'General', status = 'Completed' }) => {
    try {
      const res = await apiClient.post('/activity-logs', {
        action,
        category,
        status,
      });
      return res;
    } catch (err) {
      console.error('Failed to persist activity log to API:', err);
      return null;
    }
  },
};

export async function getAllActivities(params = { limit: 50 }) {
  try {
    const res = await apiClient.get('/activity-logs', { params });
    if (res && res.logs) {
      return res.logs;
    }
  } catch (err) {
    console.warn('Failed to fetch activity logs from API:', err);
  }
  return [];
}

export async function getRecentActivitiesPreview(limit = 4) {
  try {
    const res = await apiClient.get('/activity-logs', { params: { limit } });
    if (res && res.logs) {
      return res.logs.slice(0, limit);
    }
  } catch (err) {
    console.warn('Failed to fetch activity preview from API:', err);
  }
  return [];
}

export default ActivityService;
