'use client';

import React from 'react';
import { motion } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';
import { MegaphoneIcon } from '@/components/icons';

export default function NoticeSection({ notices = [] }) {
  return (
    <GlassCard
      className="mx-auto w-full max-w-[450px] lg:max-w-[460px] overflow-hidden p-6 sm:p-7 overflow-x-hidden"
      hoverEffect={true}
    >
      <div className="mb-5 flex items-center text-[1.4rem] font-bold text-white sm:text-[1.65rem]">
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
          className="mr-3 inline-flex text-[#0ef]"
        >
          <MegaphoneIcon className="w-6.5 h-6.5 sm:w-7 sm:h-7" />
        </motion.span>{' '}
        Notices
      </div>

      <div className="max-h-[320px] overflow-y-auto overflow-x-hidden pr-2 scroll-smooth sm:max-h-[380px] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#00e5ff] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-horizontal]:hidden">
        {notices.length > 0 ? (
          notices.map((notice, i) => (
            <motion.div
              key={notice.id || i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              viewport={{ once: true, amount: 0.1 }}
              className="mb-5 last:mb-0 max-w-full overflow-hidden"
            >
              <a
                href={notice.url || '#'}
                target={notice.url && notice.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block text-[0.98rem] font-semibold leading-snug text-white no-underline transition-colors duration-300 hover:text-[#00e5ff] sm:text-[1.06rem] break-words whitespace-normal"
              >
                {notice.title}
              </a>
              <em className="mt-1 block text-[0.78rem] italic text-[#ccc] truncate">
                {notice.date}
              </em>
            </motion.div>
          ))
        ) : (
          <p className="text-[0.98rem] italic text-white/70">
            No notices available at this time.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
