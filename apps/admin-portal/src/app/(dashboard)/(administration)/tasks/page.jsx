'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import { Button, Input, Badge } from '@/components/ui';
import apiClient from '@/lib/api';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  Filter,
  RefreshCw,
  Loader2,
  X,
} from '@/components/icons';

const PRIORITY_COLORS = {
  LOW: 'slate',
  MEDIUM: 'blue',
  HIGH: 'amber',
  URGENT: 'rose',
};

const STATUS_TABS = [
  { id: 'ALL', label: 'All Tasks' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
];

export default function TaskManagementPage() {
  const { currentUser, isSuperAdmin, isAdmin, isDeveloper, hasPermission } = useAuth();
  const canManageTasks =
    isSuperAdmin || isAdmin || isDeveloper || hasPermission('manage:users');

  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    assignedToId: '',
    teamId: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksRes, usersRes, teamsRes] = await Promise.all([
        apiClient.get('/tasks'),
        canManageTasks ? apiClient.get('/users?limit=100').catch(() => ({ users: [] })) : Promise.resolve({ users: [] }),
        canManageTasks ? apiClient.get('/teams').catch(() => ({ teams: [] })) : Promise.resolve({ teams: [] }),
      ]);

      setTasks(tasksRes?.tasks || []);
      setTeamMembers(usersRes?.users || []);
      setTeams(teamsRes?.teams || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setFeedback({ type: 'error', text: 'Failed to load tasks from server.' });
    } finally {
      setIsLoading(false);
    }
  }, [canManageTasks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setModalError('');
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      deadline: '',
      assignedToId: teamMembers[0]?.id || '',
      teamId: '',
    });
    setIsModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError('Task title is required');
      return;
    }
    if (!formData.assignedToId) {
      setModalError('Please select a team member to assign this task');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      await apiClient.post('/tasks', {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        assignedToId: formData.assignedToId,
        teamId: formData.teamId || null,
      });

      setFeedback({
        type: 'success',
        text: `Task "${formData.title}" assigned successfully!`,
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.error || err.message || 'Failed to create task';
      setModalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab !== 'ALL' && t.status !== activeTab) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assigneeFilter && t.assignedToId !== assigneeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAssignee = t.assignedTo?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        icon={ClipboardCheck}
        title="Task Management & Delegations"
        description="Assign, track, and manage tasks for all team members. Tasks reference authoritative system accounts."
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
            {canManageTasks && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenCreate}
              >
                Assign Task
              </Button>
            )}
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardWrapper className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Tasks
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
        </CardWrapper>
        <CardWrapper className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pending
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">{counts.pending}</p>
        </CardWrapper>
        <CardWrapper className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-2xl font-black text-[#1E40AF] mt-1">{counts.inProgress}</p>
        </CardWrapper>
        <CardWrapper className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{counts.completed}</p>
        </CardWrapper>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 border-b sm:border-b-0 border-slate-100 pb-2 sm:pb-0 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] focus:outline-hidden focus:border-[#1E40AF] w-36 sm:w-48"
            />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 max-w-36"
            >
              <option value="">All Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#1E40AF]" />
            <p className="text-xs">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ClipboardCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">No tasks found</p>
            <p className="text-xs text-slate-400">
              Create and delegate a task to any system team member.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isAssignedToMe = task.assignedToId === currentUser?.id;
              const formattedDate = task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : 'No deadline';

              return (
                <div
                  key={task.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-xl transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {task.title}
                      </span>
                      <Badge variant={PRIORITY_COLORS[task.priority] || 'slate'}>
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'COMPLETED'
                            ? 'emerald'
                            : task.status === 'IN_PROGRESS'
                            ? 'blue'
                            : 'amber'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                        {isAssignedToMe && (
                          <span className="text-[10px] text-[#1E40AF] font-bold">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {formattedDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Task Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {task.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                      >
                        Start
                      </Button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Button
                        variant="primary"
                        size="xs"
                        icon={CheckCircle2}
                        onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                    )}
                    {task.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleUpdateStatus(task.id, 'PENDING')}
                      >
                        Reopen
                      </Button>
                    )}
                    {canManageTasks && (
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#1E40AF]" />
                <span>Assign New Task</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Candidate Portfolios for Round 2"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, required deliverables, and criteria..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-[#1E40AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign To Team Member (User Account) *
                </label>
                <select
                  required
                  value={formData.assignedToId}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedToId: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white font-medium"
                >
                  <option value="">Select a team member...</option>
                  {teamMembers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.roles?.[0]?.name || 'Member'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Only accounts present in the authoritative User directory can receive task assignments.
                </p>
              </div>

              {teams.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Team Context (Optional)
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) =>
                      setFormData({ ...formData, teamId: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white font-medium"
                  >
                    <option value="">General (No specific team)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={modalLoading}
                  icon={modalLoading ? Loader2 : Plus}
                >
                  {modalLoading ? 'Assigning...' : 'Assign Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

