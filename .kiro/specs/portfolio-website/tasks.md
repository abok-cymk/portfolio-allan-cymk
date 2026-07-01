# Implementation Plan: Portfolio Website

## Overview

Implement a YouTube-channel-inspired developer portfolio SPA using React 18, Vite, Tailwind CSS v4 (CSS-only config via `index.css @theme {}`), Framer Motion, RxJS, and React Router v6 HashRouter. Content is data-driven via `src/content/projects/*.md` files parsed at build time. Deployed to GitHub Pages at `/portfolio-website/` base path.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialise Vite project with React + TypeScript template using PNPM, install all production and dev dependencies
    - Run `pnpm create vite . --template react-ts` in `d:\portfolio-allan-cymk\`
    - Install deps: `react-router-dom`, `framer-motion`, `rxjs`, `react-markdown`, `rehype-highlight`, `gray-matter`, `lucide-react`, `gh-pages`
    - Install dev deps: `@tailwindcss/vite`, `tailwindcss`, `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fast-check`, `vitest-axe`, `jsdom`
    - _Requirements: 14.2_

  - [x] 1.2 Configure `vite.config.ts` with base path, Tailwind v4 plugin, and path aliases
    - Set `base: '/portfolio-website/'`
    - Add `@tailwindcss/vite` to plugins array
    - Add `resolve.alias` for `@` → `src`
    - Configure `test` block: environment `jsdom`, globals `true`, setupFiles pointing to `src/test/setup.ts`
    - _Requirements: 14.2, 14.3_


  - [x] 1.3 Set up Tailwind CSS v4 in `src/index.css` with design tokens and dark-mode variant
    - Add `@import "tailwindcss"` at top of `index.css`
    - Define `@custom-variant dark ('[data-theme="dark"] &')` for data-attribute-driven dark mode
    - Define `@theme {}` block with CSS custom properties: colour palette, spacing scale, border-radius tokens
    - _Requirements: 9.1, 9.3_

  - [x] 1.4 Add FOUC-prevention inline script to `index.html` and wire up Suspense fallback
    - Insert `<script>` tag in `<head>` of `index.html` that reads `localStorage.getItem('theme')` and sets `document.documentElement.dataset.theme` before body renders, defaulting to `'dark'`
    - Add `<Suspense fallback={<div>Loading…</div>}>` wrapper in `main.tsx` around the app router
    - _Requirements: 9.3, 11.3_

  - [x] 1.5 Create `src/test/setup.ts` test bootstrap and `package.json` scripts
    - Import `@testing-library/jest-dom` and `vitest-axe/extend-expect` in `setup.ts`
    - Add scripts to `package.json`: `"dev"`, `"build"`, `"preview"`, `"test"`, `"test:ui"`, `"deploy"` (using `gh-pages -d dist`)
    - _Requirements: 14.2_


- [x] 2. Core services
  - [x] 2.1 Implement `Storage_Service` (`src/services/storage.service.ts`)
    - Export a singleton `StorageService` with `isAvailable()`, `get<T>()`, and `set<T>()` methods
    - On instantiation, perform a test write (`__storage_test__`) and read; if it throws, set internal `_available = false`
    - When unavailable, redirect all reads/writes to a `Map<string, unknown>` in-memory store
    - `set()` returns `false` on any `localStorage` error without propagating; `get()` returns `null` on miss
    - _Requirements: 15.1, 15.3_

  - [x]* 2.2 Write property test for Storage_Service write-failure safety (Property 9)
    - **Property 9: Storage_Service write-failure safety**
    - **Validates: Requirements 9.7, 15.1, 15.3**
    - Mock `localStorage.setItem` to always throw; generate random key/value pairs via `fc.string()`
    - Assert `set()` returns `false`, no exception escapes, and `get()` returns in-memory value

  - [x] 2.3 Implement `Theme_Service` (`src/services/theme.service.ts`)
    - Export `getTheme()`: reads `localStorage` key `theme`; returns stored value if `'dark'`|`'light'`, else `'dark'`
    - Export `setTheme(theme)`: calls `StorageService.set('theme', theme)` and `applyTheme(theme)`
    - Export `applyTheme(theme)`: sets `document.documentElement.dataset.theme = theme`
    - _Requirements: 9.2, 9.3, 9.4, 9.6, 9.7_

  - [x]* 2.4 Write property test for Theme_Service round-trip (Property 5)
    - **Property 5: Theme round-trip**
    - **Validates: Requirements 9.2, 9.6**
    - For each value in `["dark", "light"]`, call `setTheme(value)`, assert `getTheme()` returns `value` and `document.documentElement.dataset.theme === value`


  - [x] 2.5 Implement `RSS_Service` (`src/services/rss.service.ts`)
    - Export `fetchArticles(username: string): Observable<ArticleData[]>`
    - Construct URL: `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@{username}`
    - Use `from(fetch(url))` piped through `switchMap(r => from(r.json()))`, `timeout(10000)`, `map(parseRssJson)`, `catchError(err => throwError(() => err))`
    - `parseRssJson` maps `response.items` to `ArticleData[]`, extracting `title`, `pubDate`, `link` (as `url`), `thumbnail` (as `coverImageUrl`), and reading time from description HTML
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ]* 2.6 Write property test for RSS_Service timeout error emission (Property 6)
    - **Property 6: RSS_Service timeout error emission**
    - **Validates: Requirements 5.5, 5.6**
    - Use fake timers; generate delay values > 10 000 ms via `fc.integer({ min: 10001, max: 60000 })`
    - Assert observable emits error, never emits next, and ArticlesSection renders error message

  - [ ]* 2.7 Write property test for RSS parse output validity and display cap (Property 12)
    - **Property 12: RSS parse output validity and display cap**
    - **Validates: Requirements 5.2, 5.3**
    - Generate random rss2json JSON responses with 0–20 items via `fc.array(fc.record({...}), { maxLength: 20 })`
    - Assert every output item has non-empty `title`, non-empty `url`, parseable `pubDate`
    - Assert `ArticlesSection` renders exactly `Math.min(N, 10)` ArticleCard components

  - [x] 2.8 Implement `GitHub_Service` (`src/services/github.service.ts`)
    - Export `fetchGitHubData(username: string): Promise<GitHubData>`
    - `GET https://api.github.com/users/:username/repos?sort=pushed&per_page=100`
    - Map response to `RepoData[]`; filter `featuredRepos` by `topics.includes('featured')`, slice to 6; slice `recentRepos` to 6 most recent by `pushed_at`
    - Set `contributionGraphUrl = 'https://ghchart.rshah.org/' + username`
    - On any fetch/parse error, throw so callers can handle via try/catch
    - _Requirements: 7.1, 7.2, 7.3_


