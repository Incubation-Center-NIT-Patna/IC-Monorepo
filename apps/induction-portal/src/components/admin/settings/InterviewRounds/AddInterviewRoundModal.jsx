"use client";

import Modal from "@/components/Common/Modal";

export default function AddInterviewRoundModal({ isOpen, round, onClose, onChange, onSubmit}) {
  return (
    <Modal isOpen={isOpen} title="Add Interview Round" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-300">
              Round Title
            </span>

            <input
              value={round?.title ?? ""}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Technical Screening"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">Duration</span>

            <input
              value={round?.duration ?? ""}
              onChange={(e) => onChange("duration", e.target.value)}
              placeholder="30 Minutes"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Interviewer
            </span>

            <input
              value={round?.interviewer ?? ""}
              onChange={(e) => onChange("interviewer", e.target.value)}
              placeholder="Peer Lead"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border cursor-pointer border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl cursor-pointer bg-[#4FDBC8] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#4FDBC8]/80"
          >
            Add Round
          </button>
        </div>
      </form>
    </Modal>
  );
}
