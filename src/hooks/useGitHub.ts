/**
 * useGitHub
 *
 * Calls GitHub_Service.fetchGitHubData() in a useEffect and returns
 * loading / error / data state.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useEffect, useState } from 'react';
import { type GitHubData, fetchGitHubData } from '@/services/github.service';

interface UseGitHubResult {
  data: GitHubData | null;
  loading: boolean;
  error: string | null;
}

export function useGitHub(username: string): UseGitHubResult {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchGitHubData(username)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('GitHub data could not be loaded.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { data, loading, error };
}
