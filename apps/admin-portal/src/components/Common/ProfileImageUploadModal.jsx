'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  UploadCloud,
  Check,
  Trash2,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Loader2,
} from '@/components/icons';

export default function ProfileImageUploadModal({
  isOpen,
  onClose,
  onSave,
  initialImage = '',
  title = 'Upload Profile Photo',
}) {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(initialImage);
      setZoom(1);
      setRotation(0);
      setError('');
    }
  }, [isOpen, initialImage]);

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        setSelectedImage(data.url);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      // Fallback to local Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      setZoom(1);
      setRotation(0);
    }
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    onSave(selectedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />

      <div className="relative w-full max-w-md rounded-xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden font-sans text-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select and adjust your avatar profile image
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center justify-center space-y-5">
          {/* Circular Preview Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-44 h-44 rounded-full overflow-hidden border-4 transition-all cursor-pointer flex items-center justify-center group ${
              isDragging
                ? 'border-[#1E40AF] ring-4 ring-blue-100'
                : 'border-[#1E40AF] hover:border-[#1E3A8A] ring-4 ring-slate-100 shadow-lg'
            }`}
          >
            {selectedImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover transition-transform duration-150"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                  <ImageIcon className="w-5 h-5" />
                  <span>Change Photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 group-hover:text-[#1E40AF]">
                <UploadCloud className="w-8 h-8 mb-1 transition-transform group-hover:scale-110" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-[#1E40AF]">
                  Click or drag photo
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#1E40AF] animate-spin" />
              </div>
            )}
          </div>



          {/* Quick Adjustment Controls */}
          {selectedImage && (
            <div className="w-full bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="text-[11px] text-slate-500">Zoom Adjust</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
                    className="p-1 rounded bg-white border border-[#E2E8F0] hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-[11px]">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
                    className="p-1 rounded bg-white border border-[#E2E8F0] hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#1E40AF]" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[11px] font-semibold text-slate-600 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{selectedImage ? 'Change File' : 'Browse File'}</span>
            </button>

            <div className="flex items-center gap-2">
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setSelectedImage('')}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-[#E2E8F0] transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedImage}
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
