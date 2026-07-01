/**
 * ThemeToggle
 *
 * Accessible button that toggles between dark and light themes.
 *
 * Requirements: 9.5, 9.6
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="fixed bottom-6 right-6 flex items-center justify-center w-11 h-11 rounded-full shadow-lg z-50 transition-colors"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-heading)',
        cursor: 'pointer',
      }}
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
