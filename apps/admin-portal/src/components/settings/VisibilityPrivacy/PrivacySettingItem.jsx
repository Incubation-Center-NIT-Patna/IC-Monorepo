"use client";

import ToggleSwitch from "@/components/Common/ToggleSwitch";

export default function PrivacySettingItem({ setting, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white px-4 py-3.5">
      <div className="min-w-0">
        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
          {setting.title || setting.label}
        </h4>
        {setting.description && (
          <p className="text-slate-600 text-xs mt-0.5">{setting.description}</p>
        )}
      </div>

      <ToggleSwitch
        enabled={Boolean(setting.enabled)}
        label={`Toggle ${setting.title || setting.label}`}
        onChange={() => onToggle(setting.id)}
      />
    </div>
  );
}
