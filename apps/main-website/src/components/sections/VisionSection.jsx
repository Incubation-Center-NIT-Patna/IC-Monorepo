'use client';

import React from 'react';
import { motion } from 'motion/react';
import SectionHeader from '@/components/ui/SectionHeader';
import GlassCard from '@/components/ui/GlassCard';
import { VISION_DATA } from '@/constants/about';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function VisionSection({
  pillars = VISION_DATA.pillars,
}) {
  return (
    <section id="vision" className="site-section">
      <div className="site-container">
        <SectionHeader
          title="Our Vision"
          accentWord="Vision"
          subtitle="Guided by a clear mission to foster innovation, empower regional talent, and establish Bihar as a thriving center of entrepreneurship."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.id || index}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <GlassCard
                className="relative flex flex-col justify-between h-full p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-[#0ef]/50 hover:shadow-[0_0_35px_rgba(0,238,255,0.16)] transition-all duration-300 group overflow-hidden"
                hoverEffect={false}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#0ef] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#0ef] transition-colors leading-snug">
                    {pillar.title}
                  </h3>

                  {pillar.tagline && (
                    <p className="text-xs font-medium text-[#0ef]/80 tracking-wide uppercase mb-4">
                      {pillar.tagline}
                    </p>
                  )}

                  <div className="h-[2px] w-12 bg-gradient-to-r from-[#0ef] to-transparent rounded-full mb-5 group-hover:w-20 transition-all duration-300" />

                  <p className="text-[0.93rem] sm:text-[0.98rem] leading-7 text-white/75">
                    {pillar.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
