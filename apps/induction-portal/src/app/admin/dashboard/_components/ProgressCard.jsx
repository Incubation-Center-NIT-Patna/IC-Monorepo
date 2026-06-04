import CardWrapper from "@/components/Common/CardWrapper";

export default function ProgressCard({ progress }) {
  const { title="Progress Status", val=0 } = progress || {};
  const status=Math.min(Math.max(val, 0), 100);

  return (
    <CardWrapper className="w-full !p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-300">
          {title}
        </h3>

        <span className="text-xs font-bold text-emerald-400">
          {status}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${status}%` }}
        />
      </div>
    </CardWrapper>
  );
}
