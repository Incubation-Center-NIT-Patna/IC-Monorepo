'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_LINKS } from '@/constants/navigation';
import { nitp_main, ic_logo, nitp_logo } from '@/constants/const';
import { ChevronDownIcon, CloseIcon, MenuIcon } from '@/components/icons';

const DesktopNavItem = ({ item, scrolled, pathname, handleNavClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const fontSize = scrolled ? 'text-[15px]' : 'text-[17px]';
  const isParentActive =
    pathname === item.href ||
    (item.children && item.children.some((c) => pathname === c.href));

  return (
    <div
      className="relative group py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.isExternal ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative text-white font-normal transition-all duration-300 hover:text-[#00f7ff] flex items-center gap-1 ${fontSize} after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#00f7ff] after:transition-all after:duration-300 hover:after:w-full`}
        >
          <span>{item.label}</span>
        </a>
      ) : (
        <Link
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          className={`relative font-normal transition-all duration-300 flex items-center gap-1 ${fontSize} ${isParentActive ? 'text-[#00f7ff] font-medium' : 'text-white hover:text-[#00f7ff]'
            } after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:transition-all after:duration-300 ${isParentActive ? 'after:w-full after:bg-[#00f7ff]' : 'after:w-0 after:bg-[#00f7ff] hover:after:w-full'
            }`}
        >
          <span>{item.label}</span>
          {item.children && (
            <motion.span
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-[#00f7ff]/70 ml-0.5"
            >
              ▾
            </motion.span>
          )}
        </Link>
      )}

      <AnimatePresence>
        {item.children && isHovered && (
          <div
            className="absolute top-full left-0 pt-2 z-[9999]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1 bg-[#060c1d]/95 backdrop-blur-xl py-2 px-1.5 min-w-[190px] rounded-xl border border-white/10 shadow-2xl"
            >
              {item.children.map((child, idx) => {
                const isChildActive = pathname === child.href;

                return (
                  <Link
                    key={idx}
                    href={child.href}
                    onClick={(e) => {
                      setIsHovered(false);
                      handleNavClick(e, child.href);
                    }}
                    className={`text-[14px] font-medium transition-colors py-2 px-3 rounded-lg ${isChildActive
                      ? 'text-[#00f7ff] bg-white/5 font-semibold'
                      : 'text-white/80 hover:text-[#00f7ff] hover:bg-white/5'
                      }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileNavItem = ({
  item,
  pathname,
  activeMobileMenu,
  toggleMobileMenu,
  closeMobileMenu,
  handleNavClick,
}) => {
  const isOpen = activeMobileMenu === item.id;
  const isParentActive =
    pathname === item.href ||
    (item.children && item.children.some((c) => pathname === c.href));

  if (!item.children) {
    return (
      <div className="w-full flex justify-center">
        {item.isExternal ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobileMenu}
            className="w-full max-w-[320px] py-3 text-center text-white text-[17px] font-semibold rounded-xl bg-white/5 border border-white/10 hover:text-[#00f7ff] hover:border-[#00f7ff]/30 transition-all flex items-center justify-center"
          >
            {item.label}
          </a>
        ) : (
          <Link
            href={item.href}
            onClick={(e) => {
              closeMobileMenu();
              handleNavClick(e, item.href);
            }}
            className={`w-full max-w-[320px] py-3 text-center text-[17px] font-semibold rounded-xl border transition-all flex items-center justify-center ${isParentActive
              ? 'bg-[#00f7ff]/15 text-[#00f7ff] border-[#00f7ff]/40 shadow-[0_0_15px_rgba(0,247,255,0.2)]'
              : 'bg-white/5 text-white border-white/10 hover:text-[#00f7ff] hover:border-[#00f7ff]/30'
              }`}
          >
            {item.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`w-full max-w-[320px] flex items-center justify-between rounded-xl px-4 py-2 transition-all ${isParentActive
          ? 'bg-[#00f7ff]/10 border border-[#00f7ff]/40'
          : 'bg-white/5 border border-white/10 hover:border-[#00f7ff]/30'
          }`}
      >
        <Link
          href={item.href}
          onClick={(e) => {
            closeMobileMenu();
            handleNavClick(e, item.href);
          }}
          className={`flex-1 text-center text-[17px] font-semibold transition-colors py-1 ${isParentActive ? 'text-[#00f7ff]' : 'text-white hover:text-[#00f7ff]'
            }`}
        >
          {item.label}
        </Link>
        <button
          onClick={() => toggleMobileMenu(item.id)}
          aria-label={`Toggle ${item.label}`}
          className="text-[#00f7ff] text-xl p-1.5 cursor-pointer flex items-center justify-center"
        >
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden w-full max-w-[320px] flex flex-col items-center mt-1 px-2 py-1.5 bg-black/40 rounded-xl border border-white/10"
          >
            <div className="w-full flex flex-col gap-1">
              {item.children.map((child, idx) => {
                const isChildActive = pathname === child.href;

                return (
                  <Link
                    key={idx}
                    href={child.href}
                    onClick={(e) => {
                      closeMobileMenu();
                      handleNavClick(e, child.href);
                    }}
                    className={`w-full text-center py-2 px-3 rounded-lg text-[14px] font-medium transition-colors ${isChildActive
                      ? 'text-[#00f7ff] font-semibold bg-white/5'
                      : 'text-white/80 hover:text-[#00f7ff] hover:bg-white/5'
                      }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState('');

  const handleNavClick = (e, href) => {
    if (href && href.includes('#')) {
      const hashIndex = href.indexOf('#');
      const hash = href.substring(hashIndex + 1);

      if (pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && pathname === '/') {
      const hash = window.location.hash.replace('#', '');
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, '', window.location.pathname);
        }, 150);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setActiveMobileMenu('');
  };

  const toggleMobileMenu = (menuName) => {
    setActiveMobileMenu((current) => (current === menuName ? '' : menuName));
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 w-full z-[9000]"
    >
      <header
        className={`w-full flex items-center justify-between transition-all duration-300 ${scrolled
          ? 'py-2 px-5 sm:px-8 md:px-12 bg-black/85 backdrop-blur-md shadow-lg'
          : 'py-4 px-5 sm:px-8 md:px-16 bg-transparent'
          }`}
      >
        <a
          href={nitp_main}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 transition-transform duration-300 hover:scale-105 shrink-0"
          aria-label="NIT Patna Official Website"
        >
          <img
            src={nitp_logo}
            alt="NITP Logo"
            className={`object-contain transition-all duration-300 ${scrolled
              ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
              : 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20'
              }`}
          />
        </a>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {NAV_LINKS.map((item) => (
            <DesktopNavItem
              key={item.id}
              item={item}
              scrolled={scrolled}
              pathname={pathname}
              handleNavClick={handleNavClick}
            />
          ))}
        </nav>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="md:hidden text-white text-2xl p-2 z-20 focus:outline-none cursor-pointer"
          >
            <MenuIcon className="w-7 h-7 text-white hover:text-[#00f7ff] transition-colors" />
          </button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="fixed inset-0 min-h-screen bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-3 z-[9005] px-6 pt-20 pb-10 overflow-y-auto"
            >
              <button
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="absolute top-5 right-6 z-[9010] p-2.5 rounded-full bg-white/10 text-white hover:text-[#00f7ff] hover:bg-white/20 transition-all cursor-pointer"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              {NAV_LINKS.map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  activeMobileMenu={activeMobileMenu}
                  toggleMobileMenu={toggleMobileMenu}
                  closeMobileMenu={closeMobileMenu}
                  handleNavClick={handleNavClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          href="/"
          className="relative z-10 transition-transform duration-300 hover:scale-105 shrink-0"
          aria-label="Incubation Center Homepage"
        >
          <img
            src={ic_logo}
            alt="IC Logo"
            className={`object-contain transition-all duration-300 ${scrolled
              ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
              : 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20'
              }`}
          />
        </Link>
      </header>
    </motion.div>
  );
}