"use client";

import React, { useEffect, useState } from "react";

import EvaluationParameters from "@/components/settings/EvaluationParameters";
import ScoringScale from "@/components/settings/ScoringScale";
import InterviewRoundsSection from "./InterviewRounds/InterviewRoundsSection";
import VisibilityPrivacySettings from "./VisibilityPrivacy/VisibilityPrivacySettings";
import ConfigurationActions from "./ConfigurationActions";
import AddInterviewRoundModal from "./InterviewRounds/AddInterviewRoundModal";
import Toast from "@/components/Common/Toast";

import PageHeader from "@/components/common/PageHeader";
import { Sliders, Save } from "@/components/icons";

// Constants, Utils, Services
import { DEFAULT_INTERVIEW_ROUNDS, DEFAULT_PRIVACY_SETTINGS } from "@/constants/settings.constants";
import { createEmptyRound } from "@/utils/settings.utils";
import { loadSettings, saveSettings, resetSettings } from "@/services/settings.services";

export default function Page() {
  const [rounds, setRounds] = useState(() => {
    const savedData = loadSettings();
    return Array.isArray(savedData?.rounds) ? savedData.rounds : DEFAULT_INTERVIEW_ROUNDS;
  });
  const [settings, setSettings] = useState(() => {
    const savedData = loadSettings();
    return Array.isArray(savedData?.privacySettings) ? savedData.privacySettings : DEFAULT_PRIVACY_SETTINGS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addRound, setAddRound] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {setToast({ message, type })};

  const handleAddRound = () => {
    const round = createEmptyRound();
    setAddRound(round);
    setIsModalOpen(true);
  };

  const handleDeleteRound = (roundId) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId ? { ...round, active: false } : round
      )
    );
    showToast("Interview Round deactivated.", "info");
  };

  const handleReactivate = (roundId) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId ? { ...round, active: true } : round
      )
    );
    showToast("Interview Round reactivated.", "info");
  };

  const handleRoundFormChange = (field, value) => {
    if (field === "duration") value = value.replace(/\D/g, "");

    setAddRound((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddRound(null);
  };

  const handleSubmitRound = (event) => {
    event.preventDefault();

    if (!addRound?.title?.trim())
      return showToast("Round title is required.", "error");
    
    if (!addRound?.interviewer?.trim())
      return showToast("Interviewer name is required.", "error");

    const duration = Number.parseInt(addRound?.duration ?? "", 10);
    if (!Number.isFinite(duration) || duration <= 0)
      return showToast("Please enter a valid duration.", "error");

    const round = {
      ...addRound,
      title: addRound.title.trim(),
      duration: duration,
      interviewer: addRound.interviewer.trim(),
    };

    setRounds((prev) => [...prev, round]);
    setIsModalOpen(false);
    setAddRound(null);

    showToast("New Interview Round added.", "success");
  };

  const handleTogglePrivacy = (settingId) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? {
              ...setting,
              enabled: !setting.enabled,
            }
          : setting
      )
    );
  };

  // Save & Reset Handlers
  const handleSave = () => {
    saveSettings({ rounds, privacySettings: settings });
    showToast("Configuration saved successfully.", "success");
  };

  const handleReset = () => {
    const confirmation = window.confirm("Are you sure you want to reset all settings to default? This action cannot be undone.");
    if (!confirmation) return;

    setRounds(DEFAULT_INTERVIEW_ROUNDS);
    setSettings(DEFAULT_PRIVACY_SETTINGS);
    setAddRound(null);
    resetSettings();
    showToast("Configuration reset to default.", "success");
  };

  return (
    <div className="w-full text-slate-900">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-5">
        {/* Page Header */}
        <PageHeader
          icon={Sliders}
          title="Induction Settings"
          description="Configure evaluation parameters, scoring scales, and interview rounds."
          actionText="Save Configuration"
          actionIcon={Save}
          onAction={handleSave}
        />



        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Evaluation Parameters & Scoring Scale */}
          <div className="lg:col-span-6 space-y-5">
            <EvaluationParameters />
            <ScoringScale />
          </div>

          {/* Right Column: Interview Rounds & Visibility / Privacy Settings */}
          <div className="lg:col-span-6 space-y-5">
            <InterviewRoundsSection
              rounds={rounds}
              onAddRound={handleAddRound}
              onDeleteRound={handleDeleteRound}
              onReactivate={handleReactivate}
            />

            <VisibilityPrivacySettings
              settings={settings}
              onToggle={handleTogglePrivacy}
            />
          </div>
        </div>

        <ConfigurationActions onSave={handleSave} onReset={handleReset} />
      </div>

      {/*Add Round Modal*/}
      {addRound && (
        <AddInterviewRoundModal
          isOpen={isModalOpen}
          round={addRound}
          onClose={handleCloseModal}
          onChange={handleRoundFormChange}
          onSubmit={handleSubmitRound}
        />
      )}
    </div>
  );
}