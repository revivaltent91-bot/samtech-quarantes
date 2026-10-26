export const THEME_KEY = 'quarantes-theme';

/**
 * Script anti-flash exécuté avant le premier paint : applique la classe
 * `.dark` sur <html> selon la préférence stockée ou système.
 * (cf. DESIGN-SYSTEM-THEME-I18N §4.2 — clef partagée vitrine & console)
 */
export const noFoucScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* localStorage indisponible */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}