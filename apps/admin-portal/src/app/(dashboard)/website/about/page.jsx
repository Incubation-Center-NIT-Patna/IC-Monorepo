'use client';

import React, { useState, useEffect } from 'react';
import { ContentService } from '@/services/contentService';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploader from '@/components/Common/ImageUploader';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import Toast from '@/components/Common/Toast';
import { Button, Input, Textarea, Badge, Card, ConfirmModal } from '@/components/ui';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Sparkles,
  HeartHandshake,
  Eye,
} from '@/components/icons';

// Helper to extract plain text and bullet points from existing aboutHtml string
function parseHtmlToFields(html = '') {
  if (!html) return { overview: '', bullets: [] };

  // Strip ul/ol list items into bullets array
  const listMatches = [...html.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
  const bullets = listMatches.map((m) => m[1].replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);

  // Strip main paragraphs for overview text
  const overviewHtml = html.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, '').replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, '');
  const overview = overviewHtml.replace(/<[^>]*>?/gm, '').trim();

  return {
    overview: overview || html.replace(/<[^>]*>?/gm, '').trim(),
    bullets: bullets.length > 0 ? bullets : [
      'Provide aspiring entrepreneurs with essential resources and networking opportunities.',
      'Highlight notable successes and inspiring future generations of innovators.',
      'Foster innovation and resilience within the NIT Patna startup community.'
    ]
  };
}

// Helper to convert plain fields back to clean HTML for storage
function compileFieldsToHtml(overview, bullets) {
  const paras = (overview || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p className="leading-relaxed">${p}</p>`)
    .join('\n');

  const listItems = (bullets || [])
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<li>${b}</li>`)
    .join('\n');

  const listHtml = listItems
    ? `\n<ul className="space-y-3 mt-4 list-disc pl-5">\n${listItems}\n</ul>`
    : '';

  return paras + listHtml;
}

