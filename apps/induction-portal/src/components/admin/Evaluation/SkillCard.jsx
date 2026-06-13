import CardWrapper from "@/components/Common/CardWrapper";
import SkillSlider from "./SkillSlider";
import { SKILL_ICONS } from "@/constants/evaluation.constants";

export default function SkillCard({ metric, onScoreChange }) {
  const Icon = SKILL_ICONS[metric.icon];

  return (
    <CardWrapper className="w-full space-y-1.5 p-3.5 sm:p-4 bg-[#1E1F26] border border-[#3C4947]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-[#4FDBC8]" />}

          <h3 className="font-medium text-[#E2E2EB]">{metric.title}</h3>
        </div>

        <span className="text-[#4FDBC8] text-2xl font-semibold">
          {metric.score.toFixed(1)}
        </span>
      </div>

      <SkillSlider
        value={metric.score}
        onChange={(value) => onScoreChange(metric.id, value)}
      />

      <div className="flex justify-between text-xs text-[#859490]">
        <span>{metric.leftLabel}</span>
        <span>{metric.rightLabel}</span>
      </div>
    </CardWrapper>
  );
}
