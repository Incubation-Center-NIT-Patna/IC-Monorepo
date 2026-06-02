import {Users, CheckCircle2, Hourglass, BarChart3} from "lucide-react";

export const statsData = [
  {
    id: 1,
    title: "TOTAL CANDIDATES",
    value: "100",
    icon: Users,
    iconColor: "text-emerald-400",
    badge: "+12%",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
  },

  {
    id: 2,
    title: "COMPLETED",
    value: "35",
    icon: CheckCircle2,
    iconColor: "text-violet-300",
  },

  {
    id: 3,
    title: "PENDING",
    value: "65",
    icon: Hourglass,
    iconColor: "text-orange-300",
  },

  {
    id: 4,
    title: "AVG SCORE",
    value: "84.2%",
    icon: BarChart3,
    iconColor: "text-cyan-400",
  },
];