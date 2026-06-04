"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navItems";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (!event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (
        event.target &&
        event.target.closest &&
        event.target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      const currentIndex = NAV_ITEMS.findIndex((item) => pathname?.includes(item.match));

      if (currentIndex === -1) {
        return;
      }

      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + NAV_ITEMS.length) % NAV_ITEMS.length;

      event.preventDefault();
      router.push(NAV_ITEMS[nextIndex].href);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname, router]);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-15 bg-[#111319]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <div className="flex md:hidden flex-col gap-1 cursor-pointer w-6 hover:opacity-80 transition-opacity">
          <span className="w-6 h-0.5 bg-[#4FDBC8] rounded"></span>
          <span className="w-6 h-0.5 bg-[#4FDBC8] rounded"></span>
          <span className="w-6 h-0.5 bg-[#4FDBC8] rounded"></span>
        </div>
        
        {/* Desktop Brand */}
        <h1 className="hidden md:block text-[#4FDBC8] font-bold text-lg sm:text-xl tracking-wide truncate">
          Induction Portal
        </h1>
      </div>
      
      {/* Center Section */}
      <div className="flex-1 flex justify-center items-center px-2 overflow-hidden">
        {/* Mobile Brand */}
        <h1 className="md:hidden text-[#4FDBC8] font-bold text-lg sm:text-xl tracking-wide truncate">
          Induction Portal
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.includes(item.match);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 transition-colors ${
                  isActive 
                    ? "text-[#4FDBC8]" 
                    : "text-[#7a9490] hover:text-[#9bb8b3]"
                }`}
              >
                {/* Scale the icon down slightly for inline display */}
                <div className="scale-75 origin-center flex items-center justify-center">
                  {item.icon(isActive)}
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          <Image src="/notification.png" alt="notification" width={18} height={22} className="opacity-90 sm:w-5 sm:h-6" />
        </div>
        <div className="rounded-full border border-[#859490] overflow-hidden cursor-pointer shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:opacity-90 transition-opacity">
          <Image src="/portal-logo.jpg" alt="portal-logo" height={40} width={40} priority />
        </div>
      </div>
    </nav>
  );
}
