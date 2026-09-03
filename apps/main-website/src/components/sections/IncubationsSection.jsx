'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { INCUBATIONS_DATA } from '@/constants/incubations';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinary';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export function IncubationCard({ item }) {
  const [imgError, setImgError] = useState(!item.img || item.img.trim() === '');
  const isExternal = item.website && item.website.startsWith('http');
  const optimizedImg = getOptimizedCloudinaryUrl(item.img, { width: 500 });

  return (
    <div className="glass-panel group relative flex h-full w-full max-w-[360px] flex-col rounded-xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#0ef]/40 select-none">
      <div className="relative mb-4 flex h-[180px] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#0ef]/5 to-[#0ef]/1">
        {!imgError ? (
          <Image
            src={optimizedImg}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="select-none text-5xl opacity-30">🏢</span>
        )}

        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0b111e]/80 to-transparent pointer-events-none" />
      </div>

      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3 className="mb-2 text-[1.15rem] font-semibold leading-snug text-white line-clamp-1">
            {item.name}
          </h3>

          <p className="mb-4 line-clamp-3 text-[0.9rem] leading-6 text-[#a0aabf]">
            {item.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2 mt-auto">
          {item.email ? (
            <div className="break-all rounded-lg border border-[#0ef]/10 bg-[#0ef]/5 p-2.5 px-3.5 text-[0.82rem] text-[#a0aabf]">
              Contact:{' '}
              <a
                href={`mailto:${item.email}`}
                className="text-[#0ef] font-medium transition-colors hover:text-white hover:underline"
              >
                {item.email}
              </a>
            </div>
          ) : (
            <div className="h-[42px] border border-transparent" aria-hidden="true" />
          )}

          <div className="flex justify-start">
            <a
              href={item.website || '#'}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center rounded-full border border-[#0ef] bg-transparent px-5 py-2 text-[0.88rem] font-medium text-[#0ef] transition-all duration-300 hover:bg-[#0ef] hover:text-[#0b111e]"
            >
              Connect →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncubationsSection({ items = INCUBATIONS_DATA }) {
  const [paginationEl, setPaginationEl] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <section id="incubations" className="site-section">
      <SectionHeader
        title="Our Incubations"
        accentWord="Incubations"
        subtitle="NIT Patna's Incubation Center fosters a statewide startup ecosystem, offering essential infrastructure like office spaces, meeting rooms, networking platforms, and management support for aspiring entrepreneurs."
      />

      <div className="site-container">
        <Swiper
          key={paginationEl ? 'swiper-ready' : 'swiper-init'}
          modules={[EffectCoverflow, Autoplay, Pagination]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true}
          autoplay={{
            delay: 3200,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 160,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{
            clickable: true,
            el: paginationEl,
          }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
            1440: { slidesPerView: 3, spaceBetween: 50 },
          }}
          className="w-full py-3 [&_.swiper-wrapper]:items-stretch"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id || index}
              className="!w-[calc(100vw-40px)] xs:!w-[320px] sm:!w-[340px] md:!w-[360px] shrink-0 flex h-full justify-center p-2 sm:p-3 opacity-100"
            >
              <IncubationCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          ref={(node) => setPaginationEl(node)}
          className="incubations-pagination hidden sm:flex justify-center items-center gap-2 mt-8 mb-2 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-[#0ef]/30 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:cursor-pointer [&_.swiper-pagination-bullet-active]:!bg-[#0ef] [&_.swiper-pagination-bullet-active]:!w-5 [&_.swiper-pagination-bullet-active]:shadow-[0_0_10px_#0ef]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center mt-6 relative z-10"
      >
        <Button href="#idea" size="md" className="tracking-wide">
          Incubate Your Startup
        </Button>
      </motion.div>
    </section>
  );
}
