export default function CardWrapper({ children, className="" }){
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}