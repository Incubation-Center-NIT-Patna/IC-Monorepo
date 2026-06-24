import CardWrapper from "@/components/Common/CardWrapper";
import { Clock4 } from "lucide-react";

export default function CandidateHeader({ candidate }) {
  return (
    <CardWrapper className="w-full space-y-1 border border-[#3C4947] p-4 sm:p-6 bg-[#191B22]">
      <h2 className="text-xl text-[#E2E2EB] font-semibold">
        {candidate.name}
      </h2>
      <p className="text-sm text-[#BBCAC6]">
        {candidate.role}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <Clock4 size={16} fill="none" className="stroke-[#4FDBC8] mt-1" />
        <span className="text-[#859490]">Batch: {candidate.batch}</span>
      </div>
    </CardWrapper>
  );
}
