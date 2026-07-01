/**
 * Project pipeline — pure validation and sort functions.
 *
 * validateProjects: filters raw parsed frontmatter objects, emitting
 *   console.warn for missing required fields and duplicate slugs.
 * sortProjects: places featured projects first, then alphabetical by title.
 *
 * Requirements: 13.2, 13.4, 13.5, 13.6
 */

export interface ProjectData {
  // Required frontmatter
  title: string;
  slug: string;
  description: string;       // 1–300 chars
  technologies: string[];    // 1–20 items
  github: string;            // valid URL

  // Optional frontmatter
  featured?: boolean;
  demo?: string;
  thumbnail?: string;
  mediumPosts?: string[];

  // Derived at parse time
  body: string;
  _filename: string;
}

const REQUIRED_FIELDS = ['title', 'slug', 'description', 'technologies', 'github'] as const;

/**
 * Accepts an array of raw objects (from gray-matter + filename), returns
 * only fully-valid ProjectData entries.
 *
 * Emits console.warn for:
 *  - Missing required fields: "[portfolio] Missing fields in {file}: {fields}"
 *  - Duplicate slugs:         "[portfolio] Duplicate slug "{slug}" in {files}"
 */
export function validateProjects(
  raw: Array<Record<string, unknown> & { _filename: string; body: string }>,
): ProjectData[] {
  // ── Step 1: filter out entries with missing required fields ──────────────
  const fieldValid: typeof raw = [];

  for (const entry of raw) {
    const missing = REQUIRED_FIELDS.filter(
      (f) => entry[f] === undefined || entry[f] === null || entry[f] === '',
    );

    if (missing.length > 0) {
      console.warn(
        `[portfolio] Missing fields in ${entry._filename}: ${missing.join(', ')}`,
      );
    } else {
      fieldValid.push(entry);
    }
  }

  // ── Step 2: detect and exclude duplicate slugs ───────────────────────────
  const slugMap = new Map<string, string[]>(); // slug → filenames

  for (const entry of fieldValid) {
    const slug = entry.slug as string;
    const existing = slugMap.get(slug) ?? [];
    existing.push(entry._filename);
    slugMap.set(slug, existing);
  }

  const duplicateSlugs = new Set<string>();

  for (const [slug, files] of slugMap.entries()) {
    if (files.length > 1) {
      duplicateSlugs.add(slug);
      console.warn(
        `[portfolio] Duplicate slug "${slug}" in ${files.join(', ')}`,
      );
    }
  }

  // ── Step 3: build final ProjectData[], excluding duplicates ─────────────
  return fieldValid
    .filter((entry) => !duplicateSlugs.has(entry.slug as string))
    .map((entry) => ({
      title: entry.title as string,
      slug: entry.slug as string,
      description: entry.description as string,
      technologies: entry.technologies as string[],
      github: entry.github as string,
      featured: entry.featured as boolean | undefined,
      demo: entry.demo as string | undefined,
      thumbnail: entry.thumbnail as string | undefined,
      mediumPosts: entry.mediumPosts as string[] | undefined,
      body: entry.body,
      _filename: entry._filename,
    }));
}

/**
 * Sorts projects: featured === true first, then alphabetical by title
 * (case-insensitive) within each group.
 */
export function sortProjects(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort((a, b) => {
    const aFeatured = a.featured === true;
    const bFeatured = b.featured === true;

    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;

    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });
}
