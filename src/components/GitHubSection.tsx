/**
 * GitHubSection
 *
 * Shows contribution graph, featured repos, and recent repos.
 * Handles loading skeleton and error fallback.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useGitHub } from '@/hooks/useGitHub';
import SkeletonCard from './SkeletonCard';

interface GitHubSectionProps {
  username: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(d);
}

export default function GitHubSection({ username }: GitHubSectionProps) {
  const { data, loading, error } = useGitHub(username);
  const reducedMotion = useReducedMotion();

  const enterProps = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: reducedMotion ? 0.15 : 0.4 },
  };

  return (
    <section
      aria-label="GitHub activity"
      className="p-6"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-xl font-medium mb-6 text-left"
        style={{ color: 'var(--color-text-heading)' }}
      >
        GitHub
      </h2>

      {loading && (
        <div className="flex flex-col gap-4">
          <SkeletonCard variant="graph" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} variant="repo" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <p>{error}</p>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block underline"
            style={{ color: 'var(--color-accent)' }}
          >
            View GitHub profile
          </a>
        </div>
      )}

      {!loading && !error && data && (
        <div className="flex flex-col gap-8">
          {/* Contribution graph */}
          <motion.div {...enterProps}>
            <img
              src={data.contributionGraphUrl}
              alt="GitHub contribution graph"
              loading="lazy"
              className="w-full rounded-lg"
              style={{ border: '1px solid var(--color-border)' }}
            />
          </motion.div>

          {/* Featured repos */}
          {data.featuredRepos.length > 0 && (
            <div>
              <h3
                className="text-base font-medium mb-3 text-left"
                style={{ color: 'var(--color-text-heading)' }}
              >
                Featured repositories
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {data.featuredRepos.map((repo, i) => (
                  <motion.a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} repository`}
                    {...enterProps}
                    transition={{ ...enterProps.transition, delay: i * 0.05 }}
                    className="flex flex-col gap-2 p-4 rounded-lg text-left no-underline"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-heading)' }}>
                      {repo.name}
                    </span>
                    {repo.description && (
                      <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                        {repo.description}
                      </span>
                    )}
                    <div className="flex gap-3 text-xs mt-auto" style={{ color: 'var(--color-text)' }}>
                      {repo.language && <span>{repo.language}</span>}
                      <span className="flex items-center gap-1">
                        <Star size={12} aria-hidden="true" /> {repo.stars}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Recent repos */}
          {data.recentRepos.length > 0 && (
            <div>
              <h3
                className="text-base font-medium mb-3 text-left"
                style={{ color: 'var(--color-text-heading)' }}
              >
                Recent activity
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {data.recentRepos.map((repo, i) => (
                  <motion.a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} repository`}
                    {...enterProps}
                    transition={{ ...enterProps.transition, delay: i * 0.05 }}
                    className="flex flex-col gap-2 p-4 rounded-lg text-left no-underline"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-heading)' }}>
                      {repo.name}
                    </span>
                    {repo.description && (
                      <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                        {repo.description}
                      </span>
                    )}
                    <span className="text-xs mt-auto" style={{ color: 'var(--color-text)' }}>
                      Updated {formatDate(repo.updatedAt)}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
