import apiClient from '@/lib/api';

/**
 * Induction Service Layer
 * Centralized API calls for candidates, evaluations, parameters, rounds, and audit logs.
 */
export const InductionService = {
  // Statistics
  getStatistics: async (teamId) => {
    const params = teamId ? { teamId } : {};
    return apiClient.get('/induction/statistics', { params });
  },

  // Applications & Candidates
  getApplications: async (params = {}) => {
    return apiClient.get('/induction/applications', { params });
  },

  getApplicationById: async (id) => {
    return apiClient.get(`/induction/applications/${id}`);
  },

  updateApplicationStatus: async (id, status, notes) => {
    return apiClient.patch(`/induction/applications/${id}/status`, {
      status,
      notes,
    });
  },

  // Interviews & Evaluations
  getInterviews: async (params = {}) => {
    return apiClient.get('/induction/interviews', { params });
  },

  getInterviewById: async (id) => {
    return apiClient.get(`/induction/interviews/${id}`);
  },

  assignInterviewer: async (data) => {
    return apiClient.post('/induction/interviews', data);
  },

  submitEvaluation: async (interviewId, data) => {
    return apiClient.post(`/induction/interviews/${interviewId}/evaluate`, data);
  },

  // Domains & Rounds & Evaluation Parameters
  getTeams: async () => {
    return apiClient.get('/induction/teams');
  },

  getTeamRounds: async (teamId) => {
    return apiClient.get(`/induction/teams/${teamId}/rounds`);
  },

  createRound: async (teamId, data) => {
    return apiClient.post(`/induction/teams/${teamId}/rounds`, data);
  },

  updateRound: async (roundId, data) => {
    return apiClient.put(`/induction/rounds/${roundId}`, data);
  },

  deleteRound: async (roundId) => {
    return apiClient.delete(`/induction/rounds/${roundId}`);
  },

  saveParameters: async (roundId, parameters) => {
    return apiClient.post(`/induction/rounds/${roundId}/parameters`, { parameters });
  },

  deleteParameter: async (parameterId) => {
    return apiClient.delete(`/induction/parameters/${parameterId}`);
  },

  // Activity Logs
  getActivityLogs: async (params = {}) => {
    return apiClient.get('/induction/activity-logs', { params });
  },

  // Induction Accounts
  getInductionAccounts: async () => {
    return apiClient.get('/induction/accounts');
  },

  createInductionAccount: async (data) => {
    return apiClient.post('/induction/accounts', data);
  },

  updateInductionAccount: async (id, data) => {
    return apiClient.patch(`/induction/accounts/${id}`, data);
  },
};

export default InductionService;

