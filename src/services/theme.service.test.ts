/**
 * Tests for Theme_Service.
 * Covers the round-trip property (Property 5) and unit cases.
 *
 * Requirements: 9.2, 9.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Reset modules between tests to get a fresh StorageService singleton
async function freshThemeService() {
  vi.resetModules();
  localStorage.clear();
  const mod = await import('./theme.service');
  return mod;
}

describe('Theme_Service — unit tests', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('getTheme() returns "dark" when no value is stored', async () => {
    const { getTheme } = await freshThemeService();
    expect(getTheme()).toBe('dark');
  });

  it('getTheme() returns "dark" when stored value is invalid', async () => {
    localStorage.setItem('theme', 'invalid');
    const { getTheme } = await freshThemeService();
    expect(getTheme()).toBe('dark');
  });

  it('setTheme("light") persists and applies light theme', async () => {
    const { setTheme, getTheme } = await freshThemeService();
    setTheme('light');
    expect(getTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('setTheme("dark") persists and applies dark theme', async () => {
    const { setTheme, getTheme } = await freshThemeService();
    setTheme('dark');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('applyTheme sets document.documentElement.dataset.theme', async () => {
    const { applyTheme } = await freshThemeService();
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// Property 5: Theme round-trip
// Feature: portfolio-website, Property 5: Theme round-trip
// For any call to Theme_Service.setTheme(value) where value is "dark" or
// "light", a subsequent getTheme() SHALL return value and
// document.documentElement.dataset.theme SHALL equal value.
// ---------------------------------------------------------------------------
describe('Theme_Service — Property 5: Theme round-trip', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('round-trip holds for both theme values', async () => {
    // Feature: portfolio-website, Property 5: Theme round-trip
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('dark' as const, 'light' as const),
        async (theme) => {
          vi.resetModules();
          localStorage.clear();
          const { setTheme, getTheme } = await import('./theme.service');
          setTheme(theme);
          expect(getTheme()).toBe(theme);
          expect(document.documentElement.dataset.theme).toBe(theme);
        },
      ),
      { numRuns: 10 },
    );
  });
});