- [x] 3. Data layer — static content and project pipeline
  - [x] 3.1 Create static data files `src/data/profile.ts` and `src/data/skills.ts`
    - `profile.ts`: export `ProfileData` constant with placeholder name, title, intro, githubUsername, mediumUsername, socialLinks array, optional resumeUrl
    - `skills.ts`: export `SkillCategory[]` with four categories (`Frontend`, `Backend`, `Languages`, `Tools`), max 12 skills each
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 1.3, 1.4_

  - [x] 3.2 Implement `validateProjects` and `sortProjects` pure functions (`src/lib/projects.ts`)
    - `validateProjects(raw)`: checks each entry for required fields (`title`, `slug`, `description`, `technologies`, `github`); emits `console.warn('[portfolio] Missing fields in {filename}: {fields}')` for invalid; detects duplicate slugs and emits `console.warn('[portfolio] Duplicate slug "{slug}" in {files}')`, excluding all affected
    - `sortProjects(projects)`: places `featured === true` items first, then remaining sorted by `title` ascending case-insensitively
    - _Requirements: 13.2, 13.4, 13.5, 13.6_

  - [x]* 3.3 Write property test for project validation excludes invalid files (Property 1)
    - **Property 1: Project validation excludes invalid files**
    - **Validates: Requirements 13.2, 13.4**
    - Generate random arrays of project-shaped objects where a random subset omits required fields via `fc.array(fc.record({...}))` with optional field omission
    - Assert output contains only fully-valid objects; assert `console.warn` called for each excluded file

  - [x]* 3.4 Write property test for duplicate slug exclusion (Property 2)
    - **Property 2: Duplicate slug exclusion**
    - **Validates: Requirements 13.5**
    - Generate project arrays where a random subset shares a duplicated `slug` via `fc.array()` with injected duplicates
    - Assert all objects sharing a duplicated slug are absent from output; assert `console.warn` called per conflict

  - [x]* 3.5 Write property test for project sort order invariant (Property 3)
    - **Property 3: Project sort order invariant**
    - **Validates: Requirements 13.6, 3.6**
    - Generate random valid project arrays with random `featured` booleans and `title` strings via `fc.array(fc.record({featured: fc.boolean(), title: fc.string()}))`
    - Assert all `featured === true` items precede all others; assert within-group case-insensitive alphabetical order

  - [x] 3.6 Implement `useProjects` and `useProject` hooks (`src/hooks/useProjects.ts`)
    - `useProjects()`: calls `import.meta.glob('../content/projects/*.md', { as: 'raw' })`, iterates each raw string through `gray-matter`, builds raw project objects, passes through `validateProjects` + `sortProjects`, returns `ProjectData[]`
    - `useProject(slug)`: calls `useProjects()` and returns the single entry whose `slug` matches, or `undefined`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 13.1_


