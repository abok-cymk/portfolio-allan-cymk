/**
 * Storage_Service
 *
 * Wraps localStorage with availability detection and an in-memory fallback.
 * On instantiation, performs a test write/read to determine if localStorage
 * is available. If unavailable (or if any subsequent operation throws),
 * all reads/writes are transparently redirected to an in-memory Map.
 *
 * Requirements: 15.1, 15.3
 */

class StorageServiceImpl {
  private _available: boolean;
  private _store: Map<string, unknown>;

  constructor() {
    this._store = new Map();
    this._available = this._detectAvailability();
  }

  /**
   * Attempts a test write and read against localStorage.
   * Returns false if anything throws (private browsing, quota, permissions).
   */
  private _detectAvailability(): boolean {
    const TEST_KEY = '__storage_test__';
    try {
      localStorage.setItem(TEST_KEY, '1');
      const result = localStorage.getItem(TEST_KEY);
      localStorage.removeItem(TEST_KEY);
      return result === '1';
    } catch {
      return false;
    }
  }

  /** Returns true if localStorage is available and operational. */
  isAvailable(): boolean {
    return this._available;
  }

  /**
   * Reads a value by key.
   * Returns null when the key is not found or when JSON.parse fails.
   * Falls back to in-memory store when localStorage is unavailable.
   * Also consults the in-memory store when localStorage returns null, so
   * that values written via a failed set() (which always mirrors to the Map)
   * remain readable within the same session.
   */
  get<T>(key: string): T | null {
    if (!this._available) {
      const value = this._store.get(key);
      return value !== undefined ? (value as T) : null;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
      // localStorage returned null — check in-memory mirror as fallback
      // (covers the case where a previous set() wrote to the mirror after a
      //  localStorage write failure mid-session)
      const inMemory = this._store.get(key);
      return inMemory !== undefined ? (inMemory as T) : null;
    } catch {
      return null;
    }
  }

  /**
   * Writes a value under the given key.
   * Returns true on success, false on any localStorage error (no throw).
   * Falls back to in-memory store when localStorage is unavailable
   * (always returns true in that case since the Map never fails).
   */
  set<T>(key: string, value: T): boolean {
    if (!this._available) {
      this._store.set(key, value);
      return true;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Mirror in-memory so get() can read from the map when localStorage fails later
      this._store.set(key, value);
      return true;
    } catch {
      // On localStorage failure, keep the value in the in-memory store so
      // subsequent get() calls still return the last attempted value.
      this._store.set(key, value);
      return false;
    }
  }
}

/** Singleton instance — shared across the entire application. */
export const StorageService = new StorageServiceImpl();