export default function AboutSectionEditorPage() {
  const [aboutData, setAboutData] = useState(() => ContentService.getAboutSection());
  const [activeTab, setActiveTab] = useState('statement'); // 'statement', 'pics', 'vision', 'support'
  const [toast, setToast] = useState(null);

  // Non-technical About Statement State (No raw HTML required!)
  const [overviewText, setOverviewText] = useState('');
  const [bulletPoints, setBulletPoints] = useState([]);

  // Detail Modal States
  const [selectedVision, setSelectedVision] = useState(null);
  const [selectedSupport, setSelectedSupport] = useState(null);

  // Vision Card Modal State
  const [visionModalOpen, setVisionModalOpen] = useState(false);
  const [editingVisionIndex, setEditingVisionIndex] = useState(null);
  const [visionForm, setVisionForm] = useState({ step: '', title: '', tagline: '', description: '' });

  // Support Item Modal State
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [editingSupportIndex, setEditingSupportIndex] = useState(null);
  const [supportForm, setSupportForm] = useState({
    name: '',
    title: '',
    desc: '',
    img: '',
    btnText: '',
    link: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'vision' | 'support', index: number }

  // Load plain text fields from HTML on mount
  useEffect(() => {
    const { overview, bullets } = parseHtmlToFields(aboutData.aboutHtml || '');
    setOverviewText(overview);
    setBulletPoints(bullets);
  }, [aboutData.aboutHtml]);

  const handleSaveAll = () => {
    const compiledHtml = compileFieldsToHtml(overviewText, bulletPoints);
    const updatedData = {
      ...aboutData,
      aboutHtml: compiledHtml,
    };
    ContentService.saveAboutSection(updatedData);
    setAboutData(updatedData);
    setToast({ type: 'success', message: 'About section updated successfully!' });
  };

  // Bullet Points Management Handlers
  const handleAddBullet = () => {
    setBulletPoints((prev) => [...prev, '']);
  };

  const handleUpdateBullet = (index, val) => {
    setBulletPoints((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveBullet = (index) => {
    setBulletPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Vision Card Handlers
  const handleOpenAddVision = () => {
    setEditingVisionIndex(null);
    setVisionForm({
      step: `0${(aboutData.visionPillars?.length || 0) + 1}`,
      title: '',
      tagline: '',
      description: '',
    });
    setVisionModalOpen(true);
  };

  const handleOpenEditVision = (index) => {
    setEditingVisionIndex(index);
    const item = aboutData.visionPillars[index];
    setVisionForm({
      step: item.step || `0${index + 1}`,
      title: item.title || '',
      tagline: item.tagline || '',
      description: item.description || '',
    });
    setVisionModalOpen(true);
  };

  const handleSaveVision = (e) => {
    e.preventDefault();
    if (!visionForm.title.trim()) return;

    const list = [...(aboutData.visionPillars || [])];
    const newItem = {
      id: editingVisionIndex !== null ? list[editingVisionIndex].id : `vis-${Date.now()}`,
      ...visionForm,
    };

    if (editingVisionIndex !== null) {
      list[editingVisionIndex] = newItem;
    } else {
      list.push(newItem);
    }

    setAboutData({ ...aboutData, visionPillars: list });
    setVisionModalOpen(false);
  };

  // Support Item Handlers
  const handleOpenAddSupport = () => {
    setEditingSupportIndex(null);
    setSupportForm({
      name: '',
      title: '',
      desc: '',
      img: '',
      btnText: 'Learn more',
      link: '#',
    });
    setSupportModalOpen(true);
  };

  const handleOpenEditSupport = (index) => {
    setEditingSupportIndex(index);
    const item = aboutData.supportSlides[index];
    setSupportForm({
      name: item.name || '',
      title: item.title || '',
      desc: item.desc || '',
      img: item.img || '',
      btnText: item.btnText || 'Learn more',
      link: item.link || '#',
    });
    setSupportModalOpen(true);
  };

  const handleSaveSupport = (e) => {
    e.preventDefault();
    if (!supportForm.name.trim()) return;

    const list = [...(aboutData.supportSlides || [])];
    const newItem = {
      id: editingSupportIndex !== null ? list[editingSupportIndex].id : `sup-${Date.now()}`,
      ...supportForm,
    };

    if (editingSupportIndex !== null) {
      list[editingSupportIndex] = newItem;
    } else {
      list.push(newItem);
    }

    setAboutData({ ...aboutData, supportSlides: list });
    setSupportModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'vision') {
      const list = aboutData.visionPillars.filter((_, idx) => idx !== deleteConfirm.index);
      setAboutData({ ...aboutData, visionPillars: list });
    } else if (deleteConfirm.type === 'support') {
      const list = aboutData.supportSlides.filter((_, idx) => idx !== deleteConfirm.index);
      setAboutData({ ...aboutData, supportSlides: list });
    }
    setDeleteConfirm(null);
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_ABOUT}>
      <div className="space-y-5 animate-in fade-in duration-200">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Page Header */}
        <PageHeader
          icon={FileText}
          title="About Section Editor"
          description="Manage website About statement, campus pictures, vision pillars, and support initiatives."
          actionText="Save All Changes"
          actionIcon={Save}
          onAction={handleSaveAll}
        />

        {/* SECTION 1: ABOUT OVERVIEW & HIGHLIGHTS */}
        <div className="space-y-6">
          <Card padding="p-6" className="space-y-5 bg-white border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1E40AF]" />
                  <span>1. About Overview & Mission Statement</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Write plain text describing the Incubation Center. No HTML or technical code needed!
                </p>
              </div>
              <Badge variant="blue">Simple Text Form</Badge>
            </div>

            {/* Main Overview Paragraphs */}
            <Textarea
              label="Main Incubation Overview & Introduction"
              rows={6}
              value={overviewText}
              onChange={(e) => setOverviewText(e.target.value)}
              placeholder="Describe the Incubation Center at NIT Patna, its mission, facilities, and core objectives..."
              className="text-xs leading-relaxed"
            />

            {/* Key Bullet Highlights Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-900">
                    Key Objectives & Highlight Points
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Add bullet points shown below the main overview statement.
                  </p>
                </div>
                <Button variant="outline" size="xs" icon={Plus} onClick={handleAddBullet}>
                  Add Highlight Point
                </Button>
              </div>

              <div className="space-y-2.5">
                {bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-in fade-in">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1E40AF] text-xs font-bold flex items-center justify-center shrink-0 border border-blue-200">
                      {idx + 1}
                    </span>
                    <Input
                      value={point}
                      onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                      placeholder={`Highlight point ${idx + 1}...`}
                      className="flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Remove highlight point"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION 2: CAMPUS GALLERY HEADER */}
          <Card padding="p-5" className="space-y-4 bg-white border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
                  <span>2. Main Campus Header Picture</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Featured campus banner photo displayed on the main About page.</p>
              </div>
              <Badge variant="blue">Primary Banner Asset</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <ImageUploader
                label="Campus Image URL"
                value={aboutData.campusImage || ''}
                onChange={(url) => setAboutData({ ...aboutData, campusImage: url })}
                placeholder="Upload or paste image URL..."
              />

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 block">Header Image Preview:</span>
                {aboutData.campusImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={aboutData.campusImage}
                    alt="Campus Header"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.collegedunia.com/public/college_data/images/campusimage/1611227237IMG_20201103_111253.jpg';
                    }}
                    className="w-full h-44 object-cover rounded-md border border-[#E2E8F0] shadow-2xs"
                  />
                ) : (
                  <div className="w-full h-44 bg-slate-100 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                    No Banner Image Set
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* SECTION 3: VISION PILLARS TABULAR TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>3. Vision Pillars Table</span>
                </h3>
                <p className="text-xs text-slate-500">Strategic incubation pillars and core objectives in tabular view.</p>
              </div>
              <Button variant="primary" size="xs" icon={Plus} onClick={handleOpenAddVision}>
                Add Vision Pillar
              </Button>
            </div>

            {/* Vision Pillars Data Table */}
            <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Step & Title</th>
                      <th className="py-3 px-4">Tagline / Subtitle</th>
                      <th className="py-3 px-4">Description Summary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {(aboutData.visionPillars || []).map((pillar, idx) => (
                      <tr
                        key={pillar.id || idx}
                        onClick={() => setSelectedVision(pillar)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                              {pillar.step || `0${idx + 1}`}
                            </span>
                            <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                              {pillar.title}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {pillar.tagline || <span className="text-slate-400 italic">No Tagline</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          <p className="line-clamp-2 text-slate-600">{pillar.description}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Eye}
                              onClick={() => setSelectedVision(pillar)}
                              title="View Details"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Edit2}
                              onClick={() => handleOpenEditVision(idx)}
                              title="Edit Vision Pillar"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Trash2}
                              className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              onClick={() => setDeleteConfirm({ type: 'vision', index: idx })}
                              title="Delete Vision Pillar"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardWrapper>
          </div>

          {/* SECTION 4: HOW WE SUPPORT TABULAR TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#1E40AF]" />
                  <span>4. How We Support Section</span>
                </h3>
                <p className="text-xs text-slate-500">Mentorship, funding, workspace, and networking support initiatives in tabular view.</p>
              </div>
              <Button variant="primary" size="xs" icon={Plus} onClick={handleOpenAddSupport}>
                Add Support Initiative
              </Button>
            </div>

            {/* Support Initiatives Data Table */}
            <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3 px-4">Initiative Name & Title</th>
                      <th className="py-3 px-4">Category Tag</th>
                      <th className="py-3 px-4">Description Summary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {(aboutData.supportSlides || []).map((slide, idx) => (
                      <tr
                        key={slide.id || idx}
                        onClick={() => setSelectedSupport(slide)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            {slide.img ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={slide.img}
                                alt={slide.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&auto=format&fit=crop&q=80';
                                }}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <span className="w-11 h-11 rounded-lg bg-blue-100 text-[#1E40AF] flex items-center justify-center font-bold text-base border border-blue-200 shrink-0">
                                {slide.name?.[0] || 'S'}
                              </span>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                                {slide.title}
                              </div>
                              <span className="text-[11px] text-slate-500 font-normal">{slide.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <Badge variant="blue" className="font-semibold">
                            {slide.name || 'Support'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          <p className="line-clamp-2 text-slate-600">{slide.desc}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Eye}
                              onClick={() => setSelectedSupport(slide)}
                              title="View Details"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Edit2}
                              onClick={() => handleOpenEditSupport(idx)}
                              title="Edit Support Card"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Trash2}
                              className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              onClick={() => setDeleteConfirm({ type: 'support', index: idx })}
                              title="Delete Support Card"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardWrapper>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to remove this item from the About section?"
        />

        {/* Vision Modal */}
        {visionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingVisionIndex !== null ? 'Edit Vision Card' : 'Add Vision Card'}</Card.Title>
                <button onClick={() => setVisionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSaveVision} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Step #"
                    value={visionForm.step}
                    onChange={(e) => setVisionForm({ ...visionForm, step: e.target.value })}
                    placeholder="e.g. 01"
                  />
                  <div className="col-span-2">
                    <Input
                      label="Vision Card Title"
                      required
                      value={visionForm.title}
                      onChange={(e) => setVisionForm({ ...visionForm, title: e.target.value })}
                      placeholder="e.g. Nurture Entrepreneurship"
                    />
                  </div>
                </div>

                <Input
                  label="Tagline / Subtitle"
                  value={visionForm.tagline}
                  onChange={(e) => setVisionForm({ ...visionForm, tagline: e.target.value })}
                  placeholder="e.g. Empowering Passionate Creators"
                />

                <Textarea
                  label="Vision Description"
                  rows={4}
                  required
                  value={visionForm.description}
                  onChange={(e) => setVisionForm({ ...visionForm, description: e.target.value })}
                  placeholder="Detailed mission statement and objective..."
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setVisionModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save}>Save Pillar</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Support Item Modal */}
        {supportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingSupportIndex !== null ? 'Edit Support Card' : 'Add Support Card'}</Card.Title>
                <button onClick={() => setSupportModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSaveSupport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Tag / Name"
                    required
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    placeholder="e.g. Mentorship, Funding"
                  />
                  <Input
                    label="Headline Title"
                    required
                    value={supportForm.title}
                    onChange={(e) => setSupportForm({ ...supportForm, title: e.target.value })}
                    placeholder="e.g. Guiding your vision to reality."
                  />
                </div>

                <Textarea
                  label="Description"
                  rows={4}
                  required
                  value={supportForm.desc}
                  onChange={(e) => setSupportForm({ ...supportForm, desc: e.target.value })}
                  placeholder="Detailed explanation of support offered..."
                />

                <ImageUploader
                  label="Picture 1 / Illustration Asset"
                  value={supportForm.img}
                  onChange={(url) => setSupportForm({ ...supportForm, img: url })}
                  placeholder="Upload image or paste image URL"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Button Text"
                    value={supportForm.btnText}
                    onChange={(e) => setSupportForm({ ...supportForm, btnText: e.target.value })}
                    placeholder="e.g. Explore"
                  />
                  <Input
                    label="Action Link (URL)"
                    value={supportForm.link}
                    onChange={(e) => setSupportForm({ ...supportForm, link: e.target.value })}
                    placeholder="e.g. /team/faculty or #idea"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setSupportModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save}>Save Support</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
