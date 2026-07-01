/**
 * SkipNavLink
 *
 * First focusable element in the DOM. Visually hidden until focused,
 * then jumps keyboard focus to #main-content.
 *
 * Requirements: 12.6
 */

export default function SkipNavLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:outline-2 focus:outline-offset-2"
      style={{
        backgroundColor: 'var(--color-accent)',
        color: '#fff',
      }}
    >
      Skip to main content
    </a>
  );
}
