"use client";

import { Clock3, Trash2, User, Equal } from '@/components/icons';

export default function InterviewRoundItem({ round, index, onDelete, onReactivate}) {
  if (!round) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1E40AF] text-xs font-bold text-white shadow-2xs">
          {index + 1}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{round.title}</h3>

          {round.active ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Clock3 size={13} className="text-[#1E40AF]" />
                {round.duration} Minutes
              </span>

              <span>•</span>

              <span className="flex items-center gap-1 font-medium">
                <User size={13} className="text-[#1E40AF]" />
                {round.interviewer}
              </span>
            </div>
          ) : (
            <span className="mt-0.5 inline-flex rounded-sm badge-opacity-warning px-2 py-0.5 text-[10px] font-semibold">
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {round.active ? (
          <button
            type="button"
            onClick={() => onDelete(round.id)}
            className="rounded-lg cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-gray-200 transition-colors"
            aria-label="Delete round"
            title="Delete round"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onReactivate(round.id)}
            className="rounded-lg cursor-pointer p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-200 transition-colors"
            aria-label="Reactivate round"
            title="Reactivate round"
          >
            <Equal size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
