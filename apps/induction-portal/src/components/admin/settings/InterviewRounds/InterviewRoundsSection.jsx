"use client";

import CardWrapper from "@/components/Common/CardWrapper";
import SectionTitle from "@/components/Common/SectionTitle";
import { Users, Plus } from "lucide-react";
import InterviewRoundsList from "./InterviewRoundsList";

export default function InterviewRoundsSection({rounds = [], onAddRound, onDeleteRound, onReactivate }) {
  return (
    <CardWrapper className="bg-transparent border-none">
      <SectionTitle
        title="Interview Rounds"
        action={onAddRound}
        icon={<Users size={16} fill="none" className="stroke-[#4FDBC8]" />}
        actionIcon={<Plus size={16} />}
        actionText="Add"
      />
      <InterviewRoundsList rounds={rounds} onDelete={onDeleteRound} onReactivate={onReactivate}/>
    </CardWrapper>
  );
}
