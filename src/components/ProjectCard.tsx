/**
 * ProjectCard
 *
 * YouTube-style card for a project. Handles image load failure with a
 * styled placeholder. Framer Motion hover animation ≤ 1.03 scale.
 * Supports prefers-reduced-motion.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.7, 10.3, 10.6
 */

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Code2 } from 'lucide-react';
import { useState } from 'react';
import type { ProjectData } from '@/lib/projects';

interface ProjectCardProps {
  project: ProjectData;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const reducedMotion = useReducedMotion();

  const hoverVariants = reducedMotion
    ? {}
    : { scale: 1.03, boxShadow: 'var(--shadow-card)' };

  const desc =
    project.description.length > 150
      ? project.description.slice(0, 147) + '…'
      : project.description;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <motion.article
      role="button"
      tabIndex={0}
      aria-label={`View project: ${project.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileHover={hoverVariants}
      transition={{ duration: 0.15 }}
      className="flex flex-col text-left rounded-lg overflow-hidden cursor-pointer"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Thumbnail */}
      {project.thumbnail && !imgError ? (
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          className="w-full object-cover"
          style={{ height: '180px' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center text-sm font-medium px-4"
          style={{
            height: '180px',
            background: 'var(--color-accent-bg)',
            color: 'var(--color-accent)',
          }}
        >
          {project.title}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3
          className="font-medium text-base leading-snug"
          style={{ color: 'var(--color-text-heading)' }}
        >
          {project.title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text)' }}>
          {desc}
        </p>

        {/* Tech tags */}
        <ul className="flex flex-wrap gap-1 list-none p-0 m-0 mt-1">
          {project.technologies.slice(0, 6).map((tech) => (
            <li
              key={tech}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-accent-bg)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              {tech}
            </li>
          ))}
        </ul>

        {/* Links */}
        <div className="flex gap-3 mt-auto pt-2">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} repository`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--color-text)' }}
          >
            <Code2 size={14} aria-hidden="true" /> Repo
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live demo`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-accent)' }}
            >
              <ExternalLink size={14} aria-hidden="true" /> Demo
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
