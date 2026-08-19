'use client';

import React, { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';

const emptySubscribe = () => () => {};

/** Lightbox Modal Component */
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
  const [touchStartX, setTouchStartX] = useState(0);

  const total = images.length;
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < total;
  const currentImage = isOpen ? images[activeIndex] : null;

  const handlePrev = useCallback(() => {
    setIsImageLoading(true);
    if (onIndexChange && activeIndex !== null) {
      onIndexChange(activeIndex === 0 ? total - 1 : activeIndex - 1);
    }
  }, [activeIndex, onIndexChange, total]);

  const handleNext = useCallback(() => {
    setIsImageLoading(true);
    if (onIndexChange && activeIndex !== null) {
      onIndexChange(activeIndex === total - 1 ? 0 : activeIndex + 1);
    }
  }, [activeIndex, onIndexChange, total]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!isOpen) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
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
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isMounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] w-screen h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center select-none"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close lightbox"
              suppressHydrationWarning
              className="absolute top-6 right-6 z-[1000000] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrev}
              aria-label="Previous image"
              suppressHydrationWarning
              className="absolute left-4 sm:left-8 z-[1000000] w-12 h-12 rounded-full bg-white/10 hover:bg-[#0ef]/20 border border-white/20 hover:border-[#0ef] text-white hover:text-[#0ef] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="relative flex flex-col items-center justify-center max-w-[95vw] max-h-[90vh]">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-[#0ef]/20 border-t-[#0ef] rounded-full animate-spin" />
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage.fullSrc || currentImage.src}
                alt={currentImage.alt || 'Gallery photo'}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                className={`max-w-[95vw] max-h-[80vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                {currentImage.caption && (
                  <span className="text-white/90 text-sm font-medium">
                    {currentImage.caption}
                  </span>
                )}
                <div className="px-4 py-1.5 rounded-full bg-black/80 border border-white/10 text-white/80 text-xs sm:text-sm font-mono backdrop-blur-md">
                  {activeIndex + 1} / {total}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              aria-label="Next image"
              suppressHydrationWarning
              className="absolute right-4 sm:right-8 z-[1000000] w-12 h-12 rounded-full bg-white/10 hover:bg-[#0ef]/20 border border-white/20 hover:border-[#0ef] text-white hover:text-[#0ef] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
