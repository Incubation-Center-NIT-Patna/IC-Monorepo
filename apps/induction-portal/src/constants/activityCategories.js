

export const ACTIVITY_CATEGORIES = {
  'task-submitted': {
    label: 'submitted a task',
    imagePath: '/img/task-submitted.png', // Load from public/img folder
  },
  'query-made': {
    label: 'asked a query',
    imagePath: '/img/query-made.png',
  },
  'evaluation-made': {
    label: 'completed an evaluation',
    imagePath: '/img/evaluation-made.png',
  },
  'settings-updated': {
    label: 'updated project settings',
    imagePath: '/img/settings-updated.png',
  }
};

/**
 * Fallback configuration in case the API passes a category 
 * that hasn't been defined in our frontend registry yet.
 */
export const DEFAULT_CATEGORY_FALLBACK = {
  label: 'performed an action',
  imagePath: '/img/default-activity.png',
};