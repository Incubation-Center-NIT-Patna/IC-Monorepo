'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import LightboxModal from '@/components/ui/LightboxModal';

const INITIAL_LOAD_COUNT = 12;
const BATCH_LOAD_COUNT = 6;

export default function GalleryPageClient({ images = [] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const observerRef = useRef(null);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_LOAD_COUNT, images.length));
  }, [images.length]);

  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && visibleCount < images.length) {
            loadMore();
          }
        },
        { rootMargin: '200px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [loadMore, visibleCount, images.length]
  );

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const visibleImages = images.slice(0, visibleCount);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleImages.map((img, idx) => (
          <motion.div
            key={img.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (idx % BATCH_LOAD_COUNT) * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => openLightbox(idx)}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(idx)}
            role="button"
            tabIndex={0}
            className="relative overflow-hidden w-full aspect-[4/3] rounded-2xl border border-white/10 shadow-lg cursor-pointer bg-neutral-900 group transition-all duration-300 hover:border-[#0ef]/60 hover:shadow-[0_0_25px_rgba(14,239,255,0.25)]"
          >
            <Image
              src={img.src}
              alt={img.alt || img.caption || 'Gallery photo'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
            />

            {(img.caption || img.category) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                {img.caption && (
                  <p className="text-sm font-semibold text-white group-hover:text-[#0ef] transition-colors line-clamp-2 drop-shadow-md leading-snug">
                    {img.caption}
                  </p>
                )}
                {img.category && (
                  <span className="text-[0.68rem] font-mono text-[#0ef]/80 mt-1 uppercase tracking-wider">
                    {img.category}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {visibleCount < images.length && (
        <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-[#0ef]/30 border-t-[#0ef] rounded-full animate-spin" />
        </div>
      )}

      <LightboxModal
        images={images}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}