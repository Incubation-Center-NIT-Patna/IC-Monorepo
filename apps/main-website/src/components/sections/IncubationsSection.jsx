'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { INCUBATIONS_DATA } from '@/constants/incubations';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export function IncubationCard({ item }) {
  const [imgError, setImgError] = useState(!item.img || item.img.trim() === '');
  const isExternal = item.website && item.website.startsWith('http');

  return (
    <div className="glass-panel group relative flex h-full w-full max-w-[360px] flex-col rounded-xl p-4 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#0ef]/40">
      <div className="relative mb-4 sm:mb-5 flex h-[180px] sm:h-[190px] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#0ef]/5 to-[#0ef]/1">
        {!imgError ? (
          <Image
            src={item.img}
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

      <div className="flex flex-col flex-grow">
        <h3 className="mb-2 sm:mb-3 text-[1.1rem] sm:text-[1.15rem] font-semibold leading-snug text-white">
          {item.name}
        </h3>

        <p className="mb-4 sm:mb-5 line-clamp-4 flex-grow text-[0.85rem] sm:text-[0.92rem] leading-6 sm:leading-7 text-[#a0aabf]">
          {item.description}
        </p>

        {item.email && (
          <div className="mb-4 sm:mb-5 break-all rounded-lg border border-[#0ef]/10 bg-[#0ef]/5 p-2.5 sm:p-3 px-3 sm:px-4 text-[0.75rem] sm:text-[0.82rem] text-[#a0aabf]">
            Contact:{' '}
            <a
              href={`mailto:${item.email}`}
              className="text-[#0ef] font-medium transition-colors hover:text-white hover:underline"
            >
              {item.email}
            </a>
          </div>
        )}

        <div className="mt-auto flex justify-start">
          <a
            href={item.website || '#'}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center rounded-full border border-[#0ef] bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-[0.85rem] sm:text-[0.9rem] font-medium text-[#0ef] transition-all duration-300 hover:bg-[#0ef] hover:text-[#0b111e]"
          >
            Connect →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function IncubationsSection({ items = INCUBATIONS_DATA }) {
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
          pagination={{
            el: '.incubation-swiper-pagination',
            clickable: true,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 260,
            modifier: 1,
            slideShadows: false,
          }}
          breakpoints={{
            320: { spaceBetween: 15 },
            640: { spaceBetween: 20 },
            768: { spaceBetween: 30 },
            1024: { spaceBetween: 40 },
          }}
          className="w-full pb-4"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={item.id || index}
              style={{ width: 'min(360px, 85vw)' }}
              className="flex h-auto justify-center py-4 px-2 sm:p-4 opacity-100"
            >
              <IncubationCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="incubation-swiper-pagination !relative !bottom-auto !left-auto !transform-none flex justify-center items-center gap-2 sm:gap-3 mt-5 mb-2 bg-transparent border-none shadow-none [&_.swiper-pagination-bullet]:!inline-block [&_.swiper-pagination-bullet]:!shrink-0 [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet]:!rounded-full [&_.swiper-pagination-bullet]:!bg-transparent [&_.swiper-pagination-bullet]:!border-none [&_.swiper-pagination-bullet]:!opacity-0 [&_.swiper-pagination-bullet]:!transition-all [&_.swiper-pagination-bullet]:!duration-300 [&_.swiper-pagination-bullet-active]:!shrink-0 [&_.swiper-pagination-bullet-active]:!w-3 [&_.swiper-pagination-bullet-active]:!h-3 [&_.swiper-pagination-bullet-active]:!rounded-full [&_.swiper-pagination-bullet-active]:!bg-[#0f62fe] [&_.swiper-pagination-bullet-active]:!opacity-100 [&_.swiper-pagination-bullet-active]:shadow-[0_0_12px_rgba(15,98,254,0.8)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center mt-4 relative z-10"
      >
        <Button href="#idea" size="md" className="tracking-wide">
          Incubate Your Startup
        </Button>
      </motion.div>
    </section>
  );
}
