'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { CategoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable from '@/components/Common/DataTable';
import ImageUploader from '@/components/Common/ImageUploader';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Select, Textarea, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Save,
  X,
  Briefcase,
  Building2,
} from '@/components/icons';

export default function TeamManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [team, setTeam] = useState(() => {
    const items = ContentService.getItems('team');
    return items.map((itm) => {
      if (!itm.category) return { ...itm, category: 'faculty' };
      return itm;
    });
  });

  const [categories, setCategories] = useState(() => CategoryService.getCategories('team'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    post: '',
    category: 'faculty',
    department: '',
    image: '',
    email: '',
    about: '',
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('team', newCatInput);
    if (updated) {
      setCategories(updated);
      setFormData((prev) => ({ ...prev, category: newCatInput.trim() }));
    }
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      post: '',
      category: activeTab === 'all' ? 'faculty' : activeTab,
      department: '',
      image: '',
      email: '',
      about: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      post: item.post || '',
      category: item.category || 'faculty',
      department: item.department || '',
      image: item.image || '',
      email: item.email || '',
      about: item.about || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      ContentService.updateItem('team', editingItem.id, formData);
    } else {
      ContentService.addItem('team', formData);
    }
    setTeam(ContentService.getItems('team'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('team', deleteId);
    setTeam(updated);
    setDeleteId(null);
  };

  const filteredTeam = team.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'faculty') return t.category === 'faculty';
    if (activeTab === 'post_bearer') return t.category === 'post_bearer' || t.category === 'leadership';
    if (activeTab === 'student') return t.category === 'student';
    return t.category === activeTab;
  });

  const columns = [
    {
      key: 'member',
      header: 'Team Member',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-9 h-9 aspect-square object-cover border border-[#E2E8F0] shrink-0"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <span
              className="w-9 h-9 bg-blue-50 text-[#1E40AF] flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0"
              style={{ borderRadius: '50%' }}
            >
              {item.name[0]}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs">{item.name}</p>
            {item.email && (
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.email}</span>
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'post',
      header: 'Designation / Role',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Briefcase className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
          <span className="font-semibold text-slate-900">{item.post || 'Member'}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department / Organization',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{item.department || 'Incubation Center'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Subsection',
      sortable: true,
      render: (item) => {
        const cat = item.category?.toLowerCase() || 'faculty';
        const isFaculty = cat === 'faculty';
        const isPostBearer = cat === 'post_bearer' || cat === 'leadership';

        return (
          <Badge variant={isFaculty ? 'blue' : isPostBearer ? 'purple' : 'emerald'}>
            {isFaculty ? 'Faculty' : isPostBearer ? 'Post Bearer' : 'Student Member'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="xs" icon={Edit2} onClick={() => handleOpenEdit(item)} />
          <Button variant="outline" size="xs" icon={Trash2} className="hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(item.id)} />
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_TEAM}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Users}
          title="Manage Team Details"
          description="Directory and management of Faculty mentors, Post Bearers, and Student Coordinators."
          actionText="Add Team Member"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Subsections Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1 p-1 rounded-md bg-white border border-[#E2E8F0] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'all'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              All Roster ({team.length})
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'faculty'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              Faculty ({team.filter((t) => t.category === 'faculty').length})
            </button>
            <button
              onClick={() => setActiveTab('post_bearer')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'post_bearer'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              Post Bearer ({team.filter((t) => t.category === 'post_bearer' || t.category === 'leadership').length})
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'student'
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              Student Member ({team.filter((t) => t.category === 'student').length})
            </button>
          </div>
        </div>

        {/* Tabular Data Table */}
        <DataTable
          data={filteredTeam}
          columns={columns}
          searchPlaceholder="Search team member by name, post, department or email..."
          searchKeys={['name', 'post', 'department', 'email', 'category']}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No team members found for this subsection."
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Team Member"
          message="Are you sure you want to remove this team member?"
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit Member Details' : 'Add New Team Member'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Dr. Amitesh Kumar" />

                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <label className="block text-slate-700 font-semibold">Subsection / Role Category</label>
                      {isSuperAdmin && (
                        <button type="button" onClick={() => setShowAddCat((p) => !p)} className="text-[10px] text-[#1E40AF] hover:underline font-semibold">
                          + Add Category
                        </button>
                      )}
                    </div>
                    {showAddCat ? (
                      <div className="flex items-center gap-1">
                        <Input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder="New..." />
                        <Button size="xs" onClick={handleAddCategory}>Save</Button>
                      </div>
                    ) : (
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                          { label: 'Faculty', value: 'faculty' },
                          { label: 'Post Bearer', value: 'post_bearer' },
                          { label: 'Student Member', value: 'student' },
                          ...categories
                            .filter((c) => !['faculty', 'post_bearer', 'student'].includes(c))
                            .map((cat) => ({ label: cat, value: cat })),
                        ]}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Designation / Post Title" value={formData.post} onChange={(e) => setFormData({ ...formData, post: e.target.value })} placeholder="e.g. Faculty Mentor" />
                  <Input label="Official Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="amitesh.ee@nitp.ac.in" />
                </div>

                <Input label="Department / Branch" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Electrical Engineering" />

                <ImageUploader
                  label="Portrait Profile Picture"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload photo or paste URL"
                />

                <Textarea label="Bio / Mentorship Focus" rows={3} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} placeholder="Research areas..." />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Save Member</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
