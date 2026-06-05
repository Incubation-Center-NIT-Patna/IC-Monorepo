"use client";

import { Clock3, Trash2, User, Equal } from "lucide-react";

export default function InterviewRoundItem({ round, index, onDelete, onReactivate}) {
  if (!round) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#151821] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#33343B] text-lg font-semibold text-white">
          {index + 1}
        </div>

        <div>
          <h3 className="font-medium">{round.title}</h3>

          {round.active ? (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#BBCAC6]">
              <span className="flex items-center gap-1">
                <Clock3 size={14} />
                {round.duration} Minutes
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <User size={14} />
                {round.interviewer}
              </span>
            </div>
          ) : (
            <span className="mt-1 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
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
            className="rounded-lg cursor-pointer p-2 transition hover:text-red-400"
            aria-label="Delete round"
            title="Delete round"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={()=>onReactivate(round.id)}
            className="rounded-lg cursor-pointer p-2 transition hover:text-green-400"
            aria-label="Reactivate round"
            title="Delete round"
          >
            <Equal size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
