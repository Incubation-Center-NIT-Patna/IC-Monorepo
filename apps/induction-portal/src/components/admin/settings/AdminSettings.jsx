"use client";

import React, { useEffect, useState } from "react";

import EvaluationParameters from "@/components/admin/settings/EvaluationParameters";
import ScoringScale from "@/components/admin/settings/ScoringScale";
import InterviewRoundsSection from "./InterviewRounds/InterviewRoundsSection";
import VisibilityPrivacySettings from "./VisibilityPrivacy/VisibilityPrivacySettings";
import ConfigurationActions from "./ConfigurationActions";
import AddInterviewRoundModal from "./InterviewRounds/AddInterviewRoundModal";
import Toast from "@/components/common/Toast";

// Constants, Utils, Services
import { DEFAULT_INTERVIEW_ROUNDS, DEFAULT_PRIVACY_SETTINGS } from "@/constants/settings.constants";
import { createEmptyRound } from "@/utils/settings.utils";
import { loadSettings, saveSettings, resetSettings } from "@/services/settings.services";

export default function Page() {
  const [rounds, setRounds] = useState(DEFAULT_INTERVIEW_ROUNDS);
  const [settings, setSettings] = useState(DEFAULT_PRIVACY_SETTINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addRound, setAddRound] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {setToast({ message, type })};

  useEffect(() => {
    const savedData = loadSettings();
    if (!savedData) return;

    if (Array.isArray(savedData.rounds)) {
      setRounds(savedData.rounds);
    }

    if (Array.isArray(savedData.privacySettings)) {
      setSettings(savedData.privacySettings);
    }
  }, []);

  const handleAddRound = () => {
    const round = createEmptyRound();
    setAddRound(round);
    setIsModalOpen(true);
  };

  const handleDeleteRound = (roundId) => {
    setRounds((prev) =>
      prev.filter((round) => round.id !== roundId)
    );
    showToast("Round removed. Save to keep this change.", "info");
  };

  const handleRoundFormChange = (field, value) => {
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

    if (!addRound?.duration || Number(addRound.duration) <= 0)
      return showToast("Please enter a valid duration.", "error");

    const round = {
      ...addRound,
      title: addRound.title.trim(),
      duration: Number(addRound.duration),
      interviewer: addRound.interviewer.trim(),
    };

    setRounds((prev) => [...prev, round]);
    setIsModalOpen(false);
    setAddRound(null);

    showToast("Round added. Save to keep this change.", "success");
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
    
    showToast("Privacy setting updated.", "info" );
  };

  // Save & Reset Handlers
  const handleSave = () => {
    saveSettings({ rounds, privacySettings: settings });
    showToast( "Configuration saved.", "success");
  };

  const handleReset = () => {
    setRounds(DEFAULT_INTERVIEW_ROUNDS);
    setSettings(DEFAULT_PRIVACY_SETTINGS);
    setAddRound(null);
    resetSettings();
    showToast("Configuration reset to default.","success");
  };

  return (
    <div className="w-full text-gray-100 selection:bg-[#10B981]/20">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Admin Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            Configure the technical induction framework and evaluation logic.
          </p>
        </div>

        <div className="w-full space-y-5">
          <EvaluationParameters />
          <ScoringScale />

          <InterviewRoundsSection
            rounds={rounds}
            onAddRound={handleAddRound}
            onDeleteRound={handleDeleteRound}
          />

          <VisibilityPrivacySettings
            settings={settings}
            onToggle={handleTogglePrivacy}
          />
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