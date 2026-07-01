/**
 * useRecentlyViewed
 *
 * Reads and writes the recentlyViewed slug array in StorageService.
 * Enforces deduplication (moves existing slug to front) and a 5-item cap.
 *
 * Requirements: 4.6, 15.2, 15.3
 */

import { useCallback, useState } from 'react';
import { StorageService } from '@/services/storage.service';

const KEY = 'recentlyViewed';
const MAX = 5;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    return StorageService.get<string[]>(KEY) ?? [];
  });

  const addRecentlyViewed = useCallback((slug: string) => {
    const current = StorageService.get<string[]>(KEY) ?? [];
    // Remove existing occurrence, prepend, cap at MAX
    const updated = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX);
    StorageService.set(KEY, updated);
    setRecentlyViewed(updated);
  }, []);

  return { recentlyViewed, addRecentlyViewed };
}