- [x] 4. Routing setup
  - [x] 4.1 Set up React Router v6 `HashRouter` with lazy `ProjectPage`, `NotFoundPage`, and `ErrorBoundary` (`src/main.tsx`, `src/router.tsx`)
    - Use `<HashRouter>` wrapping `<Routes>`
    - Define routes: `path="/"` → `<HomePage />`, `path="/projects/:slug"` → lazy-loaded `<ProjectPage />` wrapped in `<ErrorBoundary>` + `<Suspense>`, `path="*"` → `<NotFoundPage />`
    - `ErrorBoundary` catches runtime render errors and shows inline error without redirecting
    - _Requirements: 4.1, 4.2, 11.3, 14.1_

  - [x] 4.2 Implement `NotFoundPage` (`src/pages/NotFoundPage.tsx`)
    - Render a styled 404 message with a `<Link to="/">` back to homepage
    - _Requirements: 4.2_

- [x] 5. Checkpoint — ensure core services, data layer, and router compile with no TypeScript errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Layout and navigation components
  - [x] 6.1 Implement `SkipNavLink` and `Banner` components (`src/components/SkipNavLink.tsx`, `src/components/Banner.tsx`)
    - `SkipNavLink`: `<a href="#main-content">` as first focusable element; `sr-only` with `focus:not-sr-only` Tailwind classes
    - `Banner`: renders `<img>` when `src` provided; `onError` and no-src case both render a CSS-gradient `<div>` placeholder of the same dimensions
    - _Requirements: 1.2, 12.6_

  - [x] 6.2 Implement `ChannelHeader` component (`src/components/ChannelHeader.tsx`)
    - Display name, title, intro (≤ 300 chars), circular 200×200 px profile photo when `photoSrc` present
    - Social links with Lucide React icons; each link `target="_blank" rel="noopener noreferrer"` with `aria-label`
    - Resume button: enabled (opens `resumeUrl` in new tab) when `resumeUrl` is non-empty string; disabled with `aria-disabled="true"` when absent or empty string
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 6.3 Write property test for Resume button state matches data (Property 10)
    - **Property 10: Resume button state matches data**
    - **Validates: Requirements 1.5, 1.6**
    - Generate random `resumeUrl` values: `undefined`, `""`, and `fc.webUrl()` non-empty strings
    - Assert `aria-disabled="true"` iff `resumeUrl` is empty or absent; assert enabled state for valid URLs


  - [x] 6.4 Implement `NavTabs` component (`src/components/NavTabs.tsx`)
    - Container `role="tablist"`; each button `role="tab"`, `aria-selected`, `aria-controls` pointing to matching panel id
    - Active tab: visual indicator (underline/highlight); inactive panels receive `hidden` attribute
    - Keyboard: `ArrowRight`/`ArrowLeft` wraps focus, `Enter`/`Space` activates focused tab
    - Default active tab is `"projects"` on page load
    - Framer Motion `AnimatePresence` wraps panel content with ≤ 300ms transition
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 6.5 Write property test for Tab ARIA state consistency (Property 8)
    - **Property 8: Tab ARIA state consistency**
    - **Validates: Requirements 2.2, 2.6**
    - Generate random tab lists (2–8 tabs) and random active indices via `fc.integer()`
    - Assert exactly one tab has `aria-selected="true"`, all others `"false"`, matching panel visible, others `hidden`

  - [ ]* 6.6 Write property test for Tab keyboard navigation correctness (Property 11)
    - **Property 11: Tab keyboard navigation correctness**
    - **Validates: Requirements 2.7, 2.8**
    - Generate tab lists of length 2–10 and random initial focus positions
    - Simulate `ArrowRight`/`ArrowLeft`; assert new focus = `(old ± 1) mod N`
    - Simulate `Enter`/`Space`; assert focused tab becomes active selection

  - [x] 6.7 Implement `ThemeToggle` component (`src/components/ThemeToggle.tsx`)
    - `useTheme()` hook: reads `Theme_Service.getTheme()` on init; `toggleTheme` calls `Theme_Service.setTheme()`
    - Button with `aria-label` stating current theme and action (e.g., "Switch to light theme")
    - Lucide `Sun`/`Moon` icon swaps on toggle
    - _Requirements: 9.5, 9.6_


