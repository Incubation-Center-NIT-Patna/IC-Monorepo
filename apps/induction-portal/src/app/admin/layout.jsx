import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col">
      {/* Fixed Top Navbar */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#111319]">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24" style={{
    paddingBottom: "calc(var(--footer-height) + 1rem)",
  }}>
        {children}
      </main>

      {/* Fixed Bottom Footer */}
      <div className="sticky bottom-0 z-50 border-b border-white/5 bg-[#111319]">
        <Footer />
      </div>
    </div>
  );
}