import apiClient from "@/lib/api";
import InductionService from "./inductionService";

export const getTeamsAndRounds = async () => {
  try {
    const res = await InductionService.getTeams();
    return res.teams || [];
  } catch (err) {
    console.warn("Failed to fetch teams and rounds from API:", err);
    return null;
  }
};

export const createInterviewRound = async (teamId, roundData) => {
  return InductionService.createRound(teamId, roundData);
};

export const updateInterviewRound = async (roundId, roundData) => {
  return InductionService.updateRound(roundId, roundData);
};

export const deleteInterviewRound = async (roundId) => {
  return InductionService.deleteRound(roundId);
};

export const saveRoundParameters = async (roundId, parameters) => {
  return InductionService.saveParameters(roundId, parameters);
};

export const getPrivacySettings = async () => {
  try {
    const res = await apiClient.get("/settings/privacy_settings");
    return res.value || [];
  } catch (err) {
    console.warn("Failed to fetch privacy settings from API:", err);
    return null;
  }
};

export const updatePrivacySettings = async (privacySettings) => {
  const res = await apiClient.put("/settings/privacy_settings", {
    value: privacySettings,
    category: "privacy",
  });
  return res.setting?.value || privacySettings;
};

export const getScoringScale = async () => {
  try {
    const res = await apiClient.get("/settings/scoring_scale");
    return res.value || null;
  } catch (err) {
    console.warn("Failed to fetch scoring scale from API:", err);
    return null;
  }
};

export const updateScoringScale = async (scoringScale) => {
  const res = await apiClient.put("/settings/scoring_scale", {
    value: scoringScale,
    category: "scoring",
  });
  return res.setting?.value || scoringScale;
};

export const getEvaluationParameters = async () => {
  try {
    const res = await apiClient.get("/settings/evaluation_parameters");
    return res.value || null;
  } catch (err) {
    console.warn("Failed to fetch evaluation parameters from API:", err);
    return null;
  }
};

export const updateEvaluationParameters = async (evaluationParameters) => {
  const res = await apiClient.put("/settings/evaluation_parameters", {
    value: evaluationParameters,
    category: "evaluation",
  });
  return res.setting?.value || evaluationParameters;
};

export const loadAllSettings = async () => {
  try {
    const [privacySettings, scoringScale, evaluationParameters] = await Promise.all([
      getPrivacySettings(),
      getScoringScale(),
      getEvaluationParameters(),
    ]);
    return { privacySettings, scoringScale, evaluationParameters };
  } catch {
    return null;
  }
};

export const saveAllSettings = async (data) => {
  const promises = [];
  if (data?.privacySettings) {
    promises.push(updatePrivacySettings(data.privacySettings));
  }
  if (data?.scoringScale) {
    promises.push(updateScoringScale(data.scoringScale));
  }
  if (data?.evaluationParameters) {
    promises.push(updateEvaluationParameters(data.evaluationParameters));
  }
  await Promise.all(promises);
};

export const resetAllSettings = async () => {
  const defaultPrivacy = [
    {
      id: "eval_scores",
      label: "Mask candidate evaluation raw scores from other evaluators until round concludes",
      enabled: true,
    },
    {
      id: "auto_sync",
      label: "Automatically sync qualified candidates with main website member directory",
      enabled: true,
    },
  ];
  await updatePrivacySettings(defaultPrivacy);
};

export const IncubationSettingsService = {
  getTeamsAndRounds,
  createInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  saveRoundParameters,
  getPrivacySettings,
  updatePrivacySettings,
  getScoringScale,
  updateScoringScale,
  getEvaluationParameters,
  updateEvaluationParameters,
  loadAllSettings,
  saveAllSettings,
  resetAllSettings,
};

export default IncubationSettingsService;
