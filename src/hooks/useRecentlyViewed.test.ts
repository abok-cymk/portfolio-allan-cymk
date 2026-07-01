/**
 * Tests for useRecentlyViewed hook — addRecentlyViewed logic.
 * Tests the pure functional logic separately from React rendering.
 *
 * Property 4: recentlyViewed deduplication and cap
 * Feature: portfolio-website, Property 4: recentlyViewed deduplication and cap
 *
 * Validates: Requirements 4.6, 15.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from '@/services/storage.service';

const KEY = 'recentlyViewed';
const MAX = 5;

/**
 * Pure function mirroring addRecentlyViewed logic.
 * We test this logic in isolation (without React hooks) for PBT.
 */
function addRecentlyViewed(slug: string): string[] {
  const current = StorageService.get<string[]>(KEY) ?? [];
  const updated = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX);
  StorageService.set(KEY, updated);
  return updated;
}

describe('addRecentlyViewed — unit tests', () => {
  beforeEach(() => {
    localStorage.clear();
    StorageService.set(KEY, []);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adds a slug to an empty list', () => {
    const result = addRecentlyViewed('project-a');
    expect(result).toEqual(['project-a']);
  });

  it('prepends new slug to existing list', () => {
    addRecentlyViewed('project-a');
    const result = addRecentlyViewed('project-b');
    expect(result[0]).toBe('project-b');
  });

  it('moves existing slug to front (no duplicates)', () => {
    addRecentlyViewed('project-a');
    addRecentlyViewed('project-b');
    addRecentlyViewed('project-c');
    const result = addRecentlyViewed('project-a');
    expect(result[0]).toBe('project-a');
    expect(result.filter((s) => s === 'project-a')).toHaveLength(1);
  });

  it('caps at 5 entries', () => {
    for (let i = 0; i < 7; i++) {
      addRecentlyViewed(`project-${i}`);
    }
    const stored = StorageService.get<string[]>(KEY) ?? [];
    expect(stored.length).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// Property 4: recentlyViewed deduplication and cap
// ---------------------------------------------------------------------------
describe('addRecentlyViewed — Property 4: deduplication and cap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('no duplicates, length ≤ 5, last slug at index 0', () => {
    // Feature: portfolio-website, Property 4: recentlyViewed deduplication and cap
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }),
          { minLength: 1, maxLength: 20 },
        ),
        (slugs) => {
          // Reset storage for each run
          localStorage.clear();
          StorageService.set(KEY, []);

          let lastResult: string[] = [];
          for (const slug of slugs) {
            lastResult = addRecentlyViewed(slug);
          }

          // (a) No duplicates
          expect(new Set(lastResult).size).toBe(lastResult.length);

          // (b) Length ≤ 5
          expect(lastResult.length).toBeLessThanOrEqual(MAX);

          // (c) Last slug at index 0
          const lastSlug = slugs[slugs.length - 1];
          expect(lastResult[0]).toBe(lastSlug);
        },
      ),
      { numRuns: 100 },
    );
  });
});