- [x] 7. Section components
  - [x] 7.1 Implement `ProjectCard` and `ProjectsSection` components (`src/components/ProjectCard.tsx`, `src/components/ProjectsSection.tsx`)
    - `ProjectCard`: thumbnail `<img>` with `loading="lazy"`; `onError` swaps to `<div>` placeholder showing project title; tech stack tags; repo link; optional demo link; Framer Motion hover `scale ≤ 1.03` + shadow; click/Enter navigates to `#/projects/:slug`
    - `ProjectsSection`: responsive CSS grid (1 col / 2 col / 3 col at `sm`/`lg` breakpoints); empty-state message when `projects` array is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_

  - [x] 7.2 Implement `ArticleCard`, `SkeletonCard`, and `ArticlesSection` (`src/components/ArticleCard.tsx`, `src/components/SkeletonCard.tsx`, `src/components/ArticlesSection.tsx`)
    - `ArticleCard`: cover image with `onError` placeholder; date formatted `"Month DD, YYYY"` using `Intl.DateTimeFormat`; reading time when present
    - `SkeletonCard`: animated pulse placeholder for `variant` `'article'` | `'repo'` | `'graph'`
    - `ArticlesSection`: shows 3 `SkeletonCard` while `loading`; error message string when `error` non-null; up to 10 `ArticleCard` on success
    - _Requirements: 5.3, 5.4, 5.5, 5.7_

  - [ ]* 7.3 Write property test for Article date formatting invariant (Property 13)
    - **Property 13: Article date formatting invariant**
    - **Validates: Requirements 5.4**
    - Generate random valid ISO 8601 date strings via `fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })`
    - Assert rendered date matches `/^[A-Z][a-z]+ \d{2}, \d{4}$/`

  - [x] 7.4 Implement `SkillsSection` component (`src/components/SkillsSection.tsx`)
    - Accept `categories: SkillCategory[]`; render each category name as a heading and each skill as a compact tag/badge
    - _Requirements: 6.1, 6.2_

  - [x] 7.5 Implement `AboutSection` component (`src/components/AboutSection.tsx`)
    - Render extended bio/about text sourced from `profile.ts`
    - Use semantic `<section>` with appropriate heading
    - _Requirements: 12.4_


  - [x] 7.6 Implement `GitHubSection` component and `useGitHub` hook (`src/components/GitHubSection.tsx`, `src/hooks/useGitHub.ts`)
    - `useGitHub(username)`: calls `GitHub_Service.fetchGitHubData(username)` in `useEffect`; returns `{ data, loading, error }`
    - `GitHubSection`: `<img src={contributionGraphUrl} alt="GitHub contribution graph" loading="lazy">` for graph; up to 6 featured repos; up to 6 recent repos with `pushed_at` date formatted `"Month DD, YYYY"`; skeleton state during load; inline error + profile link on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 7.7 Write property test for GitHub repository display invariant (Property 14)
    - **Property 14: GitHub repository display invariant**
    - **Validates: Requirements 7.2, 7.3**
    - Generate random `RepoData[]` of length 0–50 with random `topics` and `pushed_at` dates via `fc.array(fc.record({...}))`
    - Assert `GitHubSection` renders ≤ 6 featured repos and ≤ 6 recent repos, recent sorted by `pushed_at` desc

  - [x] 7.8 Implement `ContactSection` component (`src/components/ContactSection.tsx`)
    - Render icon-based links for email, LinkedIn, Medium, X/Twitter, GitHub using Lucide React icons
    - Each `<a>`: `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` in format `"[Platform] profile"` or `"Email [address]"`
    - Min touch target 44×44 px via Tailwind utility classes (`min-w-[44px] min-h-[44px]` or `p-` padding)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 7.9 Write property test for Contact link accessibility invariant (Property 7)
    - **Property 7: Contact link accessibility invariant**
    - **Validates: Requirements 8.3, 8.4, 8.6**
    - Generate random arrays of `ContactLink` objects with arbitrary platforms/URLs
    - Assert every rendered `<a>` has `target="_blank"`, `rel="noopener noreferrer"`, non-empty `aria-label`, and touch-target classes present


