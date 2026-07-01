import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/**
 * Unit tests for Storage_Service.
 * We re-import a fresh instance for each describe block by using a factory
 * helper that bypasses the module-level singleton.
 *
 * Requirements: 15.1, 15.3
 */

// ---------------------------------------------------------------------------
// Helper: build a fresh StorageServiceImpl instance (avoids singleton cache)
// ---------------------------------------------------------------------------
async function freshService() {
  // Dynamic re-import with cache-bust so we get a brand-new singleton state.
  // Vitest resets modules between tests only when vi.resetModules() is called.
  vi.resetModules();
  const mod = await import('./storage.service');
  return mod.StorageService;
}

// ---------------------------------------------------------------------------
// localStorage available — normal path
// ---------------------------------------------------------------------------
describe('StorageService — localStorage available', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('isAvailable() returns true when localStorage works', async () => {
    const svc = await freshService();
    expect(svc.isAvailable()).toBe(true);
  });

  it('set() stores a value and returns true', async () => {
    const svc = await freshService();
    const result = svc.set('myKey', { a: 1 });
    expect(result).toBe(true);
  });

  it('get() retrieves a stored value', async () => {
    const svc = await freshService();
    svc.set('greeting', 'hello');
    expect(svc.get<string>('greeting')).toBe('hello');
  });

  it('get() returns null for a missing key', async () => {
    const svc = await freshService();
    expect(svc.get('nonexistent')).toBeNull();
  });

  it('set() serialises objects correctly (round-trip)', async () => {
    const svc = await freshService();
    const data = { slugs: ['alpha', 'beta'], count: 2 };
    svc.set('data', data);
    expect(svc.get<typeof data>('data')).toEqual(data);
  });

  it('get() returns null when stored JSON is malformed', async () => {
    // Manually inject bad JSON directly into localStorage
    localStorage.setItem('badKey', '{not valid json');
    const svc = await freshService();
    expect(svc.get('badKey')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// localStorage unavailable — in-memory fallback
// ---------------------------------------------------------------------------
describe('StorageService — localStorage unavailable (in-memory fallback)', () => {
  beforeEach(() => {
    vi.resetModules();
    // Make setItem throw on the very first call (the availability test)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('isAvailable() returns false', async () => {
    const svc = await freshService();
    expect(svc.isAvailable()).toBe(false);
  });

  it('set() writes to in-memory store and returns true', async () => {
    const svc = await freshService();
    expect(svc.set('key', 42)).toBe(true);
  });

  it('get() retrieves value from in-memory store', async () => {
    const svc = await freshService();
    svc.set('theme', 'dark');
    expect(svc.get<string>('theme')).toBe('dark');
  });

  it('get() returns null for missing keys in in-memory store', async () => {
    const svc = await freshService();
    expect(svc.get('missing')).toBeNull();
  });

  it('stores arrays correctly in-memory (round-trip)', async () => {
    const svc = await freshService();
    const slugs = ['proj-a', 'proj-b', 'proj-c'];
    svc.set('recentlyViewed', slugs);
    expect(svc.get<string[]>('recentlyViewed')).toEqual(slugs);
  });
});

// ---------------------------------------------------------------------------
// localStorage write failure after availability detected (mid-session failure)
// ---------------------------------------------------------------------------
describe('StorageService — localStorage throws on set() after init', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('set() returns false and does not propagate when setItem throws after init', async () => {
    const svc = await freshService();
    // Service is available (init succeeded), now make setItem throw
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    expect(() => svc.set('key', 'value')).not.toThrow();
    expect(svc.set('key', 'value')).toBe(false);
  });

  it('get() returns value from in-memory mirror after set() failure', async () => {
    const svc = await freshService();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    svc.set('theme', 'light');
    expect(svc.get<string>('theme')).toBe('light');
  });
});
