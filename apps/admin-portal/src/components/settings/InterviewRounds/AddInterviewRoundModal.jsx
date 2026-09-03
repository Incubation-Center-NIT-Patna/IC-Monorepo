"use client";

import Modal from "@/components/Common/Modal";

export default function AddInterviewRoundModal({ isOpen, round, onClose, onChange, onSubmit}) {
  return (
    <Modal isOpen={isOpen} title="Add Interview Round" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold text-gray-700">
              Round Title *
            </span>

            <input
              value={round?.title ?? ""}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Technical Screening"
              className="w-full rounded-lg border border-[#EBEDF2] bg-[#F8F9FA] px-3.5 py-2 text-xs font-medium text-gray-900 outline-none transition-all focus:border-[#1F3BB3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700">Duration (Minutes) *</span>

            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={round?.duration ?? ""}
              onChange={(e) => onChange("duration", e.target.value)}
              placeholder="30"
              className="w-full rounded-lg border border-[#EBEDF2] bg-[#F8F9FA] px-3.5 py-2 text-xs font-medium text-gray-900 outline-none transition-all focus:border-[#1F3BB3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700">
              Interviewer Name *
            </span>

            <input
              value={round?.interviewer ?? ""}
              onChange={(e) => onChange("interviewer", e.target.value)}
              placeholder="Peer Lead / Mentor"
              className="w-full rounded-lg border border-[#EBEDF2] bg-[#F8F9FA] px-3.5 py-2 text-xs font-medium text-gray-900 outline-none transition-all focus:border-[#1F3BB3] focus:bg-white"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#EBEDF2]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border cursor-pointer border-[#EBEDF2] px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg cursor-pointer bg-[#1F3BB3] hover:bg-[#172B85] px-4 py-2 text-xs font-bold text-white transition shadow-xs"
          >
            Add Round
          </button>
        </div>
      </form>
    </Modal>
  );
}
