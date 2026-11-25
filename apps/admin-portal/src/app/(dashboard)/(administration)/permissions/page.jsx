'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Badge } from '@/components/ui';
import apiClient from '@/lib/api';
import {
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Users,
} from '@/components/icons';

const MODULE_GROUPS = {
  cms: {
    label: 'Main Website Control',
    icon: '🌐',
    description: 'Manage website notices, conclaves, startups, guest talks, leadership, gallery, FAQs, and queries.',
  },
  user: {
    label: 'Members Control',
    icon: '👥',
    description: 'Manage team member accounts, user directory, status & suspension, task assignments.',
  },
  team: {
    label: 'Teams & Operations Control',
    icon: '🏢',
    description: 'Create operational teams, assign module permissions, and manage membership.',
  },
  event: {
    label: 'Event Website Control',
    icon: '📅',
    description: 'Manage hackathons, challenges, attendee registrations, resource tracking, and staff assignments.',
  },
  induction: {
    label: 'Induction Process Control',
    icon: '🎓',
    description: 'Manage candidate applications, interview rounds, evaluation parameters, scoring, and user conversion.',
  },
  role: {
    label: 'Roles & Governance Control',
    icon: '🛡️',
    description: 'Create custom roles, manage permission policies, and security administration.',
  },
  settings: {
    label: 'Platform Settings Control',
    icon: '⚙️',
    description: 'Configure platform system settings, registration windows, and system activity logs.',
  },
};

const PROTECTED_SYSTEM_ROLES = ['Super Admin', 'Admin', 'Member', 'Developer'];

