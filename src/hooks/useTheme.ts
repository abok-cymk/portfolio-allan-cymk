/**
 * useTheme
 *
 * Returns [theme, toggleTheme]. Reads initial theme from Theme_Service
 * and calls setTheme() on toggle.
 *
 * Requirements: 9.5, 9.6
 */

import { useState } from 'react';
import { type Theme, getTheme, setTheme } from '@/services/theme.service';

export function useTheme(): [Theme, () => void] {
  const [theme, setLocalTheme] = useState<Theme>(() => getTheme());

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setLocalTheme(next);
  }

  return [theme, toggleTheme];
}
