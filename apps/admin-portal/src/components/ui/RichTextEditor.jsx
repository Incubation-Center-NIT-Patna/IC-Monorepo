'use client';

import React, { useState, useRef } from 'react';
import { Eye, Edit2 } from '@/components/icons';

export default function RichTextEditor({
  label,
  value = '',
  onChange,
  placeholder = 'Type rich content here...',
  rows = 4,
  required = false,
  className = '',
  id,
}) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const textareaRef = useRef(null);

  const applyTag = (openTag, closeTag, defaultText = 'text') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';
    const selected = currentVal.substring(start, end);

    const replacement = selected
      ? `${openTag}${selected}${closeTag}`
      : `${openTag}${defaultText}${closeTag}`;

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange({ target: { value: newVal } });

    // Re-focus and reset selection
    setTimeout(() => {
      el.focus();
      const newCursorPos = start + openTag.length + (selected ? selected.length : defaultText.length);
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter destination URL (e.g., https://example.com):', 'https://');
    if (url) {
      applyTag(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#1E40AF] underline">`, '</a>', 'link text');
    }
  };

  const handleClearTags = () => {
    if (!value) return;
    const stripped = value.replace(/<[^>]*>?/gm, '');
    onChange({ target: { value: stripped } });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'edit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'preview' ? 'bg-white text-[#1E40AF] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}

      <div className="rounded-md border border-[#E2E8F0] bg-white overflow-hidden focus-within:border-[#1E40AF] focus-within:ring-1 focus-within:ring-[#1E40AF] transition-all">
        {/* Formatting Toolbar */}
        {activeTab === 'edit' && (
          <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-[#E2E8F0] text-xs">
            <button
              type="button"
              onClick={() => applyTag('<b>', '</b>', 'bold text')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors shadow-2xs"
              title="Bold text"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => applyTag('<i>', '</i>', 'italic text')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 italic font-semibold border border-slate-200 transition-colors shadow-2xs"
              title="Italic text"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => applyTag('<u>', '</u>', 'underlined text')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 underline font-semibold border border-slate-200 transition-colors shadow-2xs"
              title="Underline text"
            >
              U
            </button>
            <span className="w-px h-4 bg-slate-300 mx-0.5" />
            <button
              type="button"
              onClick={() => applyTag('<h4 class="font-bold text-slate-900 mt-2 mb-1">', '</h4>', 'Heading')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors text-[11px] shadow-2xs"
              title="Add Heading"
            >
              H4
            </button>
            <button
              type="button"
              onClick={() => applyTag('<ul class="list-disc pl-4 space-y-1">\n  <li>', '</li>\n</ul>', 'List item')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition-colors text-[11px] shadow-2xs"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => applyTag('<mark class="bg-amber-100 px-1 rounded font-semibold text-amber-900">', '</mark>', 'highlighted text')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-amber-800 font-semibold border border-slate-200 transition-colors text-[11px] shadow-2xs"
              title="Highlight text"
            >
              Highlight
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-blue-700 font-semibold border border-slate-200 transition-colors text-[11px] shadow-2xs"
              title="Insert Link"
            >
              Link
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearTags}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 font-medium text-[10px] border border-slate-200 transition-colors"
                title="Remove formatting HTML tags"
              >
                Clear Tags
              </button>
            </div>
          </div>
        )}

        {/* Content Area: Editor vs Preview */}
        {activeTab === 'edit' ? (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-2.5 text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none font-mono leading-relaxed resize-y"
          />
        ) : (
          <div className="p-3 text-xs text-slate-800 min-h-[100px] max-h-64 overflow-y-auto bg-slate-50 leading-relaxed font-sans border-t border-[#E2E8F0]">
            {value ? (
              <div
                dangerouslySetInnerHTML={{ __html: value }}
                className="prose prose-xs max-w-none text-slate-800 space-y-1.5"
              />
            ) : (
              <span className="text-slate-400 italic">No formatted content to preview yet...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
