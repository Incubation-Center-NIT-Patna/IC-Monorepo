import React from 'react';

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    match: "/dashboard",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="8" height="8" rx="2" fill={active ? "#1E40AF" : "#8F95A3"} />
        <rect x="13" y="3" width="8" height="5" rx="2" fill={active ? "#1E40AF" : "#8F95A3"} opacity="0.8" />
        <rect x="13" y="10" width="8" height="11" rx="2" fill={active ? "#1E40AF" : "#8F95A3"} />
        <rect x="3" y="13" width="8" height="8" rx="2" fill={active ? "#1E40AF" : "#8F95A3"} opacity="0.8" />
      </svg>
    ),
  },
  {
    label: "Evaluation",
    href: "/evaluation",
    match: "/evaluation",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="18" rx="2" fill={active ? "#1E40AF" : "#8F95A3"} />
        <rect x="8" y="2" width="8" height="4" rx="1.5" fill={active ? "#1E40AF" : "#8F95A3"} />
        <rect x="8" y="10" width="8" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.7" />
        <rect x="8" y="13" width="6" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.7" />
        <rect x="8" y="16" width="7" height="1.5" rx="0.75" fill="#FFFFFF" opacity="0.7" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    match: "/settings",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          fill={active ? "#1E40AF" : "#8F95A3"}
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          stroke={active ? "#1E40AF" : "#8F95A3"}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
  },
];
