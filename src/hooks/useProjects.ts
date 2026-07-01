/**
 * useProjects / useProject
 *
 * Parses all Markdown files in src/content/projects/ via import.meta.glob,
 * validates with validateProjects(), sorts with sortProjects(), and returns
 * the final ProjectData[].
 *
 * Requirements: 3.1, 3.2, 3.4, 3.5, 13.1
 */

import { useMemo } from 'react';
import { parseFrontmatter } from '@/lib/parseFrontmatter';
import { type ProjectData, sortProjects, validateProjects } from '@/lib/projects';

// Vite resolves this glob at build time; each value is a raw Markdown string.
const rawFiles = import.meta.glob('../content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseAllProjects(): ProjectData[] {
  const raw = Object.entries(rawFiles).map(([filepath, content]) => {
    const filename = filepath.split('/').pop() ?? filepath;
    const { data, content: body } = parseFrontmatter(content);
    return { ...data, body, _filename: filename } as Record<string, unknown> & {
      _filename: string;
      body: string;
    };
  });

  const valid = validateProjects(raw);
  return sortProjects(valid);
}

/** Returns the full list of validated, sorted projects. */
export function useProjects(): ProjectData[] {
  return useMemo(() => parseAllProjects(), []);
}

/** Returns a single project matching the given slug, or undefined. */
export function useProject(slug: string): ProjectData | undefined {
  const projects = useProjects();
  return useMemo(() => projects.find((p) => p.slug === slug), [projects, slug]);
}
