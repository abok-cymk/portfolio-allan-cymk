/**
 * NotFoundPage
 *
 * Rendered for unmatched routes or when a project slug has no match.
 * Provides a back link to the homepage.
 *
 * Requirements: 4.2
 */

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center"
    >
      <h1 className="text-6xl font-light" style={{ color: 'var(--color-accent)' }}>
        404
      </h1>
      <p className="text-lg" style={{ color: 'var(--color-text-heading)' }}>
        Page not found
      </p>
      <p style={{ color: 'var(--color-text)' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-2 underline"
        style={{ color: 'var(--color-accent)' }}
      >
        ← Back to home
      </Link>
    </main>
  );
}
