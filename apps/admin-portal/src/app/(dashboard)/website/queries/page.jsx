'use client';

import React, { useState } from 'react';
import { ContentService } from '@/services/contentService';
import { PERMISSIONS } from '@/constants/rbac';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHeader from '@/components/common/PageHeader';
import CardWrapper from '@/components/Common/CardWrapper';
import { Button, Input, Badge, ConfirmModal } from '@/components/ui';
import {
  Inbox,
  Search,
  Trash2,
  Eye,
  Mail,
  User,
  Clock,
  X,
  Building2,
} from '@/components/icons';

export default function IncubationQueriesPage() {
  const [queries, setQueries] = useState(() => ContentService.getItems('queries'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleUpdateStatus = (id, newStatus) => {
    ContentService.updateItem('queries', id, { status: newStatus });
    const updated = ContentService.getItems('queries');
    setQueries(updated);
    if (selectedQuery && selectedQuery.id === id) {
      setSelectedQuery((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = ContentService.deleteItem('queries', deleteId);
    setQueries(updated);
    if (selectedQuery && selectedQuery.id === deleteId) {
      setSelectedQuery(null);
    }
    setDeleteId(null);
  };

  const filteredQueries = queries.filter((q) => {
    const matchesSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.domain?.toLowerCase().includes(search.toLowerCase()) ||
      q.message?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'New':
        return 'amber';
      case 'Contacted':
        return 'blue';
      case 'Reviewed':
        return 'emerald';
      case 'Archived':
        return 'slate';
      default:
        return 'slate';
    }
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_QUERIES}>
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Page Header */}
        <PageHeader
          icon={Inbox}
          title="Queries"
          description="Track and process startup incubation applications and contact form submissions."
        />

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {['All', 'New', 'Contacted', 'Reviewed', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === status
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {status}
                {status !== 'All' && (
                  <span className="ml-1.5 opacity-75">
                    ({queries.filter((q) => q.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search founder, email, domain..."
              className="w-full md:w-72"
            />
            <Badge variant="slate">Total Queries: {queries.length}</Badge>
          </div>
        </div>

        {/* Tabular Form Table */}
        <CardWrapper className="p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px] sm:min-w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  <th className="py-3 px-3">Founder / Contact</th>
                  <th className="py-3 px-3">Startup Domain</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Message Excerpt</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredQueries.length > 0 ? (
                  filteredQueries.map((query) => (
                    <tr
                      key={query.id}
                      onClick={() => setSelectedQuery(query)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      {/* Founder Info */}
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5 group-hover:text-[#1E40AF] transition-colors">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{query.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{query.email}</span>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                          <span>{query.domain || 'General Query'}</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-medium">
                          {query.stage || 'Concept'}
                        </span>
                      </td>

                      {/* Excerpt */}
                      <td className="py-3 px-3 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed text-[11px]">
                          {query.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{query.submittedAt || 'Recent'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(query.status)}>
                          {query.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedQuery(query)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Trash2}
                            className="hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            onClick={() => setDeleteId(query.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-xs">No incubation queries found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Incubation Query"
          message="Are you sure you want to permanently delete this inquiry?"
        />

        {/* Full Details Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-xl rounded-md bg-white border border-[#E2E8F0] p-6 shadow-xl space-y-5 animate-in zoom-in-95 font-sans">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedQuery.name}</h2>
                    <Badge variant={getStatusBadgeVariant(selectedQuery.status)}>
                      {selectedQuery.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted on {selectedQuery.submittedAt || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedQuery.email}`}
                    className="text-[#1E40AF] font-semibold hover:underline"
                  >
                    {selectedQuery.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                    Phone Contact
                  </span>
                  <span className="text-slate-800 font-semibold">{selectedQuery.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                    Startup Domain
                  </span>
                  <span className="text-slate-800 font-semibold">{selectedQuery.domain || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                    Current Stage
                  </span>
                  <span className="text-slate-800 font-semibold">{selectedQuery.stage || 'Initial Idea'}</span>
                </div>
              </div>

              {/* Full Message */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Complete Inquiry Message</span>
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto font-sans">
                  {selectedQuery.message}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold">Update Query Status:</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={selectedQuery.status === 'New' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleUpdateStatus(selectedQuery.id, 'New')}
                  >
                    New
                  </Button>
                  <Button
                    variant={selectedQuery.status === 'Contacted' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleUpdateStatus(selectedQuery.id, 'Contacted')}
                  >
                    Contacted
                  </Button>
                  <Button
                    variant={selectedQuery.status === 'Reviewed' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleUpdateStatus(selectedQuery.id, 'Reviewed')}
                  >
                    Reviewed
                  </Button>
                  <Button
                    variant={selectedQuery.status === 'Archived' ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => handleUpdateStatus(selectedQuery.id, 'Archived')}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
