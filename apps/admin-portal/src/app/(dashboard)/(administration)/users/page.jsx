'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable from '@/components/Common/DataTable';
import CardWrapper from '@/components/Common/CardWrapper';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Badge, Card } from '@/components/ui';
import apiClient from '@/lib/api';
import TeamService from '@/services/admin/teamService';
import {
  Shield,
  UserPlus,
  Edit2,
  CheckCircle2,
  X,
  XCircle,
  Save,
  Loader2,
  AlertCircle,
} from '@/components/icons';

const ROLE_COLORS = {
  'Super Admin': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Admin': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-[#1E40AF]' },
  'Developer': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'Member': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

export default function UserRoleManagementPage() {
  const { currentUser, isSuperAdmin, canAddUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    roleId: '',
    teamIds: [],
  });

  // Load users, roles, and teams from centralized Fastify API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes, teamsRes] = await Promise.all([
        apiClient.get('/users?limit=100'),
        apiClient.get('/roles'),
        TeamService.getTeams().catch(() => []),
      ]);

      setUsers(usersRes?.users || []);
      setAvailableRoles(rolesRes?.roles || []);
      setAvailableTeams(teamsRes || []);
    } catch (err) {
      console.error('Failed to load user management data:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to load user data. Please ensure you have sufficient permissions.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalError('');
    // Default to 'Member' or first non-superadmin role
    const defaultRole = availableRoles.find((r) => r.name === 'Member') || availableRoles[0];
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      roleId: defaultRole?.id || '',
      teamIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setModalError('');
    const userRoleId = user.roles?.[0]?.id || '';
    const userTeamIds = (user.teams || []).map((t) => t.id);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      roleId: userRoleId,
      teamIds: userTeamIds,
    });
    setIsModalOpen(true);
  };

  const toggleTeamSelection = (teamId) => {
    setFormData((prev) => {
      const nextTeams = new Set(prev.teamIds);
      if (nextTeams.has(teamId)) {
        nextTeams.delete(teamId);
      } else {
        nextTeams.add(teamId);
      }
      return { ...prev, teamIds: Array.from(nextTeams) };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (editingUser) {
        // Update user
        await apiClient.put(`/users/${editingUser.id}`, {
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          roleIds: formData.roleId ? [formData.roleId] : [],
          teamIds: formData.teamIds,
        });
        setFeedbackMessage({ type: 'success', text: `Updated ${formData.name} successfully.` });
      } else {
        // Create pre-registered user (Super Admin / Developer only)
        await apiClient.post('/users', {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          roleIds: formData.roleId ? [formData.roleId] : [],
          teamIds: formData.teamIds,
        });
        setFeedbackMessage({
          type: 'success',
          text: `User ${formData.email} registered. They may now sign in using Google OAuth.`,
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Operation failed';
      setModalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleBan = async (user) => {
    const action = user.banned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) return;

    try {
      if (user.banned) {
        await apiClient.delete(`/users/${user.id}/ban`);
        setFeedbackMessage({ type: 'success', text: `Unbanned ${user.name}.` });
      } else {
        await apiClient.post(`/users/${user.id}/ban`, { reason: 'Suspended by admin' });
        setFeedbackMessage({ type: 'success', text: `Banned ${user.name}.` });
      }
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update ban status');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user) => {
        const isCurrent = user.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2.5">
            {user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shrink-0"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name?.[0] || 'U'}
              </span>
            )}
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span>{user.name}</span>
                {isCurrent && <Badge variant="blue">You</Badge>}
              </div>
              <span className="text-[11px] text-slate-500">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (user) => {
        const primaryRole = user.roles?.[0]?.name || 'Member';
        const roleStyle =
          primaryRole === 'Super Admin'
            ? 'purple'
            : primaryRole === 'Developer'
            ? 'emerald'
            : primaryRole === 'Admin'
            ? 'blue'
            : 'slate';

        return (
          <Badge variant={roleStyle} showDot>
            {primaryRole}
          </Badge>
        );
      },
    },
    {
      key: 'teams',
      header: 'Assigned Teams',
      sortable: false,
      render: (user) => {
        const teams = user.teams || [];
        if (teams.length === 0) {
          return <span className="text-[11px] text-slate-400 italic">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {teams.map((t) => (
              <Badge key={t.id} variant="blue" size="xs">
                {t.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'source',
      header: 'Account Source',
      sortable: true,
      render: (user) => {
        const isInduction = user.creationSource === 'induction';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
              isInduction
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {isInduction ? 'Induction Selection' : 'Manual Admin'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (user) =>
        user.banned ? (
          <Badge variant="rose" icon={XCircle}>
            Suspended
          </Badge>
        ) : (
          <Badge variant="emerald" icon={CheckCircle2}>
            Registered
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (user) => {
        const isCurrent = user.id === currentUser?.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="xs"
              icon={Edit2}
              onClick={() => handleOpenEdit(user)}
            >
              Edit Role
            </Button>
            {!isCurrent && (
              <Button
                variant={user.banned ? 'outline' : 'danger'}
                size="xs"
                onClick={() => handleToggleBan(user)}
              >
                {user.banned ? 'Unban' : 'Ban'}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Shield}
          title="Team Members & System User Directory"
          description="Authoritative user management for all team members, staff, and inducted members. Google OAuth sign-in."
          actionText={canAddUser ? 'Add Team Member' : undefined}
          actionIcon={canAddUser ? UserPlus : undefined}
          onAction={canAddUser ? handleOpenAdd : undefined}
        />

        {feedbackMessage.text && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              feedbackMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* User Data Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E40AF]" />
              <p className="text-xs">Loading registered users...</p>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              searchPlaceholder="Search by name, email or role..."
              searchKeys={['name', 'email']}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              emptyMessage="No registered users found."
            />
          )}
        </div>

        {/* Modal: Pre-Register or Edit User */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>
                  {editingUser
                    ? `Edit Access: ${editingUser.name}`
                    : 'Pre-Register User for Google Sign-in'}
                </Card.Title>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <Input
                    label="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Madhukar Kumar"
                  />
                </div>

                <div>
                  <Input
                    label="Google Email Address *"
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@gmail.com or user@nitp.ac.in"
                  />
                  {!editingUser && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Must be a registered Google email address. Open self-registration is blocked.
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    label="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Assign System / Custom Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableRoles
                      .filter((r) => isSuperAdmin || r.name !== 'Super Admin')
                      .map((role) => {
                        const isSelected = formData.roleId === role.id;
                        const roleColor = ROLE_COLORS[role.name] || {
                          bg: 'bg-amber-50',
                          border: 'border-amber-200',
                          text: 'text-amber-800',
                        };

                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, roleId: role.id })}
                            className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? `${roleColor.bg} ${roleColor.border} ${roleColor.text} ring-2 ring-[#1E40AF]/20`
                                : 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block truncate">{role.name}</span>
                              {role.description && (
                                <span className="block text-[10px] font-normal text-slate-400 truncate">
                                  {role.description}
                                </span>
                              )}
                            </div>
                            {isSelected && <span className="text-[#1E40AF] font-bold ml-1">✓</span>}
                          </button>
                        );
                      })}
                  </div>

                  {/* Live Permissions Scope Breakdown for Selected Role */}
                  {(() => {
                    const selectedRole = availableRoles.find((r) => r.id === formData.roleId);
                    if (!selectedRole) return null;

                    const isSuper = selectedRole.name === 'Super Admin';
                    const perms = (selectedRole.permissions || []).map((p) =>
                      typeof p === 'string' ? p : p.key || `${p.resource}:${p.action}:${p.scope}`
                    );

                    const hasCms = isSuper || perms.some((k) => k.startsWith('cms:') || k.includes('manage:notices') || k.includes('manage:events'));
                    const hasUser = isSuper || perms.some((k) => k.startsWith('user:'));
                    const hasEvent = isSuper || perms.some((k) => k.startsWith('event:'));
                    const hasInduction = isSuper || perms.some((k) => k.startsWith('induction:'));
                    const hasSettings = isSuper || perms.some((k) => k.startsWith('settings:') || k.startsWith('role:'));

                    return (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <p className="font-bold text-[11px] text-slate-700 uppercase tracking-wide">
                          Control Scope for Role: {selectedRole.name}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={hasCms ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                              {hasCms ? '✓' : '×'} 🌐 Main Website Control
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasUser ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                              {hasUser ? '✓' : '×'} 👥 Members Control
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasEvent ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                              {hasEvent ? '✓' : '×'} 📅 Event Website Control
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasInduction ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                              {hasInduction ? '✓' : '×'} 🎓 Induction Process Control
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <span className={hasSettings ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                              {hasSettings ? '✓' : '×'} ⚙️ Platform Settings Control
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Team Assignment Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Assign to Teams (Optional)
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formData.teamIds.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Assigning a user to a team (e.g. Media Team) automatically grants them access to modules managed by that team.
                  </p>

                  {availableTeams.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No teams available. Create teams in the Teams tab.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      {availableTeams.map((team) => {
                        const isSelected = formData.teamIds.includes(team.id);
                        return (
                          <div
                            key={team.id}
                            onClick={() => toggleTeamSelection(team.id)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-200 text-slate-900 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-[#1E40AF] focus:ring-0 cursor-pointer pointer-events-none"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-xs truncate">{team.name}</span>
                              {team.description && (
                                <span className="block text-[10px] text-slate-400 truncate">{team.description}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={modalLoading ? Loader2 : Save}
                    disabled={modalLoading}
                  >
                    {modalLoading
                      ? 'Saving...'
                      : editingUser
                      ? 'Save Changes'
                      : 'Register User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
