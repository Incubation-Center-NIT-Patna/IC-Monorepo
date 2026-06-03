"use client";

import React from "react";
import "./globals.css";

import Image from "next/image";
// import Icon from "../../public/Icon.svg";

export default function Navbar() {
  const [footer, setFooter] = React.useState("Dashboard");

  const toggleFooter = (section) => {
    setFooter(section);
  };

  return (
    <div className="page-wrapper">
      <div className="navbar--section">
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="name--block">
          <h1>Induction Portal</h1>
        </div>
        <div className="notification">
          <Image
            src="/notification.png"
            alt="notification"
            width={20}
            height={24}
          />
        </div>

        <div className="logo--block">
          <Image
            src="/portal-logo.jpg"
            alt="portal-logo"
            height={64}
            width={64}
            priority
          />
        </div>
      </div>

      {/* Body of the Induction Portal */}
      <main className="main--content"></main>

      <div className="footer--section">
        <div
          className={`dashboard--block footer--block ${footer == "Dashboard" ? "footerSelected" : ""}`}
          onClick={() => toggleFooter("Dashboard")}
        >
          <svg width="54" height="54" viewBox="0 0 64 64" fill="#111319" xmlns="http://www.w3.org/2000/svg">
                        {/* <!-- Background --> */}
          <rect x="6" y="6" width="52" height="52" rx="12" fill="#111319" />

          {/* <!-- Dashboard Panels --> */}
          <rect
            x="14"
            y="14"
            width="16"
            height="16"
            rx="3"
            fill={footer === "Dashboard" ? "#4FDBC8" : "#BBCAC6"}
            opacity="0.95"
          />
          <rect
            x="34"
            y="14"
            width="16"
            height="10"
            rx="3"
            fill={footer === "Dashboard" ? "#4FDBC8" : "#BBCAC6"}
            opacity="0.85"
          />
          <rect
            x="34"
            y="28"
            width="16"
            height="18"
            rx="3"
            fill={footer === "Dashboard" ? "#4FDBC8" : "#BBCAC6"}
            opacity="0.95"
          />
          <rect
            x="14"
            y="34"
            width="16"
            height="12"
            rx="3"
            fill={footer === "Dashboard" ? "#4FDBC8" : "#BBCAC6"}
            opacity="0.8"
          />
          </svg>
          <h3>Dashboard</h3> 
        </div>
        <div
          className={`evaluation--block footer--block ${footer == "Evaluation" ? "footerSelected" : ""}`}
          onClick={() => toggleFooter("Evaluation")}
        >
          <svg width="54" height="54" viewBox="0 0 64 64" fill="#111319" xmlns="http://www.w3.org/2000/svg">
                        {/* <!-- Background --> */}
          <rect x="6" y="6" width="52" height="52" rx="14" fill = "#111319" />

          {/* <!-- Clipboard --> */}
          <rect x="18" y="14" width="28" height="36" rx="4" fill = {footer == "Evaluation" ? "#4FDBC8" : "#BBCAC6"} />

          {/* <!-- Clipboard Top --> */}
          <rect x="24" y="10" width="16" height="8" rx="3" fill={footer == "Evaluation" ? "#4FDBC8" : "#BBCAC6"} />

          {/* <!-- Evaluation Lines --> */}
          <rect
            x="24"
            y="24"
            width="14"
            height="3"
            rx="1.5"
            fill="#10B981"
            opacity="0.85"
          />
          <rect
            x="24"
            y="32"
            width="10"
            height="3"
            rx="1.5"
            fill="#10B981"
            opacity="0.7"
          />
          <rect
            x="24"
            y="40"
            width="12"
            height="3"
            rx="1.5"
            fill="#10B981"
            opacity="0.55"
          />

          {/* <!-- Check Circle --> */}
          <circle cx="42" cy="38" r="8" fill="#10B981" />
          <path
            d="M38.5 38L41 40.5L45.5 35.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          </svg> 
          <h3>Evaluation</h3>
        </div>
        <div
          className={`leaderboard--block footer--block ${footer == "Leaderboard" ? "footerSelected" : ""}`}
          onClick={() => toggleFooter("Leaderboard")}
        >
          <svg
            width="54"
            height="54"
            viewBox="0 0 64 64"
            fill="#111319"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* <!-- Background --> */}
            <rect x="6" y="6" width="52" height="52" rx="14" fill = "#111319" />

            {/* <!-- Podium --> */}
            <rect
              x="14"
              y="36"
              width="10"
              height="12"
              rx="2"
              fill={footer == "Leaderboard" ? "#4FDBC8" : "#BBCAC6"}
              opacity="0.85"
            />
            <rect x="27" y="28" width="10" height="20" rx="2" fill="white" />
            <rect
              x="40"
              y="32"
              width="10"
              height="16"
              rx="2"
              fill={footer == "Leaderboard" ? "#4FDBC8" : "#BBCAC6"}
              opacity="0.9"
            />

            {/* <!-- Crown --> */}
            <path
              d="M24 18L28 24L32 20L36 24L40 18L42 28H22L24 18Z"
              fill={footer == "Leaderboard" ? "#4FDBC8" : "#BBCAC6"}
            />

            {/* <!-- Star --> */}
            <path
              d="M32 14L33.5 17.5L37 18L34.5 20.5L35 24L32 22L29 24L29.5 20.5L27 18L30.5 17.5L32 14Z"
              fill={footer == "Leaderboard" ? "#4FDBC8" : "#BBCAC6"}
            />

            {/* <!-- Rank Number --> */}
            <text
              x="32"
              y="43"
              textAnchor="middle"
              fontSize="10"
              fontFamily="Arial"
              fill="#F59E0B"
              fontWeight="bold"
            >
              1
            </text>
          </svg>
          <h3>leaderboard</h3>
        </div>
        <div
          className={`setting--block footer--block ${footer == "Settings" ? "footerSelected" : ""}`}
          onClick={() => toggleFooter("Settings")}
        >
          <svg
            width="54"
            height="54"
            viewBox="0 0 64 64"
            fill = {footer === "Settings" ? "footerSelected" : ""}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* <!-- Background --> */}
            <rect x="6" y="6" width="52" height="52" rx="14" fill = "#111319" />

            {/* <!-- Gear --> */}
            <g transform="translate(32 32)">
              {/* <!-- Teeth --> */}
              <path
                d="M0-18L3-14L8-15L9-10L14-9L15-4L18 0L15 4L14 9L9 10L8 15L3 14L0 18L-3 14L-8 15L-9 10L-14 9L-15 4L-18 0L-15-4L-14-9L-9-10L-8-15L-3-14Z"
                fill = {footer === "Settings" ? "#4FDBC8" : "#BBCAC6"}
              />

              {/* <!-- Inner Circle --> */}
              <circle cx="0" cy="0" r="8" fill = {footer === "Settings" ? "#4FDBC8" : "#BBCAC6"} />

              {/* <!-- Center Dot --> */}
              <circle cx="0" cy="0" r="3" fill = "#111319" />
            </g>
          </svg>
          <h3>Setting</h3>
        </div>
      </div>
    </div>
  );
}
