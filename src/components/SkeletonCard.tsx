/**
 * SkeletonCard
 *
 * Animated pulse placeholder for articles, repos, and the contribution graph.
 *
 * Requirements: 5.7, 7.4
 */

interface SkeletonCardProps {
  variant: 'article' | 'repo' | 'graph';
}

export default function SkeletonCard({ variant }: SkeletonCardProps) {
  const pulse = {
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-secondary)',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  if (variant === 'graph') {
    return (
      <div
        style={{ ...pulse, width: '100%', height: '120px' }}
        aria-hidden="true"
        role="presentation"
      />
    );
  }

  if (variant === 'repo') {
    return (
      <div
        style={{
          ...pulse,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          height: '100px',
        }}
        aria-hidden="true"
        role="presentation"
      >
        <div style={{ height: '14px', borderRadius: 4, background: 'var(--color-border)', width: '60%' }} />
        <div style={{ height: '12px', borderRadius: 4, background: 'var(--color-border)', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: 4, background: 'var(--color-border)', width: '40%' }} />
      </div>
    );
  }

  // article variant
  return (
    <div
      style={{
        ...pulse,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}
      aria-hidden="true"
      role="presentation"
    >
      <div style={{ height: '180px', background: 'var(--color-border)' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '14px', borderRadius: 4, background: 'var(--color-border)', width: '90%' }} />
        <div style={{ height: '12px', borderRadius: 4, background: 'var(--color-border)', width: '60%' }} />
        <div style={{ height: '12px', borderRadius: 4, background: 'var(--color-border)', width: '40%' }} />
      </div>
    </div>
  );
}
