/**
 * useArticles
 *
 * Subscribes to RSS_Service.fetchArticles() and returns loading/error/data
 * state for the ArticlesSection component.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7
 */

import { useEffect, useState } from 'react';
import { type ArticleData, fetchArticles } from '@/services/rss.service';

interface UseArticlesResult {
  articles: ArticleData[];
  loading: boolean;
  error: string | null;
}

export function useArticles(username: string): UseArticlesResult {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const subscription = fetchArticles(username).subscribe({
      next(data) {
        setArticles(data);
        setLoading(false);
      },
      error() {
        setError(
          'Articles could not be loaded. Check your connection or visit Medium directly.',
        );
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [username]);

  return { articles, loading, error };
}
