"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/constants/navItems";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="w-full h-[65px] bg-[#111319] flex justify-center md:hidden">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl flex justify-around items-center px-2 h-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.includes(item.match);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${isActive ? "text-[#4FDBC8]" : "text-[#7a9490] hover:text-[#9bb8b3]"}`}
            >
              {item.icon(isActive)}
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
