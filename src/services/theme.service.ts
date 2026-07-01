/**
 * Theme_Service
 *
 * Provides theme persistence and application for dark/light mode switching.
 * Reads from and writes to localStorage via StorageService, and directly
 * manipulates document.documentElement.dataset.theme to drive CSS variable
 * overrides defined in index.css.
 *
 * Requirements: 9.2, 9.3, 9.4, 9.6, 9.7
 */

import { StorageService } from './storage.service';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'theme';

/**
 * Reads the stored theme from localStorage.
 * Returns the stored value if it is exactly 'dark' or 'light'.
 * Falls back to 'dark' for any other value (missing key, corrupted data, etc.).
 */
export function getTheme(): Theme {
  const stored = StorageService.get<string>(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return 'dark';
}

/**
 * Persists the given theme to localStorage via StorageService and
 * immediately applies it to the document so CSS variables take effect.
 */
export function setTheme(theme: Theme): void {
  StorageService.set(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Sets document.documentElement.dataset.theme to the given theme value.
 * This drives the [data-theme="dark"] / [data-theme="light"] CSS selectors
 * defined in index.css.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
