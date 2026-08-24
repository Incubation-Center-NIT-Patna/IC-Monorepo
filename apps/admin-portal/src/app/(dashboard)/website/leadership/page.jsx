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
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Link2,
  ExternalLink,
  Save,
  X,
  Eye,
  Quote,
} from '@/components/icons';

export default function LeadershipManagementPage() {
  const [leaders, setLeaders] = useState(() => ContentService.getItems('leadership'));
  const [editingLeader, setEditingLeader] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('write');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleOpenEdit = (leader) => {
    setEditingLeader({ ...leader });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingLeader({
      id: `leader-${Date.now()}`,
      name: '',
      role: 'Advisory Board Member',
      image: '',
      link: '',
      message: '',
    });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  const handleSaveLeader = (e) => {
    e.preventDefault();
    if (!editingLeader.name.trim()) return;

    if (editingLeader.id && leaders.find((l) => l.id === editingLeader.id)) {
      ContentService.updateItem('leadership', editingLeader.id, editingLeader);
    } else {
      ContentService.addItem('leadership', editingLeader);
    }
    setLeaders(ContentService.getItems('leadership'));
    setIsEditorOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('leadership', deleteId);
    setLeaders(updated);
    setDeleteId(null);
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_LEADERSHIP}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Sparkles}
          title="Manage Leadership"
          description="Manage Director, Professor-in-Charge, and advisory board leadership messages in tabular view."
          actionText="Add Leader"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {savedSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Leadership details updated successfully!</span>
          </div>
        )}

        {/* Tabular Leadership Table */}
        <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Official / Leader</th>
                  <th className="py-3 px-4">Role & Designation</th>
                  <th className="py-3 px-4">Desk Message Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {leaders.map((leader, index) => {
                  const isDirector = leader.id === 'director' || index === 0;
                  return (
                    <tr
                      key={leader.id}
                      onClick={() => setSelectedLeader(leader)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {leader.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={leader.image}
                              alt={leader.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_bharat_gupta_ubqzlo.jpg';
                              }}
                              className="w-11 h-11 aspect-square object-cover border border-slate-200 shrink-0 shadow-2xs"
                              style={{ borderRadius: '50%' }}
                            />
                          ) : (
                            <span
                              className="w-11 h-11 bg-blue-100 text-[#1E40AF] flex items-center justify-center font-bold text-base border border-blue-200 shrink-0"
                              style={{ borderRadius: '50%' }}
                            >
                              {leader.name?.[0] || 'L'}
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                              {leader.name || 'Untitled Leader'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {leader.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div className="space-y-1">
                          <Badge variant={isDirector ? 'blue' : 'amber'} className="font-semibold">
                            {isDirector ? 'Executive Leadership' : 'Professor-in-Charge'}
                          </Badge>
                          <div className="text-xs font-semibold text-[#1E40AF]">{leader.role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {leader.message ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: leader.message }}
                            className="line-clamp-2 italic text-slate-600 prose prose-xs max-w-none"
                          />
                        ) : (
                          <span className="text-slate-400 italic">No message written</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedLeader(leader)}
                            title="View Full Details"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Edit2}
                            onClick={() => handleOpenEdit(leader)}
                            title="Edit Message"
                          />
                          {leader.id !== 'director' && leader.id !== 'pic' && (
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Trash2}
                              className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              onClick={() => setDeleteId(leader.id)}
                              title="Delete Leader"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Leadership Detail Modal */}
        {selectedLeader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-2xl rounded-lg bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1E40AF] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Leadership Profile & Message</h2>
                    <p className="text-xs text-slate-500">Official Executive Statement</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {selectedLeader.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedLeader.image}
                      alt={selectedLeader.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://res.cloudinary.com/ddb6lsyht/image/upload/v1782901328/prof_bharat_gupta_ubqzlo.jpg';
                      }}
                      className="w-20 h-20 aspect-square object-cover border-2 border-blue-200 shrink-0 shadow-xs"
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <span
                      className="w-20 h-20 bg-[#1E40AF] text-white flex items-center justify-center font-bold text-3xl shrink-0"
                      style={{ borderRadius: '50%' }}
                    >
                      {selectedLeader.name?.[0] || 'L'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedLeader.name}</h3>
                    <p className="text-xs font-bold text-[#1E40AF] mt-0.5">{selectedLeader.role}</p>
                    <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <Badge variant="blue">Official Leadership</Badge>
                      {selectedLeader.link && (
                        <a
                          href={selectedLeader.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1E40AF] hover:underline font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>LinkedIn / Profile</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-800 leading-relaxed border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Quote className="w-4 h-4 text-[#1E40AF] shrink-0" />
                    <span>Official Desk Statement:</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedLeader.message || '<p className="italic text-slate-400">No official statement published yet.</p>',
                    }}
                    className="prose prose-xs max-w-none text-slate-800 leading-relaxed pl-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    const leader = selectedLeader;
                    setSelectedLeader(null);
                    handleOpenEdit(leader);
                  }}
                >
                  Edit Message
                </Button>

                <Button variant="primary" onClick={() => setSelectedLeader(null)}>
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
          title="Delete Profile"
          message="Are you sure you want to remove this leadership profile?"
        />

        {/* Edit Modal */}
        {isEditorOpen && editingLeader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in overflow-y-auto font-sans">
            <div className="w-full max-w-4xl rounded-md bg-white border border-[#E2E8F0] shadow-xl overflow-hidden my-auto animate-in zoom-in-95">
              <Card.Header className="px-5 py-3.5 bg-[#F8FAFC]">
                <Card.Title icon={Edit2}>
                  {editingLeader.name ? `Editing: ${editingLeader.name}` : 'Create Leadership Profile'}
                </Card.Title>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="xs" icon={Eye} onClick={() => setEditorTab(editorTab === 'write' ? 'preview' : 'write')}>
                    {editorTab === 'preview' ? 'Back to Editor' : 'Live Preview'}
                  </Button>
                  <button onClick={() => setIsEditorOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card.Header>

              <form onSubmit={handleSaveLeader} className="p-5 sm:p-6 space-y-4">
                {editorTab === 'write' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5 space-y-3">
                      <Input label="Full Name" required value={editingLeader.name} onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })} placeholder="e.g. Prof. Pradip K. Ray" />
                      <Input label="Designation / Role Title" required value={editingLeader.role} onChange={(e) => setEditingLeader({ ...editingLeader, role: e.target.value })} placeholder="e.g. Director, NIT Patna" />
                      <ImageUploader label="Portrait Image *" value={editingLeader.image} onChange={(url) => setEditingLeader({ ...editingLeader, image: url })} placeholder="Upload portrait photo or paste URL" />
                      <Input label="LinkedIn or Profile URL" value={editingLeader.link} onChange={(e) => setEditingLeader({ ...editingLeader, link: e.target.value })} placeholder="https://linkedin.com/in/..." />
                    </div>

                    <div className="lg:col-span-7 flex flex-col space-y-1.5">
                      <RichTextEditor label="Official Desk Message & Vision Statement (Rich Text)" rows={12} required value={editingLeader.message} onChange={(e) => setEditingLeader({ ...editingLeader, message: e.target.value })} placeholder="Write the complete official message with bold, italic, lists..." />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {editingLeader.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={editingLeader.image} alt={editingLeader.name} className="w-16 h-16 rounded-full object-cover border border-blue-200" />
                      ) : (
                        <span className="w-16 h-16 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-2xl">
                          {editingLeader.name?.[0] || 'L'}
                        </span>
                      )}
                      <div className="text-center sm:text-left">
                        <Badge variant="blue">Live Preview Card</Badge>
                        <h2 className="text-base font-bold text-slate-900 mt-1">{editingLeader.name || 'Leader Full Name'}</h2>
                        <p className="text-xs text-[#1E40AF] font-semibold">{editingLeader.role || 'Designation'}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-md bg-white border border-[#E2E8F0]">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Official Statement:</h4>
                      <div
                        dangerouslySetInnerHTML={{ __html: editingLeader.message || '<p className="italic text-slate-400">No message content entered yet.</p>' }}
                        className="text-xs text-slate-800 leading-relaxed prose prose-xs max-w-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsEditorOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Save & Publish</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
