"use client";

import React, { useEffect, useState, useCallback } from "react";

import EvaluationParameters from "@/components/settings/EvaluationParameters";
import ScoringScale from "@/components/settings/ScoringScale";
import InterviewRoundsSection from "./InterviewRounds/InterviewRoundsSection";
import VisibilityPrivacySettings from "./VisibilityPrivacy/VisibilityPrivacySettings";
import ConfigurationActions from "./ConfigurationActions";
import AddInterviewRoundModal from "./InterviewRounds/AddInterviewRoundModal";
import Toast from "@/components/Common/Toast";

import PageHeader from "@/components/common/PageHeader";
import { Sliders, Save, RefreshCw } from "@/components/icons";

// Constants, Utils, Services
import { createEmptyRound } from "@/utils/settings.utils";
import {
  loadAllSettings as loadSettings,
  saveAllSettings as saveSettings,
  resetAllSettings as resetSettings,
  getTeamsAndRounds as fetchTeamsAndRounds,
  getPrivacySettings as fetchPrivacySettingsApi,
  getEvaluationParameters as fetchEvaluationParametersApi,
  createInterviewRound as createRoundApi,
  deleteInterviewRound as deleteRoundApi,
  saveRoundParameters as saveParametersApi,
} from "@/services/incubation/incubationSettingsService";

export default function IncubationSettingsPanel() {
  const [rounds, setRounds] = useState([]);
  const [settings, setSettings] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addRound, setAddRound] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedTeams, fetchedPrivacy, fetchedParams] = await Promise.all([
        fetchTeamsAndRounds(),
        fetchPrivacySettingsApi(),
        fetchEvaluationParametersApi(),
      ]);

      if (fetchedPrivacy && Array.isArray(fetchedPrivacy) && fetchedPrivacy.length > 0) {
        setSettings(fetchedPrivacy);
      }

      if (fetchedParams && Array.isArray(fetchedParams) && fetchedParams.length > 0) {
        setEvaluationParameters(fetchedParams);
      }

      if (fetchedTeams && fetchedTeams.length > 0) {
        setTeams(fetchedTeams);
        setSelectedTeamId(fetchedTeams[0].id);

        // Convert backend rounds to UI format if present
        const backendRounds = [];
        fetchedTeams.forEach((team) => {
          if (team.interviewRounds) {
            team.interviewRounds.forEach((r) => {
              backendRounds.push({
                id: r.id,
                title: `${team.name} - ${r.roundName}`,
                duration: r.duration || 15,
                interviewer: "Assigned Evaluator",
                active: r.active,
                teamId: team.id,
              });
            });
          }
        });

        if (backendRounds.length > 0) {
          setRounds(backendRounds);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch settings from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddRound = () => {
    const round = createEmptyRound();
    setAddRound(round);
    setIsModalOpen(true);
  };

  const handleDeleteRound = async (roundId) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId ? { ...round, active: false } : round
      )
    );

    try {
      await deleteRoundApi(roundId);
      showToast("Interview Round deactivated on server.", "info");
    } catch {
      showToast("Interview Round deactivated locally.", "info");
    }
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

  const handleSubmitRound = async (event) => {
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

    // Call API if team exists
    if (selectedTeamId) {
      try {
        await createRoundApi(selectedTeamId, {
          roundName: round.title,
          roundNumber: rounds.length + 1,
          duration: round.duration,
        });
        showToast("New Interview Round persisted to server.", "success");
        return;
      } catch (err) {
        console.warn("API round creation error, preserved locally:", err);
      }
    }

    showToast("New Interview Round added locally.", "success");
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
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveSettings({
        rounds,
        privacySettings: settings,
        evaluationParameters,
      });

      // Sync parameters to active rounds in database
      if (rounds && rounds.length > 0) {
        for (const round of rounds) {
          if (round.id && !round.id.startsWith("temp-")) {
            try {
              await saveParametersApi(
                round.id,
                evaluationParameters.map((p) => ({
                  parameterName: p.name,
                  weighttage: Number(p.weight) || 10,
                }))
              );
            } catch (err) {
              console.warn("Could not sync round parameters:", err);
            }
          }
        }
      }

      showToast("Evaluation parameters & settings saved to database successfully.", "success");
    } catch (err) {
      console.error("Save settings error:", err);
      showToast("Failed to save settings to database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to reset all settings to default? This action cannot be undone."
    );
    if (!confirmation) return;

    setRounds(DEFAULT_INTERVIEW_ROUNDS);
    setSettings(DEFAULT_PRIVACY_SETTINGS);
    setEvaluationParameters(DEFAULT_EVALUATION_PARAMETERS);
    setAddRound(null);
    await resetSettings();
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
          actionText={isLoading ? "Loading..." : "Save Configuration"}
          actionIcon={isLoading ? RefreshCw : Save}
          onAction={handleSave}
        />

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Evaluation Parameters & Scoring Scale */}
          <div className="lg:col-span-6 space-y-5">
            <EvaluationParameters
              parameters={evaluationParameters}
              onParametersChange={setEvaluationParameters}
            />
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

      {/* Add Round Modal */}
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
