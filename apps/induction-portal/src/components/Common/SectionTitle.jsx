"use client";

export default function SectionTitle({ title, subtitle, actionText, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <button
          onClick={action}
          className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}