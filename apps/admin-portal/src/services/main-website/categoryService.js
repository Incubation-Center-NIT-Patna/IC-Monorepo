import apiClient from '@/lib/api';

export const CategoryService = {
  async getCategories(moduleName) {
    try {
      const res = await apiClient.get(`/cms/categories/${moduleName}`);
      if (res && Array.isArray(res.categories)) {
        return res.categories;
      }
      return [];
    } catch (err) {
      console.warn(`Failed to fetch categories for ${moduleName} from API:`, err);
      return [];
    }
  },

  async addCategory(moduleName, newCategory) {
    if (!newCategory || typeof newCategory !== 'string') return;
    const cleanCat = newCategory.trim();
    if (!cleanCat) return;

    try {
      await apiClient.post(`/cms/categories/${moduleName}`, { name: cleanCat });
      return await this.getCategories(moduleName);
    } catch (err) {
      console.error(`Failed to add category to ${moduleName}:`, err);
      return await this.getCategories(moduleName);
    }
  },

  async deleteCategory(moduleName, categoryToDelete) {
    try {
      await apiClient.delete(`/cms/categories/${moduleName}/${encodeURIComponent(categoryToDelete)}`);
      return await this.getCategories(moduleName);
    } catch (err) {
      console.error(`Failed to delete category from ${moduleName}:`, err);
      return await this.getCategories(moduleName);
    }
  },
};

export default CategoryService;
