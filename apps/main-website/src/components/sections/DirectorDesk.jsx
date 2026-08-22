'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import SectionHeader from '@/components/ui/SectionHeader';
import { LEADERSHIP_DATA } from '@/constants/leadership';
import { PlayIcon, UserIcon } from '@/components/icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function DirectorDesk({ directors = LEADERSHIP_DATA }) {
  if (!directors || directors.length === 0) return null;

  return (
    <section id="darki" className="site-section">
      <div className="site-container">
        <SectionHeader
          title="Director Desk"
          accentWord="Desk"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col gap-6 sm:gap-8"
        >
          {directors.map((director, index) => {
            const isDirector = director.id === 'director' || index === 0;
            const accent = director.accentColor || '#0ef';

            return (
              <motion.article
                key={director.id || index}
                variants={cardVariants}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className={`group relative flex flex-col md:flex-row items-stretch h-auto ${
                  isDirector ? 'md:flex-row-reverse' : ''
                } rounded-lg overflow-hidden border border-white/10 hover:border-[#0ef]/40 bg-gradient-to-br from-[#0c1424] via-[#090e18] to-[#040810] transition-all duration-300`}
              >
                <div
                  className={`relative w-full h-[320px] sm:h-[400px] md:h-auto md:w-[240px] lg:w-[270px] shrink-0 self-stretch overflow-hidden bg-neutral-950 flex items-center justify-center ${
                    isDirector
                      ? 'md:[clip-path:polygon(0_0,_100%_0,_100%_100%,_12%_100%)]'
                      : 'md:[clip-path:polygon(0_0,_100%_0,_88%_100%,_0_100%)]'
                  }`}
                >
                  {director.image ? (
                    <Image
                      src={director.image}
                      alt={director.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 270px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/40">
                      <UserIcon className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-transparent to-transparent md:hidden" />
                </div>

                <div className="relative z-10 flex flex-1 flex-col justify-between py-8 sm:py-9 lg:py-10 px-6 sm:px-7 lg:px-8 min-h-[240px] md:min-h-[260px]">
                  <div>
                    <div className="mb-2">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[0.72rem] font-bold tracking-wider uppercase mb-1.5 border"
                        style={{
                          color: accent,
                          borderColor: `${accent}40`,
                          backgroundColor: `${accent}10`,
                        }}
                      >
                        {director.role}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {director.name}
                      </h3>
                      <p className='text-xs'>
                        {director.date}
                      </p>
                    </div>

                    <div
                      className="h-[2px] w-[36px] transition-all duration-300 group-hover:w-[60px] mb-3"
                      style={{
                        backgroundColor: accent,
                      }}
                    />

                    <div
                      className="text-xs sm:text-[0.875rem] leading-relaxed text-white/80 [&_p]:mb-2 [&_a]:text-[#0ef] [&_a]:underline font-normal"
                      dangerouslySetInnerHTML={{ __html: director.descriptionHtml }}
                    />
                  </div>

                  {director.link && director.link !== '#' && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-start">
                      <motion.a
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        href={director.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer"
                      >
                        <PlayIcon className="w-3 h-3" style={{ color: accent }} />
                        <span>Know More</span>
                      </motion.a>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
