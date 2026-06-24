
 //  weightsArray - Array of objects containing { id, weight, ... }
 //  scoresArray - Array of objects containing { id, score, ... }


import { EVALUATION_PARAMETERS_CONFIG } from '@/services/evaluationSettingsData.js';
import { MOCK_CANDIDATE_SCORES } from '@/components/admin/Evaluation/candidateScoresData.js';

const calculateEvaluationSummary = (
  weightsArray = EVALUATION_PARAMETERS_CONFIG,
  scoresArray = MOCK_CANDIDATE_SCORES
) => {
  let totalScoreProductSum = 0;
  let totalWeightSum = 0;

  weightsArray.forEach((configItem) => {
    // Locate the matching score using the parameter ID
    const scoreItem = scoresArray.find((s) => s.id === configItem.id);

    if (scoreItem) {
      // Multiply the 0-5 score directly by its weight percentage value
      totalScoreProductSum += scoreItem.score * configItem.weight;
      totalWeightSum += configItem.weight;
    }
  });

  if (totalWeightSum === 0) {
    return { score: "0.00", recommendation: 'Pending' };
  }

  const aggregateScore = totalScoreProductSum / totalWeightSum;

  let recommendation = 'Pending';
  if (aggregateScore >= 4.0) {
    recommendation = 'Strong Hire';
  } else if (aggregateScore >= 3.0) {
    recommendation = 'Hire';
  } else if (aggregateScore >= 2.0) {
    recommendation = 'No Hire';
  } else {
    recommendation = 'Strong No Hire';
  }

  return {
    score: aggregateScore.toFixed(2), 
    recommendation: recommendation
  };
};

export default calculateEvaluationSummary;