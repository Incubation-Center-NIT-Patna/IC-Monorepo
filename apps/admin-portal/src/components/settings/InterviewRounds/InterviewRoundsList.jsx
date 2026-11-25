"use client";

import InterviewRoundItem from "./InterviewRoundItem";

export default function InterviewRoundsList({ rounds = [], onDelete, onReactivate }) {
  if (!rounds || rounds.length === 0) {
    return (
      <p className="mt-4 text-xs text-slate-500 text-center py-6 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
        No interview rounds configured yet.
      </p>
    );
  }

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
