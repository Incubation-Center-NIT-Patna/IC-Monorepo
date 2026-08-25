'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { CategoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import { Button, Input, Select, RichTextEditor, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Eye,
  MessageSquare,
} from '@/components/icons';

export default function FaqsManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [faqs, setFaqs] = useState(() => ContentService.getItems('faqs'));
  const [categories, setCategories] = useState(() => CategoryService.getCategories('faqs'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    category: 'General',
    answer: '',
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('faqs', newCatInput);
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
      question: '',
      category: categories[0] || 'General',
      answer: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      category: item.category || categories[0] || 'General',
      answer: item.answer || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    if (editingItem) {
      ContentService.updateItem('faqs', editingItem.id, formData);
    } else {
      ContentService.addItem('faqs', formData);
    }
    setFaqs(ContentService.getItems('faqs'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('faqs', deleteId);
    setFaqs(updated);
    setDeleteId(null);
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_FAQS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={HelpCircle}
          title="Manage FAQs"
          description="Manage frequently asked questions and answers."
          actionText="Add FAQ"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question, answer or category..."
            className="w-full sm:w-80"
          />
          <Badge variant="slate">Total Questions: {faqs.length}</Badge>
        </div>

        {/* Tabular FAQs Table */}
        <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  <th className="py-3 px-4">Question & Headline</th>
                  <th className="py-3 px-4">Topic Category</th>
                  <th className="py-3 px-4">Answer Statement Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <tr
                      key={faq.id}
                      onClick={() => setSelectedFaq(faq)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                            <HelpCircle className="w-4 h-4" />
                          </span>
                          <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors max-w-sm leading-snug">
                            {faq.question}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <Badge variant="emerald" className="font-semibold">
                          {faq.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {faq.answer ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                            className="line-clamp-2 text-slate-600 prose prose-xs max-w-none"
                          />
                        ) : (
                          <span className="text-slate-400 italic">No answer provided</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedFaq(faq)}
                            title="View Full Details"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Edit2}
                            onClick={() => handleOpenEdit(faq)}
                            title="Edit FAQ"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Trash2}
                            className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            onClick={() => setDeleteId(faq.id)}
                            title="Delete FAQ"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No FAQ entries found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* FAQ Detail Modal */}
        {selectedFaq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-lg bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">FAQ Question & Answer Details</h2>
                    <p className="text-xs text-slate-500">Knowledge Base Item</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFaq(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="emerald">{selectedFaq.category}</Badge>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedFaq.question}</h3>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-800 leading-relaxed border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Answer Explanation:</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedFaq.answer }}
                    className="text-xs text-slate-800 leading-relaxed prose prose-xs max-w-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    const faq = selectedFaq;
                    setSelectedFaq(null);
                    handleOpenEdit(faq);
                  }}
                >
                  Edit FAQ
                </Button>

                <Button variant="primary" onClick={() => setSelectedFaq(null)}>
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
          title="Delete FAQ"
          message="Are you sure you want to delete this FAQ entry?"
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit FAQ' : 'Add New FAQ Question'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <Input label="Question Title" required value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="e.g. Who is eligible to apply for incubation at NIT Patna?" />

                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <label className="block text-slate-700 font-semibold">Topic Category</label>
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

                <RichTextEditor label="Answer Statement (Rich Text)" rows={4} required value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} placeholder="Provide clear, concise explanation with bold, italic, list formatting..." />

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save}>Save FAQ</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
