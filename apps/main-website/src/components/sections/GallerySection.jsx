'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination, Navigation } from 'swiper/modules';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { GALLERY_IMAGES_DATA } from '@/constants/gallery';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function GallerySection({ images = GALLERY_IMAGES_DATA }) {
  if (!images || images.length === 0) return null;

  return (
    <section id="gallery" className="site-section select-none">
      <SectionHeader
        title="Moments & Gallery"
        accentWord="Gallery"
        subtitle="Glimpses of pitch sessions, mentor bootcamps, prototype builds, and startup milestones at NIT Patna."
        className="!mb-2 sm:!mb-3"
      />

      <div className="site-container relative mt-0 mb-1 max-w-[1050px] px-4">
        <button
          id="gallery-prev"
          className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#0ef]/30 bg-black/50 text-[#0ef] backdrop-blur-md transition-all duration-300 hover:bg-[#0ef]/15 active:scale-95 sm:h-11 sm:w-11"
          aria-label="Previous image"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <button
          id="gallery-next"
          className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#0ef]/30 bg-black/50 text-[#0ef] backdrop-blur-md transition-all duration-300 hover:bg-[#0ef]/15 active:scale-95 sm:h-11 sm:w-11"
          aria-label="Next image"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        <Swiper
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          coverflowEffect={{
            rotate: 12,
            stretch: 0,
            depth: 220,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            prevEl: '#gallery-prev',
            nextEl: '#gallery-next',
          }}
          pagination={{
            clickable: true,
            el: '.gallery-pagination',
          }}
          className="w-full py-2 sm:py-3 !overflow-visible [&_.swiper-slide-active]:scale-105 [&_.swiper-slide-active]:ring-2 [&_.swiper-slide-active]:ring-[#0ef]/50 [&_.swiper-slide-active]:shadow-[0_12px_48px_rgba(14,239,255,0.2)] [&_.swiper-slide]:box-border [&_.swiper-slide]:transition-all [&_.swiper-slide]:duration-500 [&_.swiper-wrapper]:items-center"
        >
          {images.map((image) => (
            <SwiperSlide
              key={image.id}
              className="!h-[210px] !w-[260px] shrink-0 overflow-hidden rounded-2xl bg-black/60 shadow-2xl transition-transform duration-500 sm:!h-[260px] sm:!w-[340px] md:!h-[310px] md:!w-[410px]"
            >
              <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900 border border-white/10">
                <Image
                  src={image.src}
                  alt={image.alt || image.caption || 'Gallery photo'}
                  fill
                  sizes="(max-width: 640px) 260px, (max-width: 768px) 340px, 410px"
                  className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {image.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#0ef] transition-colors line-clamp-2 drop-shadow-md">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="gallery-pagination flex justify-center items-center gap-2 mt-6 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-[#0ef]/40 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet-active]:bg-[#0ef] [&_.swiper-pagination-bullet-active]:w-4 [&_.swiper-pagination-bullet-active]:shadow-[0_0_8px_#0ef]" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="site-container mt-6 flex max-w-[1050px] justify-center"
      >
        <Button href="/gallery" variant="primary" size="md">
          Explore More →
        </Button>
      </motion.div>
    </section>
  );
}

