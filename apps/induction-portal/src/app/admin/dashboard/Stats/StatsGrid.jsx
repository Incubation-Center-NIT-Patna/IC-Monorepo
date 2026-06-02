import StatCard from "./StatCard";

export default function StatsGrid({ stats = []}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.id}
          title={item.title}
          value={item.value}
          icon={item.icon}
          iconColor={item.iconColor}
          badge={item.badge}
          badgeColor={item.badgeColor}
        />
      ))}
    </div>
  );
}