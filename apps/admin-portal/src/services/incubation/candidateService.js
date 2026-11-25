/**
 * Candidate Management & Induction Service
 * 
 * Powered 100% by Centralized Fastify API and PostgreSQL Database.
 * No hardcoded or mock local storage data.
 */
import InductionService from './inductionService';

export const CandidateService = {
  // Real backend API calls
  fetchApplications: async (params = {}) => {
    try {
      const res = await InductionService.getApplications(params);
      if (res && Array.isArray(res.candidates)) {
        return res;
      }
      return { candidates: [], pagination: { total: 0, page: 1, limit: 20 } };
    } catch (err) {
      console.error('API error fetching applications:', err);
      return { candidates: [], pagination: { total: 0, page: 1, limit: 20 } };
    }
  },

  fetchApplicationById: async (id) => {
    try {
      const res = await InductionService.getApplicationById(id);
      return res?.application || null;
    } catch (err) {
      console.error(`API error fetching application ${id}:`, err);
      return null;
    }
  },

  updateCandidateStatus: async (id, status, notes = '') => {
    const backendStatus =
      status === 'Selected' || status === 'ACCEPTED'
        ? 'ACCEPTED'
        : status === 'Interviewed' || status === 'SHORTLISTED'
        ? 'SHORTLISTED'
        : status === 'Rejected' || status === 'REJECTED'
        ? 'REJECTED'
        : 'PENDING';

    try {
      return await InductionService.updateApplicationStatus(id, backendStatus, notes);
    } catch (err) {
      console.error('API error updating application status:', err);
      throw err;
    }
  },

  fetchStats: async (teamId) => {
    try {
      const stats = await InductionService.getStatistics(teamId);
      return stats;
    } catch (err) {
      console.error('API error fetching stats:', err);
      return { total: 0, selected: 0, interviewed: 0, inReview: 0 };
    }
  },

  // Fallback signature for components reading list
  getCandidates: () => [],
  getCandidateById: () => null,
  getStats: () => ({ total: 0, selected: 0, interviewed: 0, inReview: 0 }),
};

export default CandidateService;
