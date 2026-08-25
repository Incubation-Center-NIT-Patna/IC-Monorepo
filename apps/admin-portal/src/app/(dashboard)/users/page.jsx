'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ROLES, ROLE_LABELS, PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable from '@/components/Common/DataTable';
import CardWrapper from '@/components/Common/CardWrapper';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Badge, Card } from '@/components/ui';
import {
  Shield,
  UserPlus,
  Edit2,
  CheckCircle2,
  X,
  Save,
  Mail,
  Briefcase,
  Building2,
} from '@/components/icons';

const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  [ROLES.ADMIN]: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-[#1E40AF]' },
  [ROLES.MEMBER]: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

export default function UserRoleManagementPage() {
  const { users, addUser, updateUserRoleAndPermissions, currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    post: '',
    department: '',
    role: ROLES.MEMBER,
    assignedModules: [],
  });

  const availableModules = [
    { key: PERMISSIONS.MANAGE_NOTICES, label: 'Notices & Announcements' },
    { key: PERMISSIONS.MANAGE_LEADERSHIP, label: 'Director & Leadership' },
    { key: PERMISSIONS.MANAGE_INCUBATIONS, label: 'Startups & Incubations' },
    { key: PERMISSIONS.MANAGE_EVENTS, label: 'Events & Talks' },
    { key: PERMISSIONS.MANAGE_TEAM, label: 'Faculty & Student Team' },
    { key: PERMISSIONS.MANAGE_GALLERY, label: 'Gallery & Media' },
    { key: PERMISSIONS.MANAGE_FAQS, label: 'FAQs Management' },
    { key: PERMISSIONS.INDUCTION_EVALUATE, label: 'Induction Candidate Evaluation' },
  ];

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      post: '',
      department: '',
      role: ROLES.MEMBER,
      assignedModules: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      post: user.post || '',
      department: user.department || '',
      role: user.role || ROLES.MEMBER,
      assignedModules: user.assignedModules || [],
    });
    setIsModalOpen(true);
  };

  const toggleModule = (moduleKey) => {
    setFormData((prev) => {
      const exists = prev.assignedModules.includes(moduleKey);
      return {
        ...prev,
        assignedModules: exists
          ? prev.assignedModules.filter((m) => m !== moduleKey)
          : [...prev.assignedModules, moduleKey],
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      updateUserRoleAndPermissions(
        editingUser.id,
        formData.role,
        formData.role === ROLES.SUPER_ADMIN ? ['all'] : formData.assignedModules
      );
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
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
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shrink-0"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name[0]}
              </span>
            )}
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span>{user.name}</span>
                {isCurrent && (
                  <Badge variant="blue">You</Badge>
                )}
              </div>
              <span className="text-[11px] text-slate-500">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => {
        const roleBadgeVariant =
          user.role === ROLES.SUPER_ADMIN ? 'purple' : user.role === ROLES.ADMIN ? 'blue' : 'slate';
        return (
          <Badge variant={roleBadgeVariant} showDot>
            {ROLE_LABELS[user.role]}
          </Badge>
        );
      },
    },
    {
      key: 'post',
      header: 'Designation & Dept',
      sortable: true,
      render: (user) => (
        <div>
          <p className="text-slate-900 font-medium">{user.post || 'Member'}</p>
          <p className="text-[11px] text-slate-500">{user.department || 'Incubation Center'}</p>
        </div>
      ),
    },
    {
      key: 'assignedModules',
      header: 'Assigned Sections',
      sortable: false,
      render: (user) => (
        user.role === ROLES.SUPER_ADMIN ? (
          <span className="text-purple-700 font-semibold text-[11px]">
            ★ Full Access to All Sections
          </span>
        ) : user.role === ROLES.ADMIN ? (
          <div className="flex flex-wrap gap-1">
            {user.assignedModules && user.assignedModules.length > 0 ? (
              user.assignedModules.map((m) => (
                <span
                  key={m}
                  className="px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700"
                >
                  {m.split(':')[1] || m}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-[11px]">No sections assigned</span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">Profile Only</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: false,
      render: () => <Badge variant="emerald" icon={CheckCircle2}>Active</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (user) => (
        <Button variant="outline" size="xs" icon={Edit2} onClick={() => handleOpenEdit(user)}>
          Edit Roles
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Shield}
          title="User Accounts & Access Permissions"
          description="Manage user accounts, access roles, and section permissions."
          actionText="Add User"
          actionIcon={UserPlus}
          onAction={handleOpenAdd}
        />

        {/* MOBILE ONLY (< 640px): Touch-friendly User Cards Feed */}
        <div className="block sm:hidden space-y-3">
          {users.map((u) => {
            const isCurrent = u.id === currentUser?.id;
            const roleBadgeVariant =
              u.role === ROLES.SUPER_ADMIN ? 'purple' : u.role === ROLES.ADMIN ? 'blue' : 'slate';

            return (
              <CardWrapper key={u.id} className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-2xs">
                {/* Header: Avatar, Name, Email & Role Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                        {u.name[0]}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 text-xs truncate">{u.name}</p>
                        {isCurrent && <Badge variant="blue">You</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <Badge variant={roleBadgeVariant} showDot>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 font-medium">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Designation</span>
                    <span className="text-slate-800 font-semibold">{u.post || 'Member'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Department</span>
                    <span className="text-slate-800 font-semibold">{u.department || 'Incubation Center'}</span>
                  </div>
                </div>

                {/* Modules & Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {u.role === ROLES.SUPER_ADMIN ? (
                      <span className="text-purple-700 font-bold text-[10px]">
                        ★ Full Access to All Sections
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold text-[10px]">
                        {u.assignedModules?.length || 0} Sections Assigned
                      </span>
                    )}
                  </div>

                  <Button variant="outline" size="xs" icon={Edit2} onClick={() => handleOpenEdit(u)}>
                    Edit Roles
                  </Button>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {/* DESKTOP ONLY (>= 640px): Users Data Table */}
        <div className="hidden sm:block">
          <DataTable
            data={users}
            columns={columns}
            searchPlaceholder="Search by name, email or role..."
            searchKeys={['name', 'email', 'role', 'post', 'department']}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            emptyMessage="No users found matching your search."
          />
        </div>

        {/* Modal: Add/Edit User */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>
                  {editingUser ? `Edit Role: ${editingUser.name}` : 'Create New User & Assign Role'}
                </Card.Title>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sameer Gupta" />
                  <Input label="Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="sameer.ic@nitp.ac.in" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Designation" value={formData.post} onChange={(e) => setFormData({ ...formData, post: e.target.value })} placeholder="e.g. Student Lead" />
                  <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Web Team" />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">User Access Role *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(ROLES).map((roleKey) => {
                      const isSelected = formData.role === roleKey;
                      const rStyle = ROLE_COLORS[roleKey];

                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: roleKey })}
                          className={`p-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? `${rStyle.bg} ${rStyle.border} ${rStyle.text} ring-1 ring-[#1E40AF]/30`
                              : 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {ROLE_LABELS[roleKey]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.role === ROLES.ADMIN && (
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Assign Specific Management Sections:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableModules.map((mod) => {
                        const isChecked = formData.assignedModules.includes(mod.key);

                        return (
                          <button
                            key={mod.key}
                            type="button"
                            onClick={() => toggleModule(mod.key)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#EFF6FF] border-[#1E40AF]/30 text-[#1E40AF] font-bold'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] border ${
                                isChecked
                                  ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="truncate">{mod.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Save User & Permissions</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
