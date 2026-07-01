/**
 * SkillsSection
 *
 * Renders skill categories with badge-style tags.
 *
 * Requirements: 6.1, 6.2, 10.2
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { SkillCategory } from '@/data/skills';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

export default function SkillsSection({ categories }: SkillsSectionProps) {
  const reducedMotion = useReducedMotion();
  const enterProps = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: reducedMotion ? 0.15 : 0.4 },
  };

  return (
    <section aria-label="Skills" className="p-6">
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
        {categories.map((category, i) => (
          <motion.div
            key={category.name}
            {...enterProps}
            transition={{ ...enterProps.transition, delay: i * 0.08 }}
          >
            <h3
              className="text-base font-medium mb-3"
              style={{ color: 'var(--color-text-heading)' }}
            >
              {category.name}
            </h3>
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {category.skills.map((skill) => (
                <li
                  key={skill}
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
