'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { TALKS_DATA } from '@/constants/talks';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinary';

import 'swiper/css';
import 'swiper/css/free-mode';

export function TalkCard({ talk }) {
  const optimizedPhoto = getOptimizedCloudinaryUrl(talk.photo, { width: 150 });

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-panel group relative flex h-[260px] w-full shrink-0 cursor-grab select-none flex-col justify-between overflow-hidden rounded-xl active:cursor-grabbing sm:h-[290px]"
    >
      <div className="p-5 sm:p-6 flex-grow overflow-hidden">
        <p className="line-clamp-5 select-none text-[0.9rem] leading-7 text-white/82">
          &ldquo;{talk.content}&rdquo;
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4 border-t border-white/10 bg-black/75 p-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#0ef] bg-neutral-800">
          <Image
            src={optimizedPhoto}
            alt={talk.name}
            fill
            sizes="48px"
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-white font-bold text-[1rem] sm:text-[1.1rem] leading-snug truncate select-none">
            {talk.name}
          </h3>
          <p className="text-[#0ef] text-[0.8rem] sm:text-[0.85rem] truncate select-none">
            {talk.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TalksSection({ talks = TALKS_DATA }) {
  const repeatedTalks = [...talks, ...talks, ...talks];

  return (
    <section id="talks" className="site-section select-none">
      <SectionHeader
        title="Our Entrepreneur's Talk"
        accentWord="Talk"
        subtitle="The Incubation Center at NIT Patna hosts regular entrepreneur talks, featuring successful startup founders who share their journeys and strategies. These sessions inspire aspiring entrepreneurs, offering practical insights into business challenges."
      />

      <div className="relative mb-10 w-full overflow-hidden py-4 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[8%] before:bg-gradient-to-r before:from-[#08090d] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[8%] after:bg-gradient-to-l after:from-[#08090d] after:to-transparent sm:before:w-[12%] sm:after:w-[12%]">
        <Swiper
          modules={[Autoplay, FreeMode]}
          loop={true}
          freeMode={true}
          grabCursor={true}
          slidesPerView="auto"
          spaceBetween={30}
          speed={4500}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="w-full !p-2 [&_.swiper-wrapper]:ease-linear"
        >
          {repeatedTalks.map((talk, index) => (
            <SwiperSlide
              key={`${talk.id || index}-${index}`}
              className="!w-[270px] shrink-0 sm:!w-[330px]"
            >
              <TalkCard talk={talk} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="site-container flex justify-center"
      >
        <Button href="/" variant="primary" size="md">
          Explore More →
        </Button>
      </motion.div>
    </section>
  );
}
