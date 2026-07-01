/**
 * AboutSection
 *
 * Renders extended bio text from profile.ts.
 *
 * Requirements: 12.4
 */

import { motion, useReducedMotion } from 'framer-motion';

interface AboutSectionProps {
  intro: string;
  name: string;
}

export default function AboutSection({ intro, name }: AboutSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-label="About" className="p-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reducedMotion ? 0.15 : 0.4 }}
        className="--max-w-2xl mx-auto text-left"
      >
        <h2
          className="text-xl font-medium mb-4"
          style={{ color: 'var(--color-text-heading)' }}
        >
          About {name}
        </h2>
        <p className="leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {intro}
        </p>
      </motion.div>
    </section>
  );
}
