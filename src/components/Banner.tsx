/**
 * Banner
 *
 * Full-width decorative image at the top of ChannelHeader.
 * Falls back to a CSS gradient placeholder when src is absent or fails.
 *
 * Requirements: 1.2
 */

import { useState } from 'react';

interface BannerProps {
  src?: string;
  alt?: string;
}

export default function Banner({ src, alt = '' }: BannerProps) {
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !src || imgError;

  const placeholderStyle: React.CSSProperties = {
    width: '100%',
    height: '200px',
    background:
      'linear-gradient(135deg, var(--color-accent-bg) 0%, var(--color-bg-secondary) 100%)',
    display: 'block',
  };

  if (showPlaceholder) {
    return <div style={placeholderStyle} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
      onError={() => setImgError(true)}
    />
  );
}
