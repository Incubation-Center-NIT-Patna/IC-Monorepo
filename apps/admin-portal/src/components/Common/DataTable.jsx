'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from '@/components/icons';

/**
 * Reusable DataTable component
 * 
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column configs: { key, header, render?, sortable?, className? }
 * @param {string} searchPlaceholder - Placeholder for search bar
 * @param {Array} searchKeys - Array of string keys to search in each object
 * @param {number} defaultPageSize - Initial rows per page (default 10)
 * @param {Array} pageSizeOptions - Array of page size numbers
 * @param {React.ReactNode} actions - Optional right-side header controls / action buttons
 * @param {string} emptyMessage - Message to display when no records are found
 */
export default function DataTable({
  data = [],
  columns = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  actions = null,
  emptyMessage = 'No records found matching your criteria.',
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase().trim();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }
      return Object.values(item).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, search, searchKeys]);

  // 2. Column Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key, sortable) => {
    if (sortable === false) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Toolbar: Search + Page Size + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E2E8F0] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF] transition-all"
            />
          </div>

          {/* Rows per page dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <span className="hidden md:inline">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 text-xs font-semibold rounded-md border border-[#E2E8F0] bg-white text-slate-800 focus:outline-none focus:border-[#1E40AF] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Actions Slot */}
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Table Surface */}
      <div className="rounded-md border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortConfig.key === col.key;
                  const isSortable = col.sortable !== false;

                  return (
                    <th
                      key={col.key}
                      onClick={() => isSortable && handleSort(col.key, col.sortable)}
                      className={`py-3 px-4 select-none ${col.className || ''} ${
                        isSortable ? 'cursor-pointer hover:text-slate-900 transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {isSortable && isSorted && (
                          <span className="text-[#1E40AF]">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3 px-4 ${col.className || ''}`}>
                        {col.render ? col.render(item, idx) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 px-4 text-center text-slate-500"
                  >
                    <p className="font-semibold text-slate-800 mb-1">{emptyMessage}</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Summary + Pagination Controls */}
        <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Showing <strong className="text-slate-900 font-semibold">{startIndex}</strong> to{' '}
            <strong className="text-slate-900 font-semibold">{endIndex}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{totalItems}</strong> records
          </div>

          {/* Pagination Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 1 && p <= currentPage + 1)
                  );
                })
                .map((pageNum, index, arr) => {
                  const prev = arr[index - 1];
                  const hasGap = prev && pageNum - prev > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {hasGap && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#1E40AF] text-white'
                            : 'bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
