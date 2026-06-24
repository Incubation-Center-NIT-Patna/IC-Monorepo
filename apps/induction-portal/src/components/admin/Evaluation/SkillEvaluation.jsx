import SkillCard from "./SkillCard";
import SectionTitle from "@/components/Common/SectionTitle";

export default function SkillEvaluationList({ metrics, onScoreChange }) {
  const step = 2; //later we can get these data dynamically
  const totalSteps = 4;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Skill Evaluation"
        badge={`Step ${step} of ${totalSteps}`}
      />
      {metrics.map((metric) => (
        <SkillCard
          key={metric.id}
          metric={metric}
          onScoreChange={onScoreChange}
        />
      ))}
    </div>
  );
}
