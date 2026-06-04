import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-12 sm:px-10 sm:py-16 shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,219,200,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_40%)]" />

          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center rounded-full border border-[#4FDBC8]/30 bg-[#4FDBC8]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#8be7da]">
              Feature coming soon
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.3em] text-[#7a9490] uppercase">
                404
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                This page is still under construction.
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-7 text-[#b7c7c3]">
                The section you tried to reach has not been launched yet. We are
                preparing it for the induction portal, and it will be available
                soon.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-[#4FDBC8] px-6 py-3 text-sm font-semibold text-[#041010] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#73e4d6]"
              >
                Go to home
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-[#4FDBC8]/50 hover:bg-[#4FDBC8]/10"
              >
                View dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
