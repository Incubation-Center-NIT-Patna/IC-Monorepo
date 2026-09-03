'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { EVENTS_DATA } from '@/constants/events';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinary';

export function EventCard({ event }) {
  const targetUrl = event.id ? `/events/${event.id}` : (event.url || '/events');
  const isExternal = targetUrl.startsWith('http');
  const optimizedImage = getOptimizedCloudinaryUrl(event.image, { width: 400 });

  return (
    <div className="perspective-[1000px] group h-[220px] w-[220px] shrink-0 sm:h-[260px] sm:w-[260px] md:h-[280px] md:w-[280px]">
      <div className="relative h-full w-full rounded-xl text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-neutral-800 [backface-visibility:hidden]">
          <Image
            src={optimizedImage}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 280px"
            className="h-full w-full rounded-xl object-cover"
          />
        </div>

        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-xl border border-[#0ef]/30 bg-[#081627] p-4 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5">
          <h3 className="mb-2 text-[1.05rem] font-bold leading-tight text-white sm:text-[1.2rem]">
            {event.title}
          </h3>
          <p className="text-[0.85rem] sm:text-[0.95rem] text-white/90 mb-1">
            <span className="text-[#0ef] font-semibold">Date:</span> {event.date}
          </p>
          <p className="text-[0.85rem] sm:text-[0.95rem] text-white/90 mb-4">
            <span className="text-[#0ef] font-semibold">Venue:</span> {event.venue}
          </p>

          {isExternal ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0ef] text-[#142850] font-bold text-[0.85rem] sm:text-[0.95rem] rounded-full shadow-[0_0_10px_#0ef] transition-all duration-300 hover:bg-white hover:text-black hover:shadow-none"
            >
              Details →
            </a>
          ) : (
            <Link
              href={targetUrl}
              className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0ef] text-[#142850] font-bold text-[0.85rem] sm:text-[0.95rem] rounded-full shadow-[0_0_10px_#0ef] transition-all duration-300 hover:bg-white hover:text-black hover:shadow-none"
            >
              Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsSection({ events = EVENTS_DATA }) {
  if (!events || events.length === 0) return null;

  const marqueeEvents = [...events, ...events, ...events, ...events];

  return (
    <section id="events" className="site-section">
      <style jsx>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marqueeScroll 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <SectionHeader
        title="Upcoming & Past Events"
        accentWord="Events"
        subtitle="The Incubation Center organizes transformative events that empower entrepreneurs with knowledge, networking opportunities, and practical skills. Fostering innovation, collaboration, and growth within the startup community."
      />

      <div className="relative mb-10 w-full overflow-hidden py-6 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[10%] before:bg-gradient-to-r before:from-[#020409] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[10%] after:bg-gradient-to-l after:from-[#020409] after:to-transparent sm:before:w-[15%] sm:after:w-[15%]">
        <div className="flex w-max gap-8 sm:gap-14 animate-marquee">
          {marqueeEvents.map((event, index) => (
            <motion.div
              key={`${event.id || index}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mt-6"
      >
        <Button href="/events" variant="primary" size="md">
          Explore More →
        </Button>
      </motion.div>
    </section>
  );
}
