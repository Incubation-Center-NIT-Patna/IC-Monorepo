'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';
import { campus_image } from '../../constants/const';


const DEFAULT_ABOUT_HTML = `
  <p class="leading-relaxed text-justify">The Incubation Centre at the National Institute of Technology Patna is a vital hub for nurturing startups from inception to success. Equipped with tailored resources like office spaces, mentorship programs, and networking opportunities, we foster an environment conducive to growth and innovation. Our primary aim is to support early-stage startups by providing essential resources and guidance to accelerate their growth trajectory and minimize failure rates. We actively promote economic development, entrepreneurship, and the commercialization of research and innovation within the region by facilitating access to funding, mentorship, and networks.</p>
  <ul class="space-y-3 mt-4 text-white/85 list-disc pl-5 text-justify">
    <li><strong>Provide aspiring entrepreneurs</strong> with essential resources and networking opportunities through initiatives like mentorship programs, funding avenues, and networking events to help startups overcome challenges and thrive.</li>
    <li><strong>Highlight notable successes</strong> like Shekhar Telesystems, Busy Mechanic, and Vendospot, demonstrating our support's effectiveness and inspiring future generations of entrepreneurs.</li>
    <li><strong>Foster innovation and resilience</strong> within the NIT Patna community, creating a supportive ecosystem where startups can flourish and significantly contribute to society and the economy.</li>
  </ul>
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function AboutSection({
  aboutHtml = DEFAULT_ABOUT_HTML,
  campusImage = campus_image,
  stats = [],
}) {
  return (
    <section id="about" className="site-section">
      <div className="site-container grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex w-full flex-col justify-between"
        >
          <GlassCard className="relative hidden md:block h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] w-full overflow-hidden p-2.5" hoverEffect={true}>
            <Image
              src={campusImage}
              alt="Incubation Center NIT Patna"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full w-full rounded-lg object-cover"
            />
            <div className="absolute inset-x-2.5 bottom-2.5 h-1/3 rounded-b-lg bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          </GlassCard>

          {stats.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((st, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-lg p-3 text-center border border-white/10"
                >
                  <span className="text-xl font-extrabold text-[#0ef]">
                    {st.value}
                  </span>
                  <p className="text-[0.75rem] text-white/70">{st.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col justify-center gap-5 text-white"
        >
          <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
            <h2 className="section-title text-center lg:text-left">
              About <span className="text-[#0ef]">Us</span>
            </h2>
          </motion.div>

          <motion.h3
            variants={itemVariants}
            className="text-center text-[1.35rem] font-semibold text-white sm:text-left sm:text-[1.6rem]"
          >
            What we do ?
          </motion.h3>

          <motion.div
            variants={itemVariants}
            className="section-copy text-justify sm:text-justify [&_p]:text-justify [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-3 [&_li]:text-justify [&_strong]:text-[#0ef] [&_a]:text-[#0ef] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: aboutHtml || DEFAULT_ABOUT_HTML }}
          />
        </motion.div>
      </div>
    </section>
  );
}
