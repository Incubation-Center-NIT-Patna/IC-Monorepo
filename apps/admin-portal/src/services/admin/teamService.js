import apiClient from '@/lib/api';

export const TeamService = {
  // Get all teams
  getTeams: async () => {
    try {
      const res = await apiClient.get('/teams');
      return res.teams || [];
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      throw err;
    }
  },

  // Get single team details
  getTeamById: async (id) => {
    try {
      const res = await apiClient.get(`/teams/${id}`);
      return res.team || null;
    } catch (err) {
      console.error(`Failed to fetch team ${id}:`, err);
      throw err;
    }
  },

  // Create team
  createTeam: async (teamData) => {
    try {
      const res = await apiClient.post('/teams', teamData);
      return res.team || res;
    } catch (err) {
      console.error('Failed to create team:', err);
      throw err;
    }
  },

  // Update team
  updateTeam: async (id, teamData) => {
    try {
      const res = await apiClient.put(`/teams/${id}`, teamData);
      return res.team || res;
    } catch (err) {
      console.error(`Failed to update team ${id}:`, err);
      throw err;
    }
  },

  // Delete team
  deleteTeam: async (id) => {
    try {
      const res = await apiClient.delete(`/teams/${id}`);
      return res;
    } catch (err) {
      console.error(`Failed to delete team ${id}:`, err);
      throw err;
    }
  },

  // Add members
  addMembers: async (teamId, userIds) => {
    try {
      const res = await apiClient.post(`/teams/${teamId}/members`, { userIds });
      return res;
    } catch (err) {
      console.error(`Failed to add members to team ${teamId}:`, err);
      throw err;
    }
  },

  // Update member position inside team
  updateMemberPosition: async (teamId, userId, position, order) => {
    try {
      const res = await apiClient.patch(`/teams/${teamId}/members/${userId}`, {
        position,
        ...(order !== undefined ? { order } : {}),
      });
      return res;
    } catch (err) {
      console.error(`Failed to update member ${userId} position in team ${teamId}:`, err);
      throw err;
    }
  },

  // Remove member
  removeMember: async (teamId, userId) => {
    try {
      const res = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
      return res;
    } catch (err) {
      console.error(`Failed to remove member ${userId} from team ${teamId}:`, err);
      throw err;
    }
  },
};

export default TeamService;

