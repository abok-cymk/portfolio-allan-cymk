/**
 * Property-based tests for Storage_Service.
 *
 * Property 9: Storage_Service write-failure safety
 * Feature: portfolio-website, Property 9: Storage_Service write-failure safety
 * For any key/value pair, when localStorage.setItem throws, set() SHALL return
 * false, SHALL NOT propagate an exception, and get() SHALL return the in-memory value.
 *
 * Validates: Requirements 9.7, 15.1, 15.3
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fc from 'fast-check';

async function freshService() {
  vi.resetModules();
  localStorage.clear();
  const mod = await import('./storage.service');
  return mod.StorageService;
}

// ---------------------------------------------------------------------------
// Property 9: Storage_Service write-failure safety
// ---------------------------------------------------------------------------
describe('StorageService — Property 9: write-failure safety', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('set() returns false, does not throw, and get() returns in-memory value for arbitrary keys/values', async () => {
    // Feature: portfolio-website, Property 9: Storage_Service write-failure safety
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 40 }),
        fc.string({ minLength: 0, maxLength: 100 }),
        async (key, value) => {
          const svc = await freshService();

          // Make setItem throw after service is initialised
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('QuotaExceededError');
          });

          let threw = false;
          let result: boolean | undefined;
          try {
            result = svc.set(key, value);
          } catch {
            threw = true;
          }

          expect(threw).toBe(false);
          expect(result).toBe(false);
          expect(svc.get<string>(key)).toBe(value);

          vi.restoreAllMocks();
        },
      ),
      { numRuns: 50 },
    );
  });
});
