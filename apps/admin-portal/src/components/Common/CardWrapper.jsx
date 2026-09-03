export default function CardWrapper({ children, className = '' }) {
  return (
    <div
      className={`rounded-md border border-[#E2E8F0] bg-white text-[#0F172A] shadow-xs transition-all ${className}`}
    >
      {children}
    </div>
  );
}