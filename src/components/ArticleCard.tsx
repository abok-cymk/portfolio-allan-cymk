/**
 * ArticleCard
 *
 * Displays a Medium article summary with cover image, title, date, and
 * reading time. Date formatted as "Month DD, YYYY".
 *
 * Requirements: 5.4, 10.3
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import type { ArticleData } from '@/services/rss.service';

interface ArticleCardProps {
  article: ArticleData;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);
  const reducedMotion = useReducedMotion();

  const hoverVariants = reducedMotion ? {} : { scale: 1.03, boxShadow: 'var(--shadow-card)' };

  return (
    <motion.article
      whileHover={hoverVariants}
      transition={{ duration: 0.15 }}
      className="flex flex-col text-left rounded-lg overflow-hidden"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Cover image */}
      {article.coverImageUrl && !imgError ? (
        <img
          src={article.coverImageUrl}
          alt=""
          loading="lazy"
          className="w-full object-cover"
          style={{ height: '180px' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full"
          style={{
            height: '180px',
            background: 'var(--color-accent-bg)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-base leading-snug hover:underline"
          style={{ color: 'var(--color-text-heading)' }}
        >
          {article.title}
        </a>
        <p className="text-xs" style={{ color: 'var(--color-text)' }}>
          {formatDate(article.pubDate)}
          {article.readingTime && (
            <span> · {article.readingTime}</span>
          )}
        </p>
      </div>
    </motion.article>
  );
}
