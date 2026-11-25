'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';
import Toast from '@/components/Common/Toast';
import { Button, Input, Badge, Card, ConfirmModal } from '@/components/ui';
import apiClient from '@/lib/api';
import TeamService from '@/services/admin/teamService';
import {
  Users,
  Users2,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Bell,
  CalendarDays,
  Rocket,
  Mic,
  HelpCircle,
  Inbox,
  UserCheck,
  ClipboardCheck,
  GraduationCap,
} from '@/components/icons';

const TEAM_SECTIONS = [
  {
    id: 'ALL',
    label: 'All Sections',
    description: 'Overview of Executive, Faculty, and Operational Teams',
  },
  {
    id: 'GLOBAL',
    label: 'Global Executive',
    description: 'Club Secretary, Student Coordinators & Executive Leads',
  },
  {
    id: 'FACULTY',
    label: 'Faculty Team',
    description: 'Professor-In-Charge, Faculty Advisors & Mentors',
  },
  {
    id: 'OPERATIONAL',
    label: 'Operational Teams',
    description: 'Technical, Media, Events & Domain Teams',
  },
];

const POSITION_PRESETS = {
  OPERATIONAL: ['Lead', 'Co-Lead', 'Senior Member', 'Member'],
  GLOBAL: ['Club Secretary', 'Joint Secretary', 'Coordinator', 'Co-Coordinator', 'Executive Member'],
  FACULTY: ['Professor-In-Charge', 'Faculty Advisor', 'Faculty Mentor', 'Co-Advisor'],
};

const MODULE_PERMISSIONS = [
  {
    category: 'Website Management (CMS)',
    items: [
      {
        key: 'cms_gallery:manage:any',
        label: 'Gallery Access',
        description: 'Upload, edit, and organize gallery albums & media items',
        icon: ImageIcon,
        badge: 'Media',
      },
      {
        key: 'cms_notices:manage:any',
        label: 'Notices & Circulars',
        description: 'Publish and manage official center notices and deadlines',
        icon: Bell,
        badge: 'Content',
      },
      {
        key: 'cms_events:manage:any',
        label: 'Events & Conclaves',
        description: 'Manage flagship events, hackathons, and registration links',
        icon: CalendarDays,
        badge: 'Events',
      },
      {
        key: 'cms_incubations:manage:any',
        label: 'Startups & Incubations',
        description: 'Showcase incubated and graduated student/alumni startups',
        icon: Rocket,
        badge: 'Ecosystem',
      },
      {
        key: 'cms_talks:manage:any',
        label: 'Entrepreneur Talks',
        description: 'Manage guest speaker talks, webinars, and transcripts',
        icon: Mic,
        badge: 'Events',
      },
      {
        key: 'cms_faqs:manage:any',
        label: 'FAQs Management',
        description: 'Maintain frequently asked questions and guides',
        icon: HelpCircle,
        badge: 'Support',
      },
      {
        key: 'cms_queries:manage:any',
        label: 'Queries & Inquiries',
        description: 'Review and respond to startup proposals and visitor queries',
        icon: Inbox,
        badge: 'Support',
      },
    ],
  },
  {
    category: 'Induction & Operations',
    items: [
      {
        key: 'induction_evaluation:create:any',
        label: 'Candidate Evaluation',
        description: 'Conduct interviews and grade candidate performance parameters',
        icon: ClipboardCheck,
        badge: 'Evaluator',
      },
      {
        key: 'induction_application:update:any',
        label: 'Application Status Control',
        description: 'Shortlist, accept, or reject candidate induction applications',
        icon: CheckCircle2,
        badge: 'Lead',
      },
    ],
  },
];

