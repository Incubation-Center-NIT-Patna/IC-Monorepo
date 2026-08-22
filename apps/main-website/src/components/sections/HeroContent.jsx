'use client';

import React from 'react';
import { motion } from 'motion/react';
import Typewriter from 'typewriter-effect';
import Button from '@/components/ui/Button';

export default function HeroContent({
  welcomeText = 'Welcome to,',
  title = 'Incubation Center',
  subtitle = 'of NIT Patna.',
  typewriterStrings = ['We Incubate.', 'We Mentor.', 'We Support.', 'We Accelerate.'],
  description = 'Empowering startups and entrepreneurs with mentorship, workspace, and funding to foster innovation and accelerate growth. Join us to turn your ideas into successful ventures.',
  ctaText = "Incubate Your Idea",
  ctaHref = '#idea',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="mx-auto flex max-w-[640px] flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-[1.1rem] font-medium text-white/86 sm:text-[1.25rem]"
      >
        {welcomeText}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="my-2 text-[clamp(2.75rem,8vw,5rem)] font-bold leading-none text-white tracking-tight"
      >
        {title.includes('Incubation Center') ? (
          <>
            <span className="text-[#0ef]">I</span>ncubation{' '}
            <span className="text-[#0ef]">C</span>enter
          </>
        ) : (
          title
        )}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-3 text-[1.2rem] font-medium text-white/90 sm:text-[1.45rem]"
      >
        {subtitle}
      </motion.h2>

      <div className="flex h-[38px] items-center justify-center text-[1.6rem] font-semibold text-[#0ef] sm:text-[2rem] lg:justify-start">
        <Typewriter
          options={{
            strings: typewriterStrings,
            autoStart: true,
            loop: true,
          }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="my-4 max-w-[540px] text-[0.98rem] leading-7 text-white/80 sm:text-[1.05rem]"
      >
        {description}
      </motion.p>

      <Button href={ctaHref} size="md" className="mt-2">
        {ctaText}
      </Button>
    </motion.div>
  );
}
