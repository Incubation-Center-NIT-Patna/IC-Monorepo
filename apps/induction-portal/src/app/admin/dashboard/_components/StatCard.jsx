import CardWrapper from "@/components/Common/CardWrapper";

export default function StatCard({title, value, icon: Icon, iconColor, badge, badgeColor }) {
  return (
    <CardWrapper className="!p-3.5 sm:!p-4 flex flex-col justify-between">
      <div className="mb-2 sm:mb-3 flex items-start justify-between">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/5">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
        </div>

        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`} >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 sm:mt-3">
        <p className="text-[11px] sm:text-xs font-medium tracking-wide text-gray-400 truncate">
          {title}
        </p>

        <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-bold text-white leading-none">
          {value}
        </h2>
      </div>
    </CardWrapper>
  );
}
