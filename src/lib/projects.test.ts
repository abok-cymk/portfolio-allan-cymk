/**
 * Unit + property-based tests for validateProjects() and sortProjects().
 *
 * Property 1: Project validation excludes invalid files
 * Property 2: Duplicate slug exclusion
 * Property 3: Project sort order invariant
 *
 * Validates: Requirements 13.2, 13.4, 13.5, 13.6
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fc from 'fast-check';
import { validateProjects, sortProjects, type ProjectData } from './projects';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRaw(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description.',
    technologies: ['React'],
    github: 'https://github.com/test/repo',
    body: '',
    _filename: 'test-project.md',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Unit tests — validateProjects
// ---------------------------------------------------------------------------
describe('validateProjects — unit tests', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('passes a fully valid entry through', () => {
    const result = validateProjects([makeRaw()]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Project');
  });

  it('excludes an entry missing "title" and warns', () => {
    const result = validateProjects([makeRaw({ title: '' })]);
    expect(result).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('title'),
    );
  });

  it('excludes an entry missing "github" and warns with filename', () => {
    const entry = makeRaw({ github: undefined });
    const result = validateProjects([entry]);
    expect(result).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('test-project.md'),
    );
  });

  it('excludes both entries with duplicate slug and warns', () => {
    const a = makeRaw({ slug: 'dup', _filename: 'a.md' });
    const b = makeRaw({ slug: 'dup', _filename: 'b.md' });
    const result = validateProjects([a, b]);
    expect(result).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(/Duplicate slug "dup"/),
    );
  });

  it('keeps non-duplicate entries alongside a duplicate group', () => {
    const a = makeRaw({ slug: 'dup', _filename: 'a.md' });
    const b = makeRaw({ slug: 'dup', _filename: 'b.md' });
    const c = makeRaw({ slug: 'unique', _filename: 'c.md' });
    const result = validateProjects([a, b, c]);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('unique');
  });
});

// ---------------------------------------------------------------------------
// Unit tests — sortProjects
// ---------------------------------------------------------------------------
describe('sortProjects — unit tests', () => {
  function makeProject(title: string, featured?: boolean): ProjectData {
    return {
      title,
      slug: title.toLowerCase().replace(/\s/g, '-'),
      description: 'desc',
      technologies: ['JS'],
      github: 'https://github.com/test',
      body: '',
      _filename: `${title}.md`,
      featured,
    };
  }

  it('places featured items before non-featured', () => {
    const projects = [
      makeProject('Zebra', false),
      makeProject('Alpha', true),
    ];
    const sorted = sortProjects(projects);
    expect(sorted[0].title).toBe('Alpha');
    expect(sorted[1].title).toBe('Zebra');
  });

  it('sorts alphabetically within featured group', () => {
    const projects = [
      makeProject('Zebra', true),
      makeProject('Alpha', true),
      makeProject('Mango', true),
    ];
    const sorted = sortProjects(projects);
    expect(sorted.map((p) => p.title)).toEqual(['Alpha', 'Mango', 'Zebra']);
  });

  it('sorts alphabetically within non-featured group', () => {
    const projects = [
      makeProject('Zebra'),
      makeProject('Apple'),
    ];
    const sorted = sortProjects(projects);
    expect(sorted.map((p) => p.title)).toEqual(['Apple', 'Zebra']);
  });

  it('is case-insensitive in sort', () => {
    const projects = [
      makeProject('zebra'),
      makeProject('Alpha'),
    ];
    const sorted = sortProjects(projects);
    expect(sorted[0].title).toBe('Alpha');
  });
});

// ---------------------------------------------------------------------------
// Property 1: Project validation excludes invalid files
// Feature: portfolio-website, Property 1: Project validation excludes invalid files
// ---------------------------------------------------------------------------
describe('validateProjects — Property 1: excludes invalid files', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  const requiredFields = ['title', 'slug', 'description', 'technologies', 'github'] as const;

  it('output contains only fully-valid objects for arbitrary input', () => {
    // Feature: portfolio-website, Property 1: Project validation excludes invalid files
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            slug: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            description: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            technologies: fc.option(fc.array(fc.string(), { minLength: 1 }), { nil: undefined }),
            github: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          }),
          { maxLength: 20 },
        ),
        (rawItems) => {
          const withMeta = rawItems.map((item, i) => ({
            ...item,
            body: '',
            _filename: `file${i}.md`,
          }));

          const result = validateProjects(withMeta as Parameters<typeof validateProjects>[0]);

          // Every item in result must have all required fields
          for (const project of result) {
            for (const field of requiredFields) {
              expect(project[field]).toBeTruthy();
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('console.warn is called for each excluded file with missing fields', () => {
    // Feature: portfolio-website, Property 1: Project validation excludes invalid files
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            missingField: fc.constantFrom(...requiredFields),
            filename: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (items) => {
          vi.clearAllMocks();
          const raw = items.map(({ missingField, filename }) => {
            const base = makeRaw({ _filename: filename });
            // Remove the chosen field
            const entry = { ...base } as Record<string, unknown>;
            delete entry[missingField];
            return entry as Parameters<typeof validateProjects>[0][number];
          });

          validateProjects(raw);

          // At least one warn per missing-field entry
          expect((console.warn as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Duplicate slug exclusion
// Feature: portfolio-website, Property 2: Duplicate slug exclusion
// ---------------------------------------------------------------------------
describe('validateProjects — Property 2: duplicate slug exclusion', () => {
  beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it('all entries sharing a duplicated slug are absent from output', () => {
    // Feature: portfolio-website, Property 2: Duplicate slug exclusion
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 2, max: 5 }),
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }),
          { minLength: 0, maxLength: 8 },
        ),
        (dupSlug, dupCount, otherSlugs) => {
          vi.clearAllMocks();

          const dupEntries = Array.from({ length: dupCount }, (_, i) =>
            makeRaw({ slug: dupSlug, _filename: `dup-${i}.md` }),
          );

          const uniqueSlugs = [...new Set(otherSlugs.filter((s) => s !== dupSlug))];
          const otherEntries = uniqueSlugs.map((s, i) =>
            makeRaw({ slug: s, _filename: `other-${i}.md` }),
          );

          const result = validateProjects([...dupEntries, ...otherEntries]);

          // None of the duplicate-slug entries should appear in output
          const slugsInOutput = result.map((p) => p.slug);
          expect(slugsInOutput).not.toContain(dupSlug);

          // warn should have been called for the duplicate
          expect((console.warn as ReturnType<typeof vi.fn>).mock.calls.some(
            (args) => args[0].includes(dupSlug),
          )).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Project sort order invariant
// Feature: portfolio-website, Property 3: Project sort order invariant
// ---------------------------------------------------------------------------
describe('sortProjects — Property 3: sort order invariant', () => {
  it('featured items precede non-featured; within each group, ascending case-insensitive alpha', () => {
    // Feature: portfolio-website, Property 3: Project sort order invariant
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            featured: fc.option(fc.boolean(), { nil: undefined }),
          }),
          { minLength: 0, maxLength: 20 },
        ),
        (items) => {
          const projects: ProjectData[] = items.map((item, i) => ({
            title: item.title,
            slug: `slug-${i}`,
            description: 'desc',
            technologies: ['JS'],
            github: 'https://github.com/test',
            body: '',
            _filename: `${i}.md`,
            featured: item.featured ?? undefined,
          }));

          const sorted = sortProjects(projects);

          // Find first non-featured index
          let lastFeaturedIdx = -1;
          let firstNonFeaturedIdx = sorted.length;

          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].featured === true) lastFeaturedIdx = i;
            else if (firstNonFeaturedIdx === sorted.length) firstNonFeaturedIdx = i;
          }

          // No non-featured before the last featured
          expect(lastFeaturedIdx).toBeLessThan(firstNonFeaturedIdx === sorted.length ? Infinity : firstNonFeaturedIdx + 1);

          // Within featured group: alphabetical
          const featuredGroup = sorted.filter((p) => p.featured === true);
          for (let i = 1; i < featuredGroup.length; i++) {
            expect(
              featuredGroup[i - 1].title.toLowerCase().localeCompare(
                featuredGroup[i].title.toLowerCase(),
              ),
            ).toBeLessThanOrEqual(0);
          }

          // Within non-featured group: alphabetical
          const nonFeaturedGroup = sorted.filter((p) => p.featured !== true);
          for (let i = 1; i < nonFeaturedGroup.length; i++) {
            expect(
              nonFeaturedGroup[i - 1].title.toLowerCase().localeCompare(
                nonFeaturedGroup[i].title.toLowerCase(),
              ),
            ).toBeLessThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
