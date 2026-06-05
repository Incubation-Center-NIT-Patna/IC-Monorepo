"use client";

import CardWrapper from "@/components/Common/CardWrapper";
import SectionTitle from "@/components/Common/SectionTitle";
import PrivacySettingItem from "./PrivacySettingItem";
import { Eye } from "lucide-react";

export default function VisibilityPrivacySettings({ settings = [], onToggle }) {
  return (
    <CardWrapper className="bg-transparent border-none">
      <SectionTitle icon={<Eye size={22} fill="none" className="stroke-[#4FDBC8]"/>} title="Visibility & Privacy" />
      <div className="mt-4 divide-y divide-[#262B37] bg-[#151821] divide-border overflow-hidden rounded-xl border border-1 border-[#262B37]">
        {settings.map((setting) => (
          <PrivacySettingItem
            key={setting.id}
            setting={setting}
            onToggle={onToggle}
          />
        ))}
      </div>
    </CardWrapper>
  );
}