- [ ] 8. Page composition — HomePage
  - [ ] 8.1 Compose `HomePage` wiring all sections together (`src/pages/HomePage.tsx`)
    - Render in order: `<SkipNavLink />`, `<ChannelHeader />`, `<NavTabs />` (panels: Projects, Articles, Skills, About), `<GitHubSection />`, `<ContactSection />`, `<ThemeToggle />`
    - Add `id="main-content"` to the `<main>` element for skip-nav target
    - Wire `useProjects()`, `useArticles(profile.mediumUsername)`, `skills`, and `profile` data into the appropriate section components
    - _Requirements: 1.1, 2.1, 2.5, 12.6_

- [ ] 9. ProjectPage — markdown rendering and recently viewed
  - [ ] 9.1 Implement `useRecentlyViewed` hook (`src/hooks/useRecentlyViewed.ts`)
    - `addRecentlyViewed(slug)`: reads current array from `Storage_Service.get('recentlyViewed')`; removes existing occurrence of slug if present; prepends slug; slices to max 5; writes back via `Storage_Service.set('recentlyViewed', updated)`
    - Returns current `recentlyViewed` array
    - _Requirements: 4.6, 15.2, 15.3_

  - [ ]* 9.2 Write property test for recentlyViewed deduplication and cap (Property 4)
    - **Property 4: recentlyViewed deduplication and cap**
    - **Validates: Requirements 4.6, 15.2**
    - Generate random sequences of slug strings (length 1–20, with intentional repeats) via `fc.array(fc.string(), { maxLength: 20 })`
    - Apply each sequentially to `addRecentlyViewed`; assert: no duplicates, length ≤ 5, last slug at index 0

  - [ ] 9.3 Implement `ProjectPage` with Markdown rendering (`src/pages/ProjectPage.tsx`)
    - Use `useParams()` to get `slug`; call `useProject(slug)` — return `<NotFoundPage />` if `undefined`
    - Call `useRecentlyViewed().addRecentlyViewed(slug)` on mount via `useEffect`
    - Render `title`, `description`, `technologies`, `github` link, optional `demo` link from frontmatter
    - Render Markdown `body` via `<ReactMarkdown rehypePlugins={[rehypeHighlight]}>` for heading hierarchy, lists, code blocks with syntax highlighting
    - Show `ArticleCard` entries for any `mediumPosts` slugs that match loaded articles (silently omit unmatched)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_


- [ ] 10. Checkpoint — ensure routing, all pages, and sections render without errors
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Animations and motion
  - [ ] 11.1 Add Framer Motion viewport-enter animations to section and card components
    - Wrap each major section (`ProjectsSection`, `ArticlesSection`, `SkillsSection`, `AboutSection`, `GitHubSection`, `ContactSection`) and each `ProjectCard`/`ArticleCard` with a `motion.div` using `initial={{ opacity: 0, y: 24 }}` → `animate={{ opacity: 1, y: 0 }}`
    - Duration ≤ 400ms; use `whileInView` + `viewport={{ once: true }}`
    - _Requirements: 10.1, 10.2_

  - [ ] 11.2 Apply Framer Motion hover transitions to `ProjectCard` and `ArticleCard`
    - Add `whileHover={{ scale: 1.03 }}` and a box-shadow change (via CSS variable or `style` prop) to each card
    - Duration ≤ 400ms
    - _Requirements: 10.3_

  - [ ] 11.3 Implement `prefers-reduced-motion` compliance across all animated components
    - Import `useReducedMotion()` from `framer-motion` in each animated component
    - When `useReducedMotion()` returns `true`: use `initial={{ opacity: 0 }}` (no `y`/`scale`/`rotate`), transition duration ≤ 0.15s
    - Apply to: all section wrappers, `ProjectCard`, `ArticleCard`, `NavTabs` panel transitions
    - _Requirements: 10.6_

  - [ ]* 11.4 Write property test for reduced-motion animation variant compliance (Property 16)
    - **Property 16: Reduced-motion animation variant compliance**
    - **Validates: Requirements 10.6**
    - Mock `useReducedMotion()` to return `true` for each animated component (`ProjectCard`, `ArticleCard`, section wrappers)
    - Assert applied Framer Motion variant has no `y`, `x`, `scale`, or `rotate` properties; assert `transition.duration ≤ 0.15`


