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
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  Save,
  X,
  Eye,
} from '@/components/icons';

export default function EventsManagementPage() {
  const { isSuperAdmin } = useAuth();
  const [events, setEvents] = useState(() => ContentService.getItems('events'));
  const [categories, setCategories] = useState(() => CategoryService.getCategories('events'));
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Flagship Event',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 5:00 PM',
    venue: 'Main Auditorium, NIT Patna',
    status: 'Upcoming',
    description: '',
    image: '',
    registrationLink: '#',
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = CategoryService.addCategory('events', newCatInput);
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
      title: '',
      category: categories[0] || 'Flagship Event',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 5:00 PM',
      venue: 'Main Auditorium, NIT Patna',
      status: 'Upcoming',
      description: '',
      image: '',
      registrationLink: '#',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || categories[0] || 'Flagship Event',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '',
      venue: item.venue || '',
      status: item.status || 'Upcoming',
      description: item.description || '',
      image: item.image || '',
      registrationLink: item.registrationLink || '#',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      ContentService.updateItem('events', editingItem.id, formData);
    } else {
      ContentService.addItem('events', formData);
    }
    setEvents(ContentService.getItems('events'));
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('events', deleteId);
    setEvents(updated);
    setDeleteId(null);
  };

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_EVENTS}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={CalendarDays}
          title="Manage Events"
          description="Create and manage summits, workshops, and speaker sessions."
          actionText="Add Event"
          actionIcon={Plus}
          onAction={handleOpenAdd}
        />

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title or category..."
            className="w-full sm:w-80"
          />
          <Badge variant="slate">Total Events: {events.length}</Badge>
        </div>

        {/* Tabular Events Table */}
        <CardWrapper className="p-0 overflow-hidden border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  <th className="py-3 px-4">Event Title & Category</th>
                  <th className="py-3 px-4">Date & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {ev.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={ev.image}
                              alt={ev.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&auto=format&fit=crop&q=80';
                              }}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <span className="w-11 h-11 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-base border border-rose-200 shrink-0">
                              <CalendarDays className="w-5 h-5" />
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                              {ev.title}
                            </div>
                            <Badge variant="amber" className="mt-0.5">
                              {ev.category}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                            <CalendarDays className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{ev.date}</span>
                          </div>
                          {ev.venue && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-xs">{ev.venue}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={ev.status === 'Completed' ? 'slate' : 'emerald'} className="font-bold">
                          {ev.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedEvent(ev)}
                            title="View Full Details"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Edit2}
                            onClick={() => handleOpenEdit(ev)}
                            title="Edit Event"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Trash2}
                            className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            onClick={() => setDeleteId(ev.id)}
                            title="Delete Event"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No events found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-lg bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <CalendarDays className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Event Details</h2>
                    <p className="text-xs text-slate-500">Summit & Workshop Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-40 object-cover rounded-lg border border-slate-200 shadow-2xs"
                  />
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="amber">{selectedEvent.category}</Badge>
                    <Badge variant={selectedEvent.status === 'Completed' ? 'slate' : 'emerald'}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedEvent.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    {selectedEvent.time && (
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedEvent.time}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Venue</span>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{selectedEvent.venue || 'NIT Patna Campus'}</span>
                    </div>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Event Description</span>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                      className="text-xs text-slate-800 leading-relaxed prose prose-xs max-w-none"
                    />
                  </div>
                )}

                {selectedEvent.registrationLink && selectedEvent.registrationLink !== '#' && (
                  <div className="pt-1">
                    <a
                      href={selectedEvent.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1E40AF] hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Event Registration Link</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <Button
                  variant="outline"
                  icon={Edit2}
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    handleOpenEdit(ev);
                  }}
                >
                  Edit Event
                </Button>

                <Button variant="primary" onClick={() => setSelectedEvent(null)}>
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
          title="Delete Event"
          message="Are you sure you want to delete this event listing?"
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-md bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
              <Card.Header>
                <Card.Title>{editingItem ? 'Edit Event' : 'Create New Event'}</Card.Title>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </Card.Header>

              <form onSubmit={handleSave} className="space-y-3">
                <Input label="Event Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Pitchtember 2026: Eastern India Conclave" />

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

                  <Select
                    label="Event Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={['Upcoming', 'Live Today', 'Completed']}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Event Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  <Input label="Timing" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="e.g. 10:00 AM - 5:00 PM" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Venue / Location" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="e.g. Main Auditorium" />
                  <Input label="Registration Link" value={formData.registrationLink} onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })} placeholder="https://..." />
                </div>

                <ImageUploader
                  label="Event Poster / Banner Image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload poster or paste URL"
                />

                <RichTextEditor label="Description (Rich Text)" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Event objectives, speakers, italic/bold..." />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">Save Event</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