export default function PermissionsManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [roles, setRoles] = useState([]);
  const [canonicalPermissions, setCanonicalPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activePermissions, setActivePermissions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Modal State for Creating Custom Role
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' });
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [createRoleError, setCreateRoleError] = useState('');

  // Load roles & canonical permissions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      const [rolesRes, permRes] = await Promise.all([
        apiClient.get('/roles'),
        apiClient.get('/roles/permissions'),
      ]);

      const fetchedRoles = rolesRes?.roles || [];
      const fetchedPerms = permRes?.permissions || [];

      setRoles(fetchedRoles);
      setCanonicalPermissions(fetchedPerms);

      // Default select Admin or first role
      if (fetchedRoles.length > 0) {
        setSelectedRole((prev) => {
          if (prev) {
            const stillExists = fetchedRoles.find((r) => r.id === prev.id);
            if (stillExists) return stillExists;
          }
          return fetchedRoles.find((r) => r.name === 'Admin') || fetchedRoles[0];
        });
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setFeedback({
        type: 'error',
        text: 'Failed to load permissions schema from backend.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync active permissions when selected role changes
  useEffect(() => {
    if (!selectedRole) return;

    if (selectedRole.name === 'Super Admin') {
      const allKeys = canonicalPermissions.map((p) => p.key);
      setActivePermissions(new Set(allKeys));
    } else {
      const rolePermKeys = (selectedRole.permissions || []).map((p) =>
        typeof p === 'string' ? p : p.key || `${p.resource}:${p.action}:${p.scope}`
      );
      setActivePermissions(new Set(rolePermKeys));
    }
  }, [selectedRole, canonicalPermissions]);

  const togglePermission = (key) => {
    if (selectedRole?.name === 'Super Admin') return;

    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllInGroup = (groupPerms, selectAll) => {
    if (selectedRole?.name === 'Super Admin') return;

    setActivePermissions((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => {
        if (selectAll) {
          next.add(p.key);
        } else {
          next.delete(p.key);
        }
      });
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.name === 'Super Admin') return;

    setIsSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      const permissionKeys = Array.from(activePermissions);
      const res = await apiClient.put(`/roles/${selectedRole.id}/permissions`, {
        permissionKeys,
      });

      setFeedback({
        type: 'success',
        text: res.message || `Successfully updated permissions for ${selectedRole.name}!`,
      });

      // Reload roles to refresh state
      const rolesRes = await apiClient.get('/roles');
      if (rolesRes?.roles) {
        setRoles(rolesRes.roles);
        const updated = rolesRes.roles.find((r) => r.id === selectedRole.id);
        if (updated) setSelectedRole(updated);
      }
    } catch (err) {
      console.error('Failed to update role permissions:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Failed to save permissions.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create Custom Role Handler
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    setIsCreatingRole(true);
    setCreateRoleError('');

    try {
      const res = await apiClient.post('/roles', {
        name: newRoleForm.name.trim(),
        description: newRoleForm.description?.trim() || '',
        permissionKeys: [],
      });

      setFeedback({
        type: 'success',
        text: `Custom role "${res.role.name}" created successfully. You can now configure its permissions below.`,
      });

      setIsCreateModalOpen(false);
      setNewRoleForm({ name: '', description: '' });

      // Refresh roles and select newly created role
      const rolesRes = await apiClient.get('/roles');
      if (rolesRes?.roles) {
        setRoles(rolesRes.roles);
        const created = rolesRes.roles.find((r) => r.id === res.role.id);
        if (created) setSelectedRole(created);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create role';
      setCreateRoleError(msg);
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Delete Custom Role Handler
  const handleDeleteRole = async (role) => {
    if (PROTECTED_SYSTEM_ROLES.includes(role.name) || role.isSystem) {
      alert(`Role "${role.name}" is a protected core system role and cannot be deleted.`);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete the custom role "${role.name}"? Members assigned to this role will be reverted to Member role.`
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/roles/${role.id}`);
      setFeedback({
        type: 'success',
        text: `Custom role "${role.name}" deleted successfully.`,
      });

      // Reload roles and select first available
      const rolesRes = await apiClient.get('/roles');
      if (rolesRes?.roles) {
        setRoles(rolesRes.roles);
        setSelectedRole(rolesRes.roles[0] || null);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete role');
    }
  };

  // Group permissions by resource domain
  const groupedPermissions = canonicalPermissions.reduce((acc, perm) => {
    let resource = perm.resource || 'other';
    if (resource.startsWith('cms_')) resource = 'cms';
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(perm);
    return acc;
  }, {});

  const isSuperAdminRole = selectedRole?.name === 'Super Admin';
  const isProtectedRole = PROTECTED_SYSTEM_ROLES.includes(selectedRole?.name) || selectedRole?.isSystem;

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Shield}
          title="Roles & Permissions Governance"
          description="Create customizable roles and manage resource-level permissions across Main Website, Members, Events, Inductions, and System."
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
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Role
              </Button>
              {!isSuperAdminRole && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={isSaving ? Loader2 : Save}
                  onClick={handleSavePermissions}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? 'Saving...' : 'Save Permissions'}
                </Button>
              )}
            </div>
          }
        />

        {/* Feedback Alert */}
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
              className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Roles List & Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            const isProtected = PROTECTED_SYSTEM_ROLES.includes(role.name) || role.isSystem;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-blue-50/70 border-[#1E40AF] shadow-xs ring-1 ring-[#1E40AF]/20'
                    : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {role.name}
                  </span>
                  {role.name === 'Super Admin' ? (
                    <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  ) : !isProtected ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded transition-opacity"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {role.description || (isProtected ? 'Core System Role' : 'Customizable Role')}
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {role.name === 'Super Admin'
                      ? 'Full Authority'
                      : `${role.permissions?.length || 0} permissions`}
                  </span>
                  {!isProtected && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Permissions Configuration Grid */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Role: <span className="text-[#1E40AF]">{selectedRole?.name}</span>
                </h2>
                {!isProtectedRole && (
                  <Badge variant="amber" className="text-[10px] font-bold">
                    Custom Role
                  </Badge>
                )}
                {isProtectedRole && (
                  <Badge variant="blue" className="text-[10px] font-bold">
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedRole?.description || 'Configure module controls and resource privileges for this role.'}
              </p>
            </div>
            {isSuperAdminRole ? (
              <Badge variant="purple" icon={Lock}>
                Super Admin (Inherently Has All Permissions)
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {activePermissions.size} permissions active
                </span>
                {!isProtectedRole && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    icon={Trash2}
                    onClick={() => handleDeleteRole(selectedRole)}
                  >
                    Delete Role
                  </Button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E40AF]" />
              <p className="text-xs">Loading permission controls...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedPermissions).map(([resourceKey, perms]) => {
                const groupInfo = MODULE_GROUPS[resourceKey] || {
                  label: `${resourceKey.toUpperCase()} Control`,
                  icon: '📌',
                  description: 'Permissions for this module',
                };

                const allInGroupSelected = perms.every((p) => activePermissions.has(p.key));

                return (
                  <div
                    key={resourceKey}
                    className="border border-slate-200 rounded-xl p-4.5 space-y-3 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{groupInfo.icon}</span>
                        <div>
                          <h3 className="font-bold text-xs text-slate-900 tracking-wide">
                            {groupInfo.label}
                          </h3>
                        </div>
                      </div>

                      {!isSuperAdminRole && (
                        <button
                          type="button"
                          onClick={() => toggleAllInGroup(perms, !allInGroupSelected)}
                          className="text-[11px] font-bold text-[#1E40AF] hover:underline cursor-pointer"
                        >
                          {allInGroupSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {groupInfo.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {perms.map((p) => {
                        const isChecked = activePermissions.has(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSuperAdminRole
                                ? 'opacity-80 cursor-default'
                                : 'hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isSuperAdminRole}
                              onChange={() => togglePermission(p.key)}
                              className="mt-0.5 w-4 h-4 rounded text-[#1E40AF] focus:ring-[#1E40AF] border-slate-300 disabled:cursor-not-allowed"
                            />
                            <div className="text-xs">
                              <span className="font-semibold text-slate-800">
                                {p.action.toUpperCase()} {p.scope.toUpperCase()}
                              </span>
                              <p className="text-[11px] font-mono text-slate-500">
                                {p.key}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal for Creating Custom Role */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1E40AF]" />
                  <h3 className="font-bold text-base text-slate-900">Create Custom Role</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createRoleError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {createRoleError}
                </div>
              )}

              <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
                <div>
                  <Input
                    label="Role Name *"
                    required
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    placeholder="e.g. Event Manager, Content Lead, Interviewer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Role Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                    placeholder="Brief description of this role's purpose..."
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:ring-1 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isCreatingRole}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={isCreatingRole ? Loader2 : Plus}
                    disabled={isCreatingRole}
                  >
                    {isCreatingRole ? 'Creating...' : 'Create Role'}
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