export default function TeamsManagementPage() {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeSection, setActiveSection] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);

  // Form State: members is array of { userId, position }
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'OPERATIONAL',
    permissionKeys: [],
    members: [],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamsData, usersRes] = await Promise.all([
        TeamService.getTeams(),
        apiClient.get('/users?limit=100'),
      ]);

      setTeams(teamsData || []);
      setAllUsers(usersRes?.users || []);
    } catch (err) {
      console.error('Failed to load teams data:', err);
      setToast({
        type: 'error',
        message: 'Failed to load teams and members from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTeams = useMemo(() => {
    if (activeSection === 'ALL') return teams;
    return teams.filter((t) => (t.type || 'OPERATIONAL') === activeSection);
  }, [teams, activeSection]);

  const handleOpenCreate = (defaultType = 'OPERATIONAL') => {
    setEditingTeam(null);
    setModalError('');
    setFormData({
      name: '',
      description: '',
      type: defaultType === 'ALL' ? 'OPERATIONAL' : defaultType,
      permissionKeys: [],
      members: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setModalError('');
    const currentPermKeys = (team.permissions || []).map((p) => p.key);
    const currentMembers = (team.members || []).map((m, idx) => ({
      userId: m.id,
      position: m.position || 'Member',
      order: m.memberOrder ?? idx,
    }));

    setFormData({
      name: team.name,
      description: team.description || '',
      type: team.type || 'OPERATIONAL',
      permissionKeys: currentPermKeys,
      members: currentMembers,
    });
    setIsModalOpen(true);
  };

  const togglePermission = (key) => {
    setFormData((prev) => {
      const nextKeys = new Set(prev.permissionKeys);
      if (nextKeys.has(key)) nextKeys.delete(key);
      else nextKeys.add(key);
      return { ...prev, permissionKeys: Array.from(nextKeys) };
    });
  };

  const toggleMember = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.some((m) => m.userId === userId);
      if (exists) {
        return {
          ...prev,
          members: prev.members.filter((m) => m.userId !== userId),
        };
      }
      const defaultPos = POSITION_PRESETS[prev.type]?.slice(-1)[0] || 'Member';
      return {
        ...prev,
        members: [
          ...prev.members,
          { userId, position: defaultPos, order: prev.members.length },
        ],
      };
    });
  };

  const updateFormMemberPosition = (userId, position) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.userId === userId ? { ...m, position } : m
      ),
    }));
  };

  const handleInlinePositionChange = async (teamId, userId, newPosition) => {
    try {
      await TeamService.updateMemberPosition(teamId, userId, newPosition);
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== teamId) return t;
          return {
            ...t,
            members: t.members.map((m) =>
              m.id === userId ? { ...m, position: newPosition } : m
            ),
          };
        })
      );
      setToast({
        type: 'success',
        message: `Updated position to "${newPosition}".`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message || 'Failed to update member position.',
      });
    }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Team name is required');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        permissionKeys: formData.permissionKeys,
        members: formData.members,
      };

      if (editingTeam) {
        await TeamService.updateTeam(editingTeam.id, payload);
        setToast({
          type: 'success',
          message: `Team "${formData.name}" updated successfully.`,
        });
      } else {
        await TeamService.createTeam(payload);
        setToast({
          type: 'success',
          message: `Team "${formData.name}" created successfully.`,
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

  const handleDeleteTeam = async () => {
    if (!deleteConfirmTeam) return;

    try {
      await TeamService.deleteTeam(deleteConfirmTeam.id);
      setToast({
        type: 'success',
        message: `Team "${deleteConfirmTeam.name}" deleted.`,
      });
      setDeleteConfirmTeam(null);
      await loadData();
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message || 'Failed to delete team.',
      });
      setDeleteConfirmTeam(null);
    }
  };

  const sectionBadge = (type) => {
    if (type === 'GLOBAL') return { label: 'Global Executive', variant: 'purple' };
    if (type === 'FACULTY') return { label: 'Faculty Team', variant: 'amber' };
    return { label: 'Operational Team', variant: 'blue' };
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <div className="space-y-6 animate-in fade-in duration-200">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Page Header */}
        <PageHeader
          icon={Users2}
          title="Team Management & Directory"
          description="Unified management for Operational Teams, Global Executive (Club Secretary & Coordinators), and Faculty Team. Assign members, set positions (Lead, Co-Lead, etc.), and configure access."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={loadData}
                disabled={isLoading}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleOpenCreate(activeSection)}
              >
                Create Team
              </Button>
            </div>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Teams & Sections
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {teams.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Users2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Memberships
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Faculty & Executive
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {teams
                    .filter((t) => t.type === 'GLOBAL' || t.type === 'FACULTY')
                    .reduce((acc, t) => acc + (t.members?.length || 0), 0)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
          {TEAM_SECTIONS.map((sec) => {
            const count =
              sec.id === 'ALL'
                ? teams.length
                : teams.filter((t) => (t.type || 'OPERATIONAL') === sec.id).length;
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sec.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#E2E8F0]">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E40AF]" />
              <p className="text-xs text-slate-500 mt-3 font-semibold">
                Loading unified teams and directory...
              </p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#E2E8F0] text-center p-6">
              <Users2 className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No teams in this section</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Create a team in this section to organize members, positions, and permissions.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleOpenCreate(activeSection)}
              >
                Create Team
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTeams.map((team) => {
                const secInfo = sectionBadge(team.type);
                const positionOptions =
                  POSITION_PRESETS[team.type || 'OPERATIONAL'] ||
                  POSITION_PRESETS.OPERATIONAL;

                return (
                  <Card
                    key={team.id}
                    className="p-5 bg-white border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Team Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E40AF] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                            {team.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-sm truncate">
                                {team.name}
                              </h3>
                              <Badge variant={secInfo.variant} size="xs">
                                {secInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {team.description || 'No description provided'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(team)}
                            className="p-1.5 text-slate-500 hover:text-[#1E40AF] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Team & Positions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTeam(team)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Assigned Module Permissions */}
                      {team.permissions && team.permissions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            Module Access:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {team.permissions.map((p) => {
                              const label = p.key.includes('gallery')
                                ? 'Gallery Control'
                                : p.key.includes('notices')
                                ? 'Notices Control'
                                : p.key.includes('events')
                                ? 'Events Control'
                                : p.key.split(':')[0].replace('cms_', '').toUpperCase();

                              return (
                                <Badge key={p.id || p.key} variant="blue" size="xs">
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Team Members & Manual Positions */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Members &amp; Positions ({team.members?.length || 0}):
                          </p>
                        </div>
                        {team.members && team.members.length > 0 ? (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {team.members.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {m.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={m.image}
                                      alt={m.name}
                                      className="w-6 h-6 rounded-full object-cover shrink-0"
                                    />
                                  ) : (
                                    <span className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                      {m.name?.[0] || 'U'}
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                      {m.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {m.email}
                                    </p>
                                  </div>
                                </div>

                                <select
                                  value={m.position || 'Member'}
                                  onChange={(e) =>
                                    handleInlinePositionChange(team.id, m.id, e.target.value)
                                  }
                                  className="text-[11px] font-semibold text-[#1E40AF] bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-[#1E40AF] cursor-pointer shrink-0"
                                  title="Change member position in this team"
                                >
                                  {!positionOptions.includes(m.position || 'Member') && (
                                    <option value={m.position}>{m.position}</option>
                                  )}
                                  {positionOptions.map((pos) => (
                                    <option key={pos} value={pos}>
                                      {pos}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            No members assigned yet. Click &quot;Manage Team&quot; to add members.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Team Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenEdit(team)}
                      >
                        Manage Team
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Create / Edit Team */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {editingTeam ? `Edit Team: ${editingTeam.name}` : 'Create New Team'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure section type, module permissions, and members with positions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTeam} className="flex-1 overflow-y-auto p-6 space-y-5">
                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Team Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Team Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Media Team, Faculty Team"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Team Section Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1E40AF]"
                    >
                      <option value="OPERATIONAL">Operational Team (Web, Media, Events)</option>
                      <option value="GLOBAL">Global Executive (Secretary, Coordinators)</option>
                      <option value="FACULTY">Faculty Team (PIC, Advisors, Mentors)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description
                    </label>
                    <Input
                      type="text"
                      placeholder="Brief description of responsibilities..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Module Permissions Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Module Access Permissions
                    </label>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {formData.permissionKeys.length} selected
                    </span>
                  </div>

                  <div className="space-y-4 max-h-52 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {MODULE_PERMISSIONS.map((group) => (
                      <div key={group.category} className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {group.category}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.items.map((perm) => {
                            const isChecked = formData.permissionKeys.includes(perm.key);
                            return (
                              <div
                                key={perm.key}
                                onClick={() => togglePermission(perm.key)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                                  isChecked
                                    ? 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded border-slate-300 text-[#1E40AF] focus:ring-0 cursor-pointer pointer-events-none"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs truncate">
                                      {perm.label}
                                    </span>
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                      {perm.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Members & Position Assignment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Assign Members &amp; Team Positions
                    </label>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {formData.members.length} assigned
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    {allUsers.map((u) => {
                      const assigned = formData.members.find((m) => m.userId === u.id);
                      const isSelected = Boolean(assigned);
                      const presets =
                        POSITION_PRESETS[formData.type] || POSITION_PRESETS.OPERATIONAL;

                      return (
                        <div
                          key={u.id}
                          className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-200 text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div
                            onClick={() => toggleMember(u.id)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-[#1E40AF] focus:ring-0 cursor-pointer pointer-events-none"
                            />
                            {u.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {u.name?.[0] || 'U'}
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs truncate leading-tight">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <select
                              value={assigned.position}
                              onChange={(e) =>
                                updateFormMemberPosition(u.id, e.target.value)
                              }
                              className="text-[11px] font-semibold text-[#1E40AF] bg-white border border-blue-200 rounded-md px-2 py-1 focus:outline-none cursor-pointer shrink-0"
                            >
                              {!presets.includes(assigned.position) && (
                                <option value={assigned.position}>
                                  {assigned.position}
                                </option>
                              )}
                              {presets.map((pos) => (
                                <option key={pos} value={pos}>
                                  {pos}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={modalLoading ? Loader2 : Save}
                    disabled={modalLoading}
                  >
                    {modalLoading
                      ? 'Saving...'
                      : editingTeam
                      ? 'Update Team'
                      : 'Create Team'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmTeam && (
          <ConfirmModal
            isOpen={Boolean(deleteConfirmTeam)}
            title="Delete Team"
            message={`Are you sure you want to delete "${deleteConfirmTeam.name}"? Members will be unassigned from this team.`}
            confirmText="Delete Team"
            confirmVariant="danger"
            onConfirm={handleDeleteTeam}
            onClose={() => setDeleteConfirmTeam(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
