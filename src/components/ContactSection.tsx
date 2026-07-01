/**
 * ContactSection
 *
 * Icon-based contact links with full accessibility attributes.
 * All links: target="_blank", rel="noopener noreferrer", aria-label.
 * Min touch target 44×44px.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export interface ContactLink {
  platform: string;
  url: string;
  ariaLabel: string;
  icon: LucideIcon;
}

interface ContactSectionProps {
  links: ContactLink[];
}

export default function ContactSection({ links }: ContactSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Contact"
      className="p-6"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-xl font-medium mb-6 text-left"
        style={{ color: 'var(--color-text-heading)' }}
      >
        Get in touch
      </h2>
      <ul className="flex flex-wrap gap-4 list-none p-0 m-0">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <li key={link.platform}>
              <motion.a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0.15 : 0.4, delay: i * 0.06 }}
                className="flex items-center gap-2 px-4 rounded-lg font-medium text-sm no-underline"
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-heading)',
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {link.platform}
              </motion.a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
