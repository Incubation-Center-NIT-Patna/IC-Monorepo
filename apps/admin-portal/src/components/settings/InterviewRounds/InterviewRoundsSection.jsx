"use client";

import CardWrapper from "@/components/Common/CardWrapper";
import SectionTitle from "@/components/Common/SectionTitle";
import { Users, Plus } from '@/components/icons';
import InterviewRoundsList from "./InterviewRoundsList";

export default function InterviewRoundsSection({rounds = [], onAddRound, onDeleteRound, onReactivate }) {
  return (
    <CardWrapper className="bg-white border border-[#E2E8F0] p-4 rounded-md">
      <SectionTitle
        title="Interview Rounds"
        action={onAddRound}
        icon={<Users size={16} fill="none" className="stroke-[#1E40AF]" />}
        actionIcon={<Plus size={15} />}
        actionText="Add Round"
      />
      <InterviewRoundsList rounds={rounds} onDelete={onDeleteRound} onReactivate={onReactivate}/>
    </CardWrapper>
  );
}
