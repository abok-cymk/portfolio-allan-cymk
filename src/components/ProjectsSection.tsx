/**
 * ProjectsSection
 *
 * Responsive grid of ProjectCards. Shows empty-state when no projects.
 * Viewport-enter animation via Framer Motion.
 *
 * Requirements: 3.1, 3.8, 10.2
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import type { ProjectData } from '@/lib/projects';

interface ProjectsSectionProps {
  projects: ProjectData[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const enterVariant = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0.15 : 0.4 },
  };

  if (projects.length === 0) {
    return (
      <section aria-label="Projects" className="p-8 text-center">
        <p style={{ color: 'var(--color-text)' }}>No projects available yet.</p>
      </section>
    );
  }

  return (
    <section aria-label="Projects" className="p-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={enterVariant.initial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...enterVariant.transition, delay: i * 0.05 }}
          >
            <ProjectCard
              project={project}
              onClick={() => navigate(`/projects/${project.slug}`)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
