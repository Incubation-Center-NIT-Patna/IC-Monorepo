const STORAGE_KEY = 'ic_admin_dynamic_categories';

const DEFAULT_CATEGORIES = {
  events: ['Flagship Event', 'Hackathon', 'Speaker Talk', 'Workshop', 'Demo Day'],
  notices: ['Incubation', 'Event', 'Workshop', 'Grant', 'General Notice'],
  incubations: ['CleanTech', 'AI Hardware', 'EdTech', 'MedTech', 'FinTech', 'SaaS'],
  gallery: ['Events', 'Labs', 'Mentorship', 'Pitchtember'],
  faqs: ['General', 'Eligibility', 'Funding', 'IP Support'],
  team: ['faculty', 'student'],
};

export const CategoryService = {
  getCategories(moduleName) {
    if (typeof window === 'undefined') {
      return DEFAULT_CATEGORIES[moduleName] || [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed[moduleName]) {
          return parsed[moduleName];
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_CATEGORIES[moduleName] || [];
  },

  addCategory(moduleName, newCategory) {
    if (!newCategory || typeof newCategory !== 'string') return;
    const cleanCat = newCategory.trim();
    if (!cleanCat) return;

    const current = this.getCategories(moduleName);
    if (!current.includes(cleanCat)) {
      const updated = [...current, cleanCat];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const parsed = stored ? JSON.parse(stored) : { ...DEFAULT_CATEGORIES };
          parsed[moduleName] = updated;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          console.error('Error saving dynamic category:', e);
        }
      }
      return updated;
    }
    return current;
  },

  deleteCategory(moduleName, categoryToDelete) {
    const current = this.getCategories(moduleName);
    const updated = current.filter((c) => c !== categoryToDelete);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : { ...DEFAULT_CATEGORIES };
        parsed[moduleName] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('Error deleting dynamic category:', e);
      }
    }
    return updated;
  },
};