- [ ] 12. Accessibility audit and tests
  - [ ] 12.1 Write axe-core accessibility tests for all major section components (`src/test/accessibility.test.tsx`)
    - Run `axe()` from `vitest-axe` on rendered `ChannelHeader`, `NavTabs`, `ProjectsSection`, `ArticlesSection`, `SkillsSection`, `GitHubSection`, `ContactSection`, `ProjectPage`, `HomePage`
    - Assert zero violations for `color-contrast`, `aria-required-attr`, `label`, `focus-visible`
    - Test both `data-theme="dark"` and `data-theme="light"` variants by setting `document.documentElement.dataset.theme`
    - _Requirements: 12.1, 12.7_

  - [ ] 12.2 Add skip-nav and semantic HTML structure verification tests
    - Assert `SkipNavLink` is the first focusable element in the DOM when `HomePage` renders
    - Assert presence of semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
    - _Requirements: 12.4, 12.6_

  - [ ]* 12.3 Write property test for image alt attribute presence (Property 15)
    - **Property 15: Image alt attribute presence**
    - **Validates: Requirements 12.3, 11.2**
    - Generate random `ProjectData`, `ArticleData`, and `ProfileData` values with arbitrary image paths via `fc.record({...})`
    - Render corresponding components; assert every `<img>` has `alt` attribute present; for informational images assert `alt.length ≤ 150`

- [ ] 13. Sample content files
  - [ ] 13.1 Create at least two project Markdown files in `src/content/projects/`
    - `src/content/projects/portfolio-website.md`: frontmatter with `title`, `slug: "portfolio-website"`, `description`, `technologies`, `github`, `featured: true`, optional `demo`; Markdown body with overview, features, technical decisions, and challenges sections
    - `src/content/projects/sample-project.md`: second project with different stack tags demonstrating all optional fields (`thumbnail`, `demo`, `mediumPosts`)
    - _Requirements: 3.4, 3.5, 13.1, 13.2, 13.3_


- [ ] 14. Performance and deployment configuration
  - [ ] 14.1 Verify code splitting, lazy loading, and image attributes
    - Confirm `ProjectPage` is imported via `React.lazy(() => import('./pages/ProjectPage'))` and wrapped in `<Suspense>`
    - Add `loading="lazy"` attribute to all below-the-fold `<img>` elements (project thumbnails, article covers, GitHub graph)
    - _Requirements: 11.2, 11.3_

  - [ ] 14.2 Finalise `vite.config.ts` base path and `package.json` deploy script
    - Confirm `base: '/portfolio-website/'` in `vite.config.ts`
    - Confirm `"deploy": "pnpm build && gh-pages -d dist"` in `package.json` scripts
    - _Requirements: 14.2, 14.3_

- [ ] 15. Final checkpoint — ensure all tests pass and the build succeeds
  - Run `pnpm build` to confirm zero TypeScript/Vite errors and correct asset base paths
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at meaningful milestones
- All 16 design correctness properties are covered by property-based test sub-tasks
- Tailwind CSS v4 requires no `tailwind.config.js` — all tokens live in `index.css @theme {}`
- Dark mode is driven by `[data-theme="dark"]` on `<html>`, not the `dark:` class variant
- `import.meta.glob('...', { as: 'raw' })` returns raw file strings at build time; `gray-matter` parses frontmatter at runtime
- `RSS_Service` uses rss2json.com as a CORS proxy for the Medium RSS feed
- `GitHub_Service` uses the unauthenticated GitHub REST API v3 (60 req/hour) and ghchart.rshah.org for the contribution graph


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.3", "3.2", "4.2"] },
    { "id": 4, "tasks": ["2.2", "2.4", "2.5", "3.3", "3.4", "3.5", "3.6", "4.1"] },
    { "id": 5, "tasks": ["2.6", "2.7", "2.8", "6.1", "6.2", "9.1", "13.1"] },
    { "id": 6, "tasks": ["6.3", "6.4", "6.7", "9.2"] },
    { "id": 7, "tasks": ["6.5", "6.6", "7.1", "7.2", "7.4", "7.5", "7.6", "7.8", "9.3"] },
    { "id": 8, "tasks": ["7.3", "7.7", "7.9", "8.1"] },
    { "id": 9, "tasks": ["11.1", "11.2", "12.2", "14.1", "14.2"] },
    { "id": 10, "tasks": ["11.3", "12.1"] },
    { "id": 11, "tasks": ["11.4", "12.3"] }
  ]
}
```
