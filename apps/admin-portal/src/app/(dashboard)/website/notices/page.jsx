'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { CategoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DataTable from '@/components/Common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Select, Textarea, RichTextEditor, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
} from '@/components/icons';

export default function NoticesManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [notices, setNotices] = useState(() => ContentService.getItems('notices'));
  const [categories, setCategories] = useState(() => CategoryService.getCategories('notices'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    tag: 'Incubation',
    date: new Date().toISOString().split('T')[0],
    priority: 'High',
    link: '',
    description: '',
    active: true,
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('notices', newCatInput);
    if (updated) {
      setCategories(updated);
      setFormData((prev) => ({ ...prev, tag: newCatInput.trim() }));
    }
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      tag: categories[0] || 'Incubation',
      date: new Date().toISOString().split('T')[0],
      priority: 'High',
      link: '',
      description: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      tag: item.tag || categories[0] || 'Incubation',
      date: item.date || new Date().toISOString().split('T')[0],
      priority: item.priority || 'Medium',
      link: item.link || '',
      description: item.description || '',
      active: item.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      ContentService.updateItem('notices', editingItem.id, formData);
    } else {
      ContentService.addItem('notices', formData);
    }
    setNotices(ContentService.getItems('notices'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('notices', deleteId);
    setNotices(updated);
    setDeleteId(null);
  };

  const toggleActive = (item) => {
    ContentService.updateItem('notices', item.id, { active: !item.active });
    setNotices(ContentService.getItems('notices'));
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_NOTICES}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Bell}
          title="Manage Notices"
          description="Create and manage website notices and announcements."
          actionText="Add Notice"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Notices Table */}
        <DataTable
          data={notices}
          columns={[
            {
              key: 'title',
              header: 'Title & Details',
              sortable: true,
              render: (notice) => (
                <div className="max-w-md">
                  <div className="font-semibold text-slate-900 hover:text-[#1E40AF] transition-colors">
                    {notice.title}
                  </div>
                  {notice.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {notice.description}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: 'tag',
              header: 'Category',
              sortable: true,
              render: (notice) => <Badge variant="slate">{notice.tag}</Badge>,
            },
            {
              key: 'date',
              header: 'Date',
              sortable: true,
              render: (notice) => <span className="text-slate-500 font-medium">{notice.date}</span>,
            },
            {
              key: 'priority',
              header: 'Priority',
              sortable: true,
              render: (notice) => (
                <Badge variant={notice.priority === 'High' ? 'rose' : 'amber'}>
                  {notice.priority}
                </Badge>
              ),
            },
            {
              key: 'active',
              header: 'Status',
              sortable: true,
              render: (notice) => (
                <button onClick={() => toggleActive(notice)} className="cursor-pointer">
                  <Badge variant={notice.active ? 'emerald' : 'slate'} icon={notice.active ? CheckCircle : XCircle}>
                    {notice.active ? 'Live' : 'Archived'}
                  </Badge>
                </button>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              sortable: false,
              className: 'text-right',
              render: (notice) => (
                <div className="inline-flex items-center gap-1">
                  <Button variant="outline" size="xs" icon={Edit2} onClick={() => handleOpenEdit(notice)} />
                  <Button variant="outline" size="xs" icon={Trash2} className="hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(notice.id)} />
                </div>
              ),
            },
          ]}
          searchPlaceholder="Search notices by title, tag, or description..."
          searchKeys={['title', 'tag', 'description', 'priority']}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No notices found matching your search."
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Notice"
          message="Are you sure you want to delete this notice announcement?"
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit Notice' : 'Create New Notice'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <Input label="Notice Headline" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Call for Seed Cohort 2026 Applications Open" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-semibold text-xs">Category / Tag</label>
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
                      <Select value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} options={categories} />
                    )}
                  </div>

                  <Select
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={[
                      { label: 'High (Marquee Alert)', value: 'High' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'Low', value: 'Low' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Publication Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  <Input label="Action Link (Optional)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                </div>

                <RichTextEditor label="Description / Brief (Rich Text)" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide details about registration, bold/italic..." />

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <input type="checkbox" id="activeToggle" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#1E40AF] cursor-pointer" />
                  <label htmlFor="activeToggle" className="text-slate-700 font-medium cursor-pointer">
                    Publish immediately as active live notice
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save}>Save Notice</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
