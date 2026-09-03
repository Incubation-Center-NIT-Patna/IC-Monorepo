export const STORAGE_KEY = "induction-portal-settings";

export const DEFAULT_DURATION = 10; // Default duration in minutes for interview rounds

export const DEFAULT_INTERVIEW_ROUNDS = [
  {
    id: 1,
    title: "Technical Screening",
    duration: 15,
    interviewer: "Peer Lead",
    active: true,
  },
  {
    id: 2,
    title: "System Architecture",
    duration: 15,
    interviewer: "Tech Lead",
    active: true,
  },
  {
    id: 3,
    title: "HR / Cultural Interview",
    duration: 15,
    interviewer: "PR Lead",
    active: false,
  },
];

export const DEFAULT_PRIVACY_SETTINGS = [
  {
    id: "leaderboard",
    title: "Real-time Leaderboard",
    description: "Allow candidates to see ranks.",
    enabled: true,
  },
  {
    id: "anonymity",
    title: "Interviewer Anonymity",
    description: "Hide interviewer names from candidates.",
    enabled: false,
  },
  {
    id: "autoPublish",
    title: "Auto-publish Results",
    description: "Publish interview results automatically.",
    enabled: false,
  },
];
