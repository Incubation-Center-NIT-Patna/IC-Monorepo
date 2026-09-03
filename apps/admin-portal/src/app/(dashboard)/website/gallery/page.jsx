'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { CategoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploader from '@/components/Common/ImageUploader';
import PageHeader from '@/components/common/PageHeader';
import { Button, Input, Select, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  Save,
  X,
  Calendar,
} from '@/components/icons';

export default function GalleryManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [gallery, setGallery] = useState(() => ContentService.getItems('gallery'));
  const [categories, setCategories] = useState(() => CategoryService.getCategories('gallery'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Events',
    url: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('gallery', newCatInput);
    if (updated) {
      setCategories(updated);
      setFormData((prev) => ({ ...prev, category: newCatInput.trim() }));
    }
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: categories[0] || 'Events',
      url: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    ContentService.addItem('gallery', formData);
    setGallery(ContentService.getItems('gallery'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('gallery', deleteId);
    setGallery(updated);
    setDeleteId(null);
  };

  const filteredGallery = gallery.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_GALLERY}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={ImageIcon}
          title="Manage Gallery"
          description="Manage campus and event media photos."
          actionText="Add Photo"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caption or category..."
            className="w-full sm:w-80"
          />
          <Badge variant="slate">Total Photos: {gallery.length}</Badge>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item) => (
            <Card key={item.id} padding="p-0" className="group overflow-hidden flex flex-col justify-between">
              <div className="relative h-44 w-full bg-[#F8FAFC] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase bg-white/90 text-slate-900 border border-[#E2E8F0]">
                  {item.category}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between bg-white border-t border-[#E2E8F0]">
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <Button variant="outline" size="xs" icon={Trash2} className="hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(item.id)} />
              </div>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Photo"
          message="Are you sure you want to remove this photo from the gallery?"
        />

        {/* Modal: Add Media */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>Add Photo to Gallery</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <Input label="Caption / Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. IoT Hardware Prototyping Lab" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <label className="block text-slate-700 font-semibold">Category</label>
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
                      <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} options={categories} />
                    )}
                  </div>
                  <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>

                <ImageUploader
                  label="Photo Image *"
                  value={formData.url}
                  onChange={(url) => setFormData({ ...formData, url })}
                  placeholder="Upload gallery image or paste URL"
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Upload Photo</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
