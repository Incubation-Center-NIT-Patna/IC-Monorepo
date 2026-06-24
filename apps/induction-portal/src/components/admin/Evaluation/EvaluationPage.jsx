"use client";

import { useState } from "react";
import CardWrapper from "@/components/Common/CardWrapper";
import CandidateHeader from "./CandidateHeader";
import SkillEvaluationList from "./SkillEvaluation";

import { candidate, metrics as initialMetrics } from "@/constants/evaluation.constants";

export default function EvaluationPage() {
  const [metrics, setMetrics] = useState(initialMetrics);

  const onScoreChange = (metricId, score) => {
    setMetrics((prevMetrics) =>
      prevMetrics.map((metric) =>
        metric.id === metricId
          ? { ...metric, score }
          : metric
      )
    );
  };

  return (
    <CardWrapper className="w-full space-y-4 bg-transparent border-none">
      <CandidateHeader candidate={candidate} />

      <SkillEvaluationList
        metrics={metrics}
        onScoreChange={onScoreChange}
      />
    </CardWrapper>
  );
}