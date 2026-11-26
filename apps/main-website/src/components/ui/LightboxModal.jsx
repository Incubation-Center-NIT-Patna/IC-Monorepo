'use client';

import React, { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  DownloadIcon,
} from '@/components/icons';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinary';

const emptySubscribe = () => () => {};

/** Lightbox Modal Component with Zoom, Pan (Hand Movement), and Download */
export default function LightboxModal({
  images = [],
  activeIndex = null,
  onClose,
  onIndexChange,
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchStartXRef = useRef(0);

  const total = images.length;
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < total;
  const currentImage = isOpen ? images[activeIndex] : null;

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handlePrev = useCallback(() => {
    setIsImageLoading(true);
    resetView();
    if (onIndexChange && activeIndex !== null) {
      onIndexChange(activeIndex === 0 ? total - 1 : activeIndex - 1);
    }
  }, [activeIndex, onIndexChange, total, resetView]);

  const handleNext = useCallback(() => {
    setIsImageLoading(true);
    resetView();
    if (onIndexChange && activeIndex !== null) {
      onIndexChange(activeIndex === total - 1 ? 0 : activeIndex + 1);
    }
  }, [activeIndex, onIndexChange, total, resetView]);

  const handleClose = useCallback(() => {
    resetView();
    onClose?.();
  }, [resetView, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleNext, handlePrev, handleClose]);

  if (!isMounted || typeof document === 'undefined') return null;

  const fullImageUrl = currentImage
    ? getOptimizedCloudinaryUrl(currentImage.fullSrc || currentImage.src, { width: 1600 })
    : '';

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    if (zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    setPan({
      x: dragStartRef.current.panX + (e.touches[0].clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.touches[0].clientY - dragStartRef.current.y),
    });
  };

  const handleTouchEnd = (e) => {
    if (!isOpen) return;
    setIsDragging(false);
    if (zoom <= 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartXRef.current - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) handleNext();
        else handlePrev();
      }
    }
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((z) => {
      const next = Math.min(3, Math.max(0.5, Number((z + delta).toFixed(2))));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (zoom > 1) {
      resetView();
    } else {
      setZoom(2);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!fullImageUrl) return;
    try {
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${(currentImage?.caption || 'gallery-photo').replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fullImageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] w-screen h-screen bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none"
          onClick={handleClose}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-4 z-[1000000] text-white"
          >
            <div className="min-w-0">
              {currentImage.caption && (
                <p className="text-sm font-semibold truncate">{currentImage.caption}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-white/60">
                {currentImage.category && <span>{currentImage.category}</span>}
                <span>
                  {currentImage.category ? '· ' : ''}
                  {activeIndex + 1} / {total}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => {
                    const next = Math.max(0.5, Number((z - 0.25).toFixed(2)));
                    if (next <= 1) setPan({ x: 0, y: 0 });
                    return next;
                  })
                }
                aria-label="Zoom out"
                title="Zoom Out"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
              >
                <ZoomOutIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono min-w-[44px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                aria-label="Zoom in"
                title="Zoom In"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
              >
                <ZoomInIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset zoom"
                title="Reset View"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
              >
                <RotateCcwIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Download photo"
                title="Download"
                className="p-2 rounded-lg bg-white/10 hover:bg-[#0ef]/20 border border-white/15 hover:border-[#0ef] text-white hover:text-[#0ef] transition-colors cursor-pointer"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close lightbox"
                title="Close (Esc)"
                className="p-2 rounded-lg bg-white/15 hover:bg-rose-600 border border-white/20 text-white transition-colors cursor-pointer ml-1"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Image Area */}
          <div
            onWheel={handleWheel}
            className="relative flex-1 flex items-center justify-center overflow-hidden"
          >
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 z-[1000000] w-11 h-11 rounded-full bg-white/10 hover:bg-[#0ef]/20 border border-white/20 hover:border-[#0ef] text-white hover:text-[#0ef] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}

            <div className="relative flex items-center justify-center max-w-[92vw] max-h-[82vh]">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-10 h-10 border-4 border-[#0ef]/20 border-t-[#0ef] rounded-full animate-spin" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullImageUrl}
                alt={currentImage.alt || currentImage.caption || 'Gallery photo'}
                draggable={false}
                onLoad={() => setIsImageLoading(false)}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
                className={`max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl ${
                  isDragging
                    ? 'cursor-grabbing transition-none'
                    : 'cursor-grab transition-transform duration-150'
                }`}
              />
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 z-[1000000] w-11 h-11 rounded-full bg-white/10 hover:bg-[#0ef]/20 border border-white/20 hover:border-[#0ef] text-white hover:text-[#0ef] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
