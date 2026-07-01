/**
 * ChannelHeader
 *
 * YouTube-channel-inspired header with banner, avatar, name, title,
 * intro, social links, and resume button.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import {
  Code2,
  Link,
  Mail,
  AtSign,
  BookOpen,
} from 'lucide-react';
import Banner from './Banner';
import type { ProfileData, SocialLink } from '@/data/profile';

interface ChannelHeaderProps extends Omit<ProfileData, 'githubUsername' | 'mediumUsername'> {}

const PLATFORM_ICONS: Record<SocialLink['platform'], React.ReactNode> = {
  email: <Mail size={20} aria-hidden="true" />,
  linkedin: <Link size={20} aria-hidden="true" />,
  medium: <BookOpen size={20} aria-hidden="true" />,
  twitter: <AtSign size={20} aria-hidden="true" />,
  github: <Code2 size={20} aria-hidden="true" />,
};

export default function ChannelHeader({
  name,
  title,
  intro,
  photoSrc,
  resumeUrl,
  socialLinks,
}: ChannelHeaderProps) {
  const hasResume = typeof resumeUrl === 'string' && resumeUrl.length > 0;

  return (
    <header>
      <Banner />
      <div
        className="flex flex-col sm:flex-row items-start gap-6 px-6 py-6"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Avatar */}
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={`${name} profile photo`}
            width={200}
            height={200}
            className="rounded-full object-cover shrink-0"
            style={{ width: 200, height: 200 }}
          />
        ) : (
          <div
            className="rounded-full shrink-0 flex items-center justify-center text-4xl font-light"
            style={{
              width: 200,
              height: 200,
              background: 'var(--color-accent-bg)',
              border: '2px solid var(--color-accent-border)',
              color: 'var(--color-accent)',
            }}
            aria-hidden="true"
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-3 text-left flex-1">
          <div>
            <h1
              className="text-3xl font-medium"
              style={{
                fontSize: '2rem',
                letterSpacing: '-0.5px',
                margin: 0,
                color: 'var(--color-text-heading)',
              }}
            >
              {name}
            </h1>
            <p className="mt-1 text-base" style={{ color: 'var(--color-text)' }}>
              {title}
            </p>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text)' }}
          >
            {intro}
          </p>

          {/* Social links */}
          <nav aria-label="Social links">
            <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
              {socialLinks.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded transition-colors"
                    style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    {PLATFORM_ICONS[link.platform]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resume button */}
          {hasResume ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium self-start"
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              Resume
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium self-start cursor-not-allowed opacity-40"
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
              }}
            >
              Resume
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
