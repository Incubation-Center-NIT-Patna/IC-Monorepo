/**
 * Main Website Content Management Service (CMS)
 * 
 * Powered by centralized Fastify API with PostgreSQL persistence.
 */
import apiClient from '@/lib/api';

export const ContentService = {
  // Generic section helpers
  getItems: async (section, query = {}) => {
    try {
      const res = await apiClient.get(`/cms/${section}`, { params: query });
      return res.items || [];
    } catch (err) {
      console.error(`Failed to fetch ${section} from API:`, err);
      return [];
    }
  },

  getItemById: async (section, id) => {
    try {
      const res = await apiClient.get(`/cms/${section}/${id}`);
      return res.item || null;
    } catch (err) {
      console.error(`Failed to fetch ${section} item ${id} from API:`, err);
      return null;
    }
  },

  addItem: async (section, item) => {
    const res = await apiClient.post(`/cms/${section}`, item);
    return res.item || res;
  },

  updateItem: async (section, id, updatedFields) => {
    const res = await apiClient.put(`/cms/${section}/${id}`, updatedFields);
    return res.item || res;
  },

  deleteItem: async (section, id) => {
    const res = await apiClient.delete(`/cms/${section}/${id}`);
    return res;
  },

  // Statistics
  getStats: async () => {
    try {
      const res = await apiClient.get('/cms/stats');
      return res;
    } catch (err) {
      console.error('Failed to fetch CMS stats from API:', err);
      return {
        activeNotices: 0,
        totalIncubations: 0,
        graduatedStartups: 0,
        upcomingEvents: 0,
        totalMentors: 0,
        totalStudents: 0,
        pendingQueries: 0,
      };
    }
  },
};

export default ContentService;
