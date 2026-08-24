'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploader from '@/components/Common/ImageUploader';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import { Button, Input, Textarea, RichTextEditor, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  Mic,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Eye,
  Quote,
} from '@/components/icons';

export default function TalksManagementPage() {
  const [talks, setTalks] = useState(() => ContentService.getItems('talks'));
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedTalk, setSelectedTalk] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    photo: '',
    content: '',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: '',
      photo: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      photo: item.photo || item.image || '',
      content: item.content || item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      ContentService.updateItem('talks', editingItem.id, formData);
    } else {
      ContentService.addItem('talks', formData);
    }
    setTalks(ContentService.getItems('talks'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('talks', deleteId);
    setTalks(updated);
    setDeleteId(null);
  };

  const filteredTalks = talks.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role?.toLowerCase().includes(search.toLowerCase()) ||
      t.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_TALKS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Mic}
          title="iEntrepreneur Talks"
          description="Manage guest speaker sessions, founder keynotes, and entrepreneurship talk profiles in tabular view."
          actionText="Add Talk Session"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by speaker name, role or talk summary..."
            className="w-full sm:w-80"
          />
          <Badge variant="slate">Total Talks: {talks.length}</Badge>
        </div>

        {/* Tabular Talks Table */}
        <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Speaker</th>
                  <th className="py-3 px-4">Role / Organization</th>
                  <th className="py-3 px-4">Talk Keynote Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredTalks.length > 0 ? (
                  filteredTalks.map((talk) => {
                    const photoUrl = talk.photo || talk.image;
                    return (
                      <tr
                        key={talk.id}
                        onClick={() => setSelectedTalk(talk)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            {photoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={photoUrl}
                                alt={talk.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                                }}
                                className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base border border-amber-200 shrink-0">
                                {talk.name[0]}
                              </span>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                                {talk.name}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {talk.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          <Badge variant="amber" className="font-semibold">
                            {talk.role || 'Keynote Speaker'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          {talk.content ? (
                            <p className="line-clamp-2 italic text-slate-600">
                              "{talk.content}"
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">No summary provided</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Eye}
                              onClick={() => setSelectedTalk(talk)}
                              title="View Full Details"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Edit2}
                              onClick={() => handleOpenEdit(talk)}
                              title="Edit Talk"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Trash2}
                              className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              onClick={() => setDeleteId(talk.id)}
                              title="Delete Talk"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No entrepreneur talks found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Talk Detail Modal */}
        {selectedTalk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-lg bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Speaker Talk Details</h2>
                    <p className="text-xs text-slate-500">iEntrepreneur Talk Session Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTalk(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {selectedTalk.photo || selectedTalk.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedTalk.photo || selectedTalk.image}
                      alt={selectedTalk.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30 shrink-0 shadow-xs"
                    />
                  ) : (
                    <span className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl border border-amber-200 shrink-0">
                      {selectedTalk.name[0]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedTalk.name}</h3>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedTalk.role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="amber">iEntrepreneur Speaker</Badge>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {selectedTalk.id}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/60 rounded-lg p-4 text-xs text-slate-800 leading-relaxed border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Quote className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Talk Keynote & Speaker Bio:</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedTalk.content || selectedTalk.description || '<p className="italic text-slate-400">No detailed content written.</p>',
                    }}
                    className="prose prose-xs max-w-none text-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    const talk = selectedTalk;
                    setSelectedTalk(null);
                    handleOpenEdit(talk);
                  }}
                >
                  Edit Talk Entry
                </Button>

                <Button variant="primary" onClick={() => setSelectedTalk(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Speaker Talk"
          message="Are you sure you want to remove this talk entry from the portal?"
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit Speaker Talk' : 'Add New Speaker Talk'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Speaker Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Antesh Anand"
                  />
                  <Input
                    label="Role / Designation"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Founder, Brand Medix"
                  />
                </div>

                <ImageUploader
                  label="Speaker Headshot / Photo"
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                  placeholder="Upload photo or paste Cloudinary/image URL"
                />

                <RichTextEditor
                  label="Talk Summary / Speaker Bio (Rich Text)"
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe speaker achievements, talk session details..."
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save}>Save Talk</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
