import { STORAGE_KEY } from "@/constants/settings.constants";

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveSettings = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetSettings = () => {
  localStorage.removeItem(STORAGE_KEY);
};
