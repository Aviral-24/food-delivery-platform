import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('app_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeClass = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('app_theme', theme);
};

const initialTheme = getInitialTheme();
applyThemeClass(initialTheme);

export const useThemeStore = create((set, get) => ({
  /** @type {'light' | 'dark'} */
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeClass(next);
    set({ theme: next });
  },
}));