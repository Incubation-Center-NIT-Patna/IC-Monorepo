'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MemberCard from '@/components/team/MemberCard';
import { PAST_OFFICE_BEARERS_DATA } from '@/constants/team';

export default function PastOfficeBearersPage() {
  const [selectedSession, setSelectedSession] = useState('all');

  // Sort sessions in descending order by year
  const sortedSessions = [...PAST_OFFICE_BEARERS_DATA].sort((prev, next) => {
    const yearA = parseInt(prev.year?.split('-')[0], 10) || 0;
    const yearB = parseInt(next.year?.split('-')[0], 10) || 0;
    return yearB - yearA;
  });

  const availableYears = sortedSessions.map((s) => s.year).filter(Boolean);

  const displayedSessions =
    selectedSession === 'all'
      ? sortedSessions
      : sortedSessions.filter((s) => s.year === selectedSession);

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 max-w-[800px]"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Honouring <span className="text-[#0ef]">Office Bearers</span>
        </h2>
      </motion.div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-12 max-w-[900px] px-4">
        <button
          onClick={() => setSelectedSession('all')}
          suppressHydrationWarning
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${selectedSession === 'all'
            ? 'bg-[#00f7ff] text-[#020712] font-semibold'
            : 'bg-white/5 text-white/75 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
        >
          All Sessions
        </button>

        {availableYears.map((year) => {
          const isSelected = selectedSession === year;

          return (
            <button
              key={year}
              onClick={() => setSelectedSession(year)}
              suppressHydrationWarning
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${isSelected
                ? 'bg-[#00f7ff] text-[#020712] font-semibold'
                : 'bg-white/5 text-white/75 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
            >
              Session {year}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-16 w-full max-w-[1240px]">
        <AnimatePresence mode="wait">
          {displayedSessions.map((session, sessionIdx) => (
            <motion.div
              key={session.year || sessionIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-[700px] px-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#0ef]/40" />
                <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-white shrink-0">
                  Session {session.year}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#0ef]/40" />
              </div>

              <div className="flex flex-col gap-10 w-full items-center">
                {session.sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="w-full flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4 mb-6 w-full max-w-[600px] px-4">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                      <h3 className="text-base sm:text-lg font-semibold text-white/90 text-center shrink-0 px-3">
                        {section.title}
                      </h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 w-full">
                      {section.members.map((member, memberIdx) => (
                        <MemberCard key={memberIdx} info={member} isPast={true} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}