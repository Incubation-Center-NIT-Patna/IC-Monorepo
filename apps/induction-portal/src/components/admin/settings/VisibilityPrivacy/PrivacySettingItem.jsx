"use client";

import ToggleSwitch from "@/components/Common/ToggleSwitch";

export default function PrivacySettingItem({ setting, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-transparent px-5 py-4">
      <div>
        <h4 className="font-medium text-sm">{setting.title}</h4>
        <p className="text-slate-400 text-xs">{setting.description}</p>
      </div>

      <ToggleSwitch
        enabled={setting.enabled}
        label={`Toggle ${setting.title}`}
        onChange={() => onToggle(setting.id)}
      />
    </div>
  );
}
