'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { SUPPORT_SLIDES_DATA } from '@/constants/support';

export default function GoogleSlider({ slides = SUPPORT_SLIDES_DATA }) {
  const [slide, setSlide] = useState(0);

  const activeSlide = slides[slide] || slides[0];

  if (!activeSlide) return null;

  return (
    <section id="support" className="site-section">
      <SectionHeader
        title="How? we Support."
        accentWord="Support."
      />

      <div className="w-full bg-[#000000] opacity-95 bg-[radial-gradient(#142850_0.8px,#000000_0.8px)] [background-size:16px_16px] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-10 sm:mb-12"
          >
            {slides.map((item, index) => {
              const isActive = slide === index;
              return (
                <button
                  key={item.id || index}
                  onClick={() => setSlide(index)}
                  suppressHydrationWarning
                  className={`px-5 py-3 sm:px-7 sm:py-3.5 rounded-lg text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black ring-4 ring-[#009efa] shadow-[0_0_20px_rgba(0,158,250,0.5)] scale-105'
                      : 'bg-white text-black/80 hover:bg-white/95'
                  }`}
                >
                  <h2>{item.name}</h2>
                </button>
              );
            })}
          </motion.div>

          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12 w-full">
            <div className="flex-1 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4 }}
                  className="flex w-full lg:w-[85%] max-w-[560px] flex-col items-center justify-center text-center gap-5 sm:gap-6"
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-white tracking-tight">
                    {activeSlide.title}
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/90 font-normal">
                    {activeSlide.desc}
                  </p>

                  <Button
                    href={activeSlide.link || '#idea'}
                    size="md"
                    className="w-fit px-6 py-3.5 sm:px-8 sm:py-4 bg-[#009efa] hover:bg-[#0082d1] text-white font-bold rounded-lg shadow-lg text-base sm:text-lg transition-all duration-200 mt-2 border-none"
                  >
                    {activeSlide.btnText || 'Explore'}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex-1 w-full h-[280px] sm:h-[380px] lg:h-[440px] flex items-center justify-center bg-transparent">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide}
                  src={activeSlide.img}
                  alt={activeSlide.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-contain object-center"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
