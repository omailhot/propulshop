export const THEME_STORAGE_KEY = 'propulso-theme'

export const THEME_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const key = '${THEME_STORAGE_KEY}';
    const saved = localStorage.getItem(key);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch {}
})();
`
