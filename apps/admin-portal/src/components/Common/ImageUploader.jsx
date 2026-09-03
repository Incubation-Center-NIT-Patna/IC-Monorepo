'use client';

import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2, Image as ImageIcon } from '@/components/icons';
import ProfileImageUploadModal from './ProfileImageUploadModal';

export default function ImageUploader({
  value = '',
  onChange,
  label = 'Image / Photo',
  placeholder = 'https://... or click upload modal',
  aspectRatio = 'square',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleModalSave = (url) => {
    onChange(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-1.5 text-xs font-sans">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-slate-700 font-bold">{label}</label>
          {value && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Photo Attached</span>
            </span>
          )}
        </div>
      )}

      {/* Main Upload Box & Trigger Controls */}
      <div className="space-y-2">
        {/* Input Bar with Upload Modal Button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E40AF] focus:bg-white transition-all font-mono text-[11px]"
          />

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Live Preview Box or Drag & Drop Trigger Zone */}
        {value ? (
          <div className="relative group rounded-md overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] p-2 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => setIsModalOpen(true)}
                className="relative w-11 h-11 rounded-full overflow-hidden bg-white border-2 border-[#1E40AF] shrink-0 cursor-pointer shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {value.startsWith('data:') ? 'Uploaded Profile Photo' : value.split('/').pop() || 'Image attached'}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Click avatar or Edit button to crop/adjust in modal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pr-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-[#E2E8F0] transition-colors cursor-pointer shadow-2xs"
              >
                Edit / Crop
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 rounded-md bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-[#E2E8F0] transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setIsModalOpen(true)}
            className={`flex flex-col items-center justify-center p-4 rounded-md border-2 border-dashed transition-all cursor-pointer ${
              isDragging
                ? 'border-[#1E40AF] bg-blue-50/50'
                : 'border-[#E2E8F0] hover:border-[#1E40AF] bg-[#F8FAFC] hover:bg-blue-50/30'
            }`}
          >
            <div className="p-2 rounded-full bg-white text-[#1E40AF] mb-1.5 border border-[#E2E8F0] shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Click to open Profile Image Upload Modal
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Select image, drag & drop, and adjust profile avatar
            </p>
          </div>
        )}
      </div>

      {/* Simple Clean Profile Image Upload Modal */}
      <ProfileImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialImage={value}
        title="Upload Profile Photo"
      />
    </div>
  );
}
