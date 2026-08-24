"use client";

import CardWrapper from "@/components/Common/CardWrapper";
import SectionTitle from "@/components/Common/SectionTitle";
import PrivacySettingItem from "./PrivacySettingItem";
import { Eye } from '@/components/icons';

export default function VisibilityPrivacySettings({ settings = [], onToggle }) {
  return (
    <CardWrapper className="bg-white border border-[#E2E8F0] p-4 rounded-md">
      <SectionTitle icon={<Eye size={18} fill="none" className="stroke-[#1E40AF]"/>} title="Visibility & Privacy" />
      <div className="mt-3 divide-y divide-[#E2E8F0] bg-[#F8FAFC] overflow-hidden rounded-md border border-[#E2E8F0]">
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
