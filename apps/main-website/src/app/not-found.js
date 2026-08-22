import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050810] bg-[radial-gradient(#142850_1px,#050810_1px)] [background-size:20px_20px] text-white flex flex-col items-center justify-center px-4 pt-28 pb-16">
      <div className="max-w-[480px] w-full p-8 rounded-3xl bg-white/[0.03] border border-[#0ef]/30 backdrop-blur-xl shadow-[0_0_40px_rgba(0,238,255,0.12)] flex flex-col items-center text-center">
        <h1 className="text-6xl font-extrabold text-[#0ef] tracking-tight mb-2 drop-shadow-[0_0_20px_#0ef]">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-white/70 leading-relaxed mb-6">
          The ecosystem page or resource you are looking for does not exist or has been relocated.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0ef] text-[#050810] font-bold text-sm shadow-[0_0_20px_rgba(0,238,255,0.4)] transition-all hover:bg-white hover:text-black hover:scale-105"
        >
          Return to Home →
        </Link>
      </div>
    </main>
  );
}

