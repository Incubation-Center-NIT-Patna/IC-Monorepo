'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { CategoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploader from '@/components/Common/ImageUploader';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import { Button, Input, Select, RichTextEditor, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  Rocket,
  Plus,
  Edit2,
  Trash2,
  Building2,
  DollarSign,
  ExternalLink,
  Search,
  Save,
  X,
  Eye,
} from '@/components/icons';

export default function IncubationsManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [incubations, setIncubations] = useState(() => ContentService.getItems('incubations'));
  const [categories, setCategories] = useState(() => CategoryService.getCategories('incubations'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIncubation, setSelectedIncubation] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    founder: '',
    funding: '',
    status: 'Incubated',
    website: '',
    image: '',
    description: '',
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('incubations', newCatInput);
    if (updated) {
      setCategories(updated);
      setFormData((prev) => ({ ...prev, sector: newCatInput.trim() }));
    }
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sector: categories[0] || 'CleanTech',
      founder: '',
      funding: '',
      status: 'Incubated',
      website: '',
      image: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sector: item.sector || categories[0] || 'CleanTech',
      founder: item.founder || '',
      funding: item.funding || '',
      status: item.status || 'Incubated',
      website: item.website || '',
      image: item.image || '',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      ContentService.updateItem('incubations', editingItem.id, formData);
    } else {
      ContentService.addItem('incubations', formData);
    }
    setIncubations(ContentService.getItems('incubations'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('incubations', deleteId);
    setIncubations(updated);
    setDeleteId(null);
  };

  const filteredIncubations = incubations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sector?.toLowerCase().includes(search.toLowerCase()) ||
      s.founder?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_INCUBATIONS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Rocket}
          title="Manage Incubations"
          description="Manage incubated ventures, startups, and founder profiles in tabular view."
          actionText="Add Incubation"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, founder or sector..."
            className="w-full sm:w-80"
          />
          <Badge variant="slate">Total Incubations: {incubations.length}</Badge>
        </div>

        {/* Tabular Incubations Table */}
        <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Startup Venture & Founder</th>
                  <th className="py-3 px-4">Sector / Domain</th>
                  <th className="py-3 px-4">Funding Status</th>
                  <th className="py-3 px-4">Incubation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredIncubations.length > 0 ? (
                  filteredIncubations.map((startup) => (
                    <tr
                      key={startup.id}
                      onClick={() => setSelectedIncubation(startup)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {startup.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={startup.image}
                              alt={startup.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80';
                              }}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs bg-slate-50"
                            />
                          ) : (
                            <span className="w-11 h-11 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base border border-purple-200 shrink-0 shadow-2xs">
                              {startup.name[0]}
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                              {startup.name}
                            </div>
                            <span className="text-[11px] text-slate-500 font-normal">
                              Founder: {startup.founder || 'Student Cohort'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{startup.sector}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {startup.funding ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] text-[11px] font-bold border border-blue-200">
                            <DollarSign className="w-3 h-3 shrink-0" />
                            <span>{startup.funding}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Bootstrapped</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={startup.status === 'Graduated' ? 'emerald' : startup.status === 'Incubated' ? 'blue' : 'amber'}
                          className="font-bold"
                        >
                          {startup.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedIncubation(startup)}
                            title="View Full Details"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Edit2}
                            onClick={() => handleOpenEdit(startup)}
                            title="Edit Venture"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Trash2}
                            className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            onClick={() => setDeleteId(startup.id)}
                            title="Delete Venture"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No incubation ventures found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Incubation Detail Modal */}
        {selectedIncubation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-lg bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Rocket className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Incubation Venture Details</h2>
                    <p className="text-xs text-slate-500">Startup Profile Breakdown</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIncubation(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {selectedIncubation.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedIncubation.image}
                      alt={selectedIncubation.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0 shadow-xs bg-white"
                    />
                  ) : (
                    <span className="w-16 h-16 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-2xl border border-purple-200 shrink-0">
                      {selectedIncubation.name[0]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedIncubation.name}</h3>
                      <Badge
                        variant={selectedIncubation.status === 'Graduated' ? 'emerald' : selectedIncubation.status === 'Incubated' ? 'blue' : 'amber'}
                        className="font-bold shrink-0"
                      >
                        {selectedIncubation.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      Founder: {selectedIncubation.founder || 'Student Cohort'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedIncubation.sector}</span>
                    </div>
                  </div>
                </div>

                {selectedIncubation.funding && (
                  <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Grant & Investment Support:</span>
                    <span className="font-bold text-[#1E40AF] flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedIncubation.funding}
                    </span>
                  </div>
                )}

                {selectedIncubation.description && (
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Value Proposition & Description</span>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedIncubation.description }}
                      className="text-xs text-slate-800 leading-relaxed prose prose-xs max-w-none"
                    />
                  </div>
                )}

                {selectedIncubation.website && (
                  <div>
                    <a
                      href={selectedIncubation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1E40AF] hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit Company Official Website</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    const startup = selectedIncubation;
                    setSelectedIncubation(null);
                    handleOpenEdit(startup);
                  }}
                >
                  Edit Venture
                </Button>

                <Button variant="primary" onClick={() => setSelectedIncubation(null)}>
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
          title="Delete Incubation Venture"
          message="Are you sure you want to delete this incubation entry? This action cannot be undone."
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit Incubation Venture' : 'Add New Incubation Venture'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Venture Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Shekhar Telesystems" />
                  <Input label="Founder(s)" value={formData.founder} onChange={(e) => setFormData({ ...formData, founder: e.target.value })} placeholder="e.g. Alok Shekhar" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-semibold text-xs">Sector / Domain</label>
                      {isSuperAdmin && (
                        <button type="button" onClick={() => setShowAddCat((p) => !p)} className="text-[10px] text-[#1E40AF] hover:underline font-semibold">
                          + Add Sector
                        </button>
                      )}
                    </div>
                    {showAddCat ? (
                      <div className="flex items-center gap-1">
                        <Input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder="New..." />
                        <Button size="xs" onClick={handleAddCategory}>Save</Button>
                      </div>
                    ) : (
                      <Select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} options={categories} />
                    )}
                  </div>

                  <Select
                    label="Incubation Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={['Incubated', 'Pre-Incubation', 'Graduated']}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Funding Status" value={formData.funding} onChange={(e) => setFormData({ ...formData, funding: e.target.value })} placeholder="e.g. Seed Grant (₹10 Lakhs)" />
                  <Input label="Website URL" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." />
                </div>

                <ImageUploader
                  label="Venture Logo / Brand Asset"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload logo or paste URL"
                />

                <RichTextEditor label="Description / Value Proposition (Rich Text)" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe core innovation, italic/bold/bullet lists..." />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Save Incubation</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
