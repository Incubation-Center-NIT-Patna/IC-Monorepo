import CardWrapper from "@/components/Common/CardWrapper";

export default function StatCard({title, value, icon: Icon, iconColor, badge, badgeColor }) {
  return (
    <CardWrapper>
      <div className="mb-5 flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5" >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        {badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`} >
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm font-semibold tracking-wide text-gray-400">
        {title}
      </p>

      <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white">
        {value}
      </h2>
    </CardWrapper>
  );
}
