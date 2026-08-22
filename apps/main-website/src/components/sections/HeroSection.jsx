'use client';

import React from 'react';
import HeroContent from './HeroContent';
import NoticeSection from './NoticeSection';
import { CLOUDINARY_BASE_URL } from '@/constants/const';

export default function HeroSection({ notices = [], heroProps = {} }) {
  return (
    <section id="home" className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 pt-[110px] pb-14 sm:px-8 sm:pt-[120px] sm:pb-16 lg:px-10">
      <style jsx>{`
        .bg-slideshow {
          animation: bgChange 40s ease-in-out infinite;
          background-attachment: fixed;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        @keyframes bgChange {
          0%,
          100% {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.88),
                rgba(2, 4, 9, 0.72)
              ),
              url('${CLOUDINARY_BASE_URL}/v1782896081/home1_xxlclo.jpg');
          }
          20% {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.88),
                rgba(2, 4, 9, 0.72)
              ),
              url('${CLOUDINARY_BASE_URL}/v1782896080/home2_fwse0q.jpg');
          }
          40% {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.88),
                rgba(2, 4, 9, 0.72)
              ),
              url('${CLOUDINARY_BASE_URL}/v1782896080/home3_mss71d.jpg');
          }
          60% {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.88),
                rgba(2, 4, 9, 0.72)
              ),
              url('${CLOUDINARY_BASE_URL}/v1782896082/home4_fgdtfi.jpg');
          }
          80% {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.88),
                rgba(2, 4, 9, 0.72)
              ),
              url('${CLOUDINARY_BASE_URL}/v1782896090/IMG20230921194023_rzcmok.jpg');
          }
        }
      `}</style>

      <div className="bg-slideshow absolute inset-0 z-0" />

      <div className="site-container grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div>
          <HeroContent {...heroProps} />
        </div>

        <div className="w-full">
          <NoticeSection notices={notices} />
        </div>
      </div>
    </section>
  );
}
