// @/services/candidateScoresData.js

export const MOCK_CANDIDATE_SCORES = [
  { id: '1', score: 3.0 }, // Technical Skills
  { id: '2', score: 3.5 }, // Communication
  { id: '3', score: 2.0 }, // Problem Solving
  { id: '4', score: 4.5 }  // Cultural/Team Fit
];

export async function getCandidateScores() {
  return MOCK_CANDIDATE_SCORES;
}