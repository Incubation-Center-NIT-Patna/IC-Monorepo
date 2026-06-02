export default function AdminLayout({ children }) {
  return (
    <div
      className="min-h-screen bg-[#020817] text-white" >
      {/* Main Content */}
      <main className=" w-full px-4 py-5 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl" >
          {children}
        </div>
      </main>
    </div>
  );
}
