/**
 * ArticlesSection
 *
 * Shows 3 skeleton cards while loading, error message on failure,
 * or up to 10 ArticleCards on success.
 *
 * Requirements: 5.3, 5.5, 5.7, 10.2
 */

import { motion, useReducedMotion } from 'framer-motion';
import ArticleCard from './ArticleCard';
import SkeletonCard from './SkeletonCard';
import type { ArticleData } from '@/services/rss.service';

interface ArticlesSectionProps {
  articles: ArticleData[];
  loading: boolean;
  error: string | null;
}

export default function ArticlesSection({
  articles,
  loading,
  error,
}: ArticlesSectionProps) {
  const reducedMotion = useReducedMotion();
  const enterProps = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: reducedMotion ? 0.15 : 0.4 },
  };

  return (
    <section aria-label="Articles" className="p-6">
      {loading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} variant="article" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p
          role="alert"
          className="text-sm p-4 rounded-lg"
          style={{
            color: 'var(--color-text)',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 10).map((article, i) => (
            <motion.div key={article.url} {...enterProps} transition={{ ...enterProps.transition, delay: i * 0.05 }}>
              <ArticleCard article={article} />
            </motion.div>
          ))}
          {articles.length === 0 && (
            <p className="col-span-full text-sm" style={{ color: 'var(--color-text)' }}>
              No articles found.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
