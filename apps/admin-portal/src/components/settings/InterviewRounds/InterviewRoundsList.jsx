"use client";

import InterviewRoundItem from "./InterviewRoundItem";

export default function InterviewRoundsList({ rounds = [], onDelete, onReactivate }) {
  return (
    <div className="mt-4 space-y-3">
      {rounds.map((round, index) => (
        <InterviewRoundItem
          key={round.id}
          round={round}
          index={index}
          onDelete={onDelete}
          onReactivate={onReactivate}
        />
      ))}
    </div>
  );
}
