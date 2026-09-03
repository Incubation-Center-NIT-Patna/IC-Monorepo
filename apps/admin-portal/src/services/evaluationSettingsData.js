// Master table configuration managed from the Admin Settings Dashboard
export const EVALUATION_PARAMETERS_CONFIG = [
  { id: '1', name: 'Technical Proficiency', weight: 40 },
  { id: '2', name: 'Communication Skills', weight: 30 },
  { id: '3', name: 'Problem Solving', weight: 20 },
  { id: '4', name: 'Cultural Fit', weight: 10 }
];

export async function getEvaluationSettings() {
  // Simulates an async database fetch for settings
  return EVALUATION_PARAMETERS_CONFIG;
}