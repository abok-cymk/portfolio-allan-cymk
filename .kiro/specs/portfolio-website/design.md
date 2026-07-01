# Design Document: Portfolio Website

## Overview

A single-page application (SPA) developer portfolio inspired by the YouTube channel page layout. Built with React 18 + Vite + Tailwind CSS v4 + Framer Motion, deployed to GitHub Pages via hash-based routing. Content is fully data-driven: projects come from Markdown files in `src/content/projects/` parsed at build time with `import.meta.glob`, and articles stream from the Medium RSS feed via an RxJS-managed observable.

### Research Findings

**Tailwind CSS v4**: Zero-configuration setup — no `tailwind.config.js`. The `@tailwindcss/vite` plugin is added to `vite.config.ts`, and `@import "tailwindcss"` in `index.css` activates the framework. All design tokens (colors, spacing, radius) go inside `@theme {}` blocks in `index.css` as CSS custom properties. `data-theme` on `<html>` drives dark/light switching via CSS variable overrides.

**Hash Router**: React Router v6 `<HashRouter>` encodes all paths in the URL fragment (e.g., `#/projects/my-slug`). GitHub Pages serves the root `index.html` for every request, so fragment-only navigation requires no server-side configuration. `createHashRouter` / `<HashRouter>` is the correct v6 API.

**Medium RSS + CORS**: Fetching `https://medium.com/feed/@username` directly from a browser triggers CORS errors. The recommended approach for a fully static site is to proxy through [rss2json.com](https://api.rss2json.com/v1/api.json?rss_url=…), which converts the XML feed to JSON and adds CORS headers. The free tier supports ≈500 req/day and is sufficient for a portfolio. The `RSS_Service` wraps this in an RxJS `from(fetch(...))` observable with a `timeout(10000)` operator.

**GitHub Data**: The GitHub REST API v3 (`https://api.github.com/users/:username/repos`) is available without authentication at 60 requests/hour. It exposes `name`, `description`, `language`, `stargazers_count`, `pushed_at`, and `topics`. For the contribution graph, the simplest reliable approach is embedding the SVG image `https://ghchart.rshah.org/:username` as an `<img>` element — no API calls, no authentication, CORS-free.

**Markdown Rendering**: `react-markdown` (remark-based) with `rehype-highlight` (hljs-backed) provides syntax-highlighted code blocks. `gray-matter` parses YAML frontmatter from raw `.md` file strings imported via `import.meta.glob('...', { as: 'raw' })`.

**Framer Motion `prefers-reduced-motion`**: The `useReducedMotion()` hook from Framer Motion returns `true` when the OS preference is set. Components use this to swap `{ opacity: 0, y: 24 }` enter variants for `{ opacity: 0, y: 0 }` variants, keeping duration ≤ 150ms.

---

## Architecture

The application follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                      │
│                                                         │
│  ┌──────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  Router  │  │  Page Views   │  │    Services    │   │
│  │ (Hash)   │  │               │  │                │   │
│  │          │  │ HomePage      │  │ RSS_Service    │   │
│  │ /        │  │ ProjectPage   │  │ Theme_Service  │   │
│  │ /projects│  │ NotFoundPage  │  │ GitHub_Service │   │
│  │ /:slug   │  │               │  │ Storage_Service│   │
│  └──────────┘  └───────────────┘  └────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               UI Components                      │   │
│  │  ChannelHeader  │  NavTabs  │  ProjectCard       │   │
│  │  ArticleCard    │  Skills   │  GitHubSection     │   │
│  │  Banner         │  Contact  │  SkeletonCard      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Static Content (Build Time)            │   │
│  │  src/content/projects/*.md  (import.meta.glob)   │   │
│  │  src/data/skills.ts         (static data)        │   │
│  │  src/data/profile.ts        (static data)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Decision: `import.meta.glob` with `{ as: 'raw' }` + `gray-matter` at runtime**
Rationale: Vite's glob import with `as: 'raw'` returns raw file strings at build time. Parsing them with `gray-matter` in a single `useProjects()` hook keeps the data pipeline simple and co-located. The alternative (a custom Vite plugin) adds complexity with no meaningful gain for a portfolio scale.

**Decision: rss2json.com as CORS proxy for Medium RSS**
Rationale: Direct Medium RSS fetch fails with CORS from a static SPA. rss2json is the lightest-weight solution — no backend, no Cloudflare Worker, no added infrastructure. Rate limits (500 req/day free) are well within portfolio traffic.

**Decision: ghchart.rshah.org for GitHub contribution graph**
Rationale: The GitHub GraphQL API requires a personal access token, which cannot be embedded securely in a public SPA. The `ghchart.rshah.org/:username` service returns a contribution SVG image that is CORS-free and publicly accessible, matching the visual requirement with zero credential exposure.

**Decision: RxJS only for `RSS_Service`**
Rationale: The requirements mandate RxJS for the RSS fetch lifecycle. Other data flows (GitHub API, localStorage) use plain `async/await` or React hooks to avoid unnecessary complexity.

**Decision: `HashRouter` from `react-router-dom`**
Rationale: GitHub Pages cannot rewrite paths to `index.html`. Hash routing (fragment-based navigation) is the standard, zero-server-config solution. All links use `#/` prefixes.

**Decision: Tailwind v4 CSS-only configuration**
Rationale: Per requirements constraint, no `tailwind.config.js`. Dark/light theming uses `[data-theme="dark"]` CSS selector overrides on CSS custom properties defined in `@theme {}`. Tailwind v4's `@variant dark` maps to `[data-theme="dark"]` via `@custom-variant dark ('[data-theme="dark"] &')`.

---

## Components and Interfaces

### Page Components

#### `HomePage`
The root page rendered at `#/`. Composes all homepage sections.

```tsx
interface HomePageProps {} // no props — all data from hooks/context

// Renders:
// <SkipNavLink />
// <ChannelHeader />
// <NavTabs />
//   <ProjectsSection />
//   <ArticlesSection />
//   <SkillsSection />
//   <AboutSection />
// <GitHubSection />
// <ContactSection />
// <ThemeToggle />
```

#### `ProjectPage`
Lazy-loaded via `React.lazy`. Rendered at `#/projects/:slug`.

```tsx
interface ProjectPageProps {} // slug from useParams()
// Renders full project detail from matched Markdown file
// Records slug in recentlyViewed via Storage_Service on mount
```

#### `NotFoundPage`
Rendered for unmatched routes.

```tsx
// Renders 404 message + link back to #/
```

---

### Layout / Structural Components

#### `ChannelHeader`
```tsx
interface ChannelHeaderProps {
  name: string;
  title: string;
  intro: string;            // max 300 chars
  photoSrc?: string;        // circular 200×200px if provided
  resumeUrl?: string;       // enables/disables Resume button
  socialLinks: SocialLink[];
}

interface SocialLink {
  platform: 'email' | 'linkedin' | 'medium' | 'twitter' | 'github';
  url: string;
  label: string;            // aria-label
}
```

#### `Banner`
```tsx
interface BannerProps {
  src?: string;             // optional image URL
  alt?: string;             // defaults to ""
}
// Shows placeholder gradient when src is absent or fails to load
```

#### `NavTabs`
```tsx
interface NavTabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface TabDefinition {
  id: string;
  label: string;
  panel: React.ReactNode;
}
// role="tablist", role="tab", aria-selected, keyboard nav (ArrowLeft/Right, Enter/Space)
```

#### `ThemeToggle`
```tsx
interface ThemeToggleProps {} // reads/writes via ThemeService
// Accessible button with aria-label indicating current theme + action
```

---

### Section Components

#### `ProjectsSection`
```tsx
interface ProjectsSectionProps {
  projects: ProjectData[];
}
// Responsive grid: 1 col mobile / 2 col tablet / 3 col desktop
// Shows empty-state message when projects array is empty
```

#### `ProjectCard`
```tsx
interface ProjectCardProps {
  project: ProjectData;
  onClick: () => void;
}
// YouTube-style video card
// Fallback placeholder when thumbnail fails to load
// Framer Motion hover: scale ≤ 1.03×, shadow change
```

#### `ArticlesSection`
```tsx
interface ArticlesSectionProps {
  articles: ArticleData[];
  loading: boolean;
  error: string | null;
}
// Shows 3 skeleton cards while loading
// Shows error message on failure
// Shows up to 10 ArticleCards
```

#### `ArticleCard`
```tsx
interface ArticleCardProps {
  article: ArticleData;
}
// Shows cover image or placeholder
// Date formatted "Month DD, YYYY"
// Reading time when present
```

#### `SkillsSection`
```tsx
interface SkillsSectionProps {
  categories: SkillCategory[];
}
```

#### `GitHubSection`
```tsx
interface GitHubSectionProps {
  username: string;
}
// Fetches data internally via useGitHub() hook
// Skeleton loading state, error fallback with profile link
```

#### `ContactSection`
```tsx
interface ContactSectionProps {
  links: ContactLink[];
}

interface ContactLink {
  platform: string;
  url: string;
  ariaLabel: string;   // "[Platform] profile" or "Email [address]"
  icon: LucideIcon;
}
// All links: target="_blank" rel="noopener noreferrer"
// Min touch target: 44×44px
```

---

### Shared / Utility Components

#### `SkeletonCard`
```tsx
interface SkeletonCardProps {
  variant: 'article' | 'repo' | 'graph';
}
```

#### `SkipNavLink`
```tsx
// <a href="#main-content" className="sr-only focus:not-sr-only ...">
// First focusable element in DOM
```

#### `ErrorBoundary`
Wraps `ProjectPage` to catch runtime errors and display inline error message instead of redirecting.

```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}
```

---

### Services

#### `RSS_Service`

```ts
interface ArticleData {
  title: string;
  pubDate: string;          // ISO string
  readingTime?: string;     // e.g. "5 min read"
  coverImageUrl?: string;
  url: string;
}

// Returns Observable<ArticleData[]>
function fetchArticles(username: string): Observable<ArticleData[]>
// Uses fromFetch or from(fetch(...))
// pipe(timeout(10000), map(parseRssJson), catchError(...))
// Proxied through rss2json.com to avoid CORS
```

#### `Theme_Service`

```ts
type Theme = 'dark' | 'light';

interface ThemeService {
  getTheme(): Theme;              // reads localStorage, falls back to 'dark'
  setTheme(theme: Theme): void;  // writes localStorage + updates data-theme attr
  applyTheme(theme: Theme): void; // sets document.documentElement.dataset.theme
}
// localStorage key: "theme"
// Applied before body render via <script> in index.html to prevent FOUC
```

#### `Storage_Service`

```ts
interface StorageService {
  isAvailable(): boolean;
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): boolean; // returns false on failure, no throw
}
// Test write/read on startup to detect availability
// Falls back to in-memory Map<string, unknown> when unavailable
```

#### `GitHub_Service`

```ts
interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  updatedAt: string;   // ISO string
  topics: string[];
}

interface GitHubData {
  featuredRepos: RepoData[];   // up to 6 — those with topics including "featured"
  recentRepos: RepoData[];     // up to 6 most recently pushed
  contributionGraphUrl: string; // https://ghchart.rshah.org/:username
}

async function fetchGitHubData(username: string): Promise<GitHubData>
// GET https://api.github.com/users/:username/repos?sort=pushed&per_page=100
// Filters featured by topics.includes('featured')
```

---

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useProjects()` | Parses all `.md` files via `import.meta.glob`, returns validated `ProjectData[]` |
| `useProject(slug)` | Finds a single project by slug from the glob result |
| `useArticles(username)` | Subscribes to `RSS_Service` observable, returns `{ articles, loading, error }` |
| `useGitHub(username)` | Calls `GitHub_Service`, returns `{ data, loading, error }` |
| `useTheme()` | Returns `[theme, toggleTheme]`, integrates `Theme_Service` |
| `useRecentlyViewed()` | Reads/writes `recentlyViewed` array via `Storage_Service` |
| `useReducedMotion()` | Re-exports Framer Motion's `useReducedMotion` — used in animation variants |

---

## Data Models

### `ProjectData` (parsed from Markdown frontmatter + body)

```ts
interface ProjectData {
  // Required frontmatter
  title: string;
  slug: string;
  description: string;       // 1–300 chars
  technologies: string[];    // 1–20 items
  github: string;            // valid URL

  // Optional frontmatter
  featured?: boolean;
  demo?: string;             // valid URL
  thumbnail?: string;        // image file path
  mediumPosts?: string[];    // 0–10 article slugs

  // Derived at parse time
  body: string;              // raw Markdown body (post-frontmatter)
  _filename: string;         // source file name for warnings
}
```

**Validation Rules (applied in `useProjects`):**
- Missing any required field → exclude + `console.warn('[portfolio] Missing fields in {filename}: {fields}')`
- Duplicate slug → exclude all affected + `console.warn('[portfolio] Duplicate slug "{slug}" in {files}')`
- Sort order: `featured === true` first, then alphabetical by `title`

### `SkillCategory` (from `src/data/skills.ts`)

```ts
interface SkillCategory {
  name: 'Frontend' | 'Backend' | 'Languages' | 'Tools';
  skills: string[];   // max 12 items
}
```

### `ProfileData` (from `src/data/profile.ts`)

```ts
interface ProfileData {
  name: string;
  title: string;
  intro: string;       // ≤ 300 chars
  photoSrc?: string;
  resumeUrl?: string;
  socialLinks: SocialLink[];
  githubUsername: string;
  mediumUsername: string;
}
```

### `ArticleData` (from RSS_Service)

```ts
interface ArticleData {
  title: string;
  pubDate: string;          // ISO date string
  readingTime?: string;
  coverImageUrl?: string;
  url: string;
}
```

### `RecentlyViewedState` (localStorage key: `recentlyViewed`)

```ts
type RecentlyViewedState = string[];  // array of project slugs, max 5
// Stored as JSON string
// New slug pushed to front; duplicates moved to front; oldest dropped when cap hit
```

### localStorage Schema

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `theme` | `"dark" \| "light"` | `"dark"` | Set before body render |
| `recentlyViewed` | `string[]` (JSON) | `[]` | Max 5 slugs |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project validation excludes invalid files

*For any* set of Markdown file objects where one or more are missing required frontmatter fields (`title`, `slug`, `description`, `technologies`, `github`), the output of `validateProjects()` SHALL contain only objects where all five required fields are present, and the function SHALL emit a `console.warn` identifying every excluded filename and each missing field name.

**Validates: Requirements 13.2, 13.4**

---

### Property 2: Duplicate slug exclusion

*For any* set of project objects where two or more share the same `slug` value, `validateProjects()` SHALL exclude every project from any group of conflicting slugs; the output SHALL contain zero projects whose slug appears more than once in the input, and a `console.warn` SHALL be emitted for each conflict identifying the duplicated slug and the filenames involved.

**Validates: Requirements 13.5**

---

### Property 3: Project sort order invariant

*For any* array of valid `ProjectData` objects with arbitrary `featured` flags and `title` strings, the output of `sortProjects()` SHALL place every project where `featured === true` before every project where `featured` is `false` or absent; within each group, projects SHALL appear in ascending case-insensitive alphabetical order by `title`.

**Validates: Requirements 13.6, 3.6**

---

### Property 4: recentlyViewed deduplication and cap

*For any* sequence of project slug strings passed sequentially to `addRecentlyViewed()`, the resulting stored array SHALL satisfy all three invariants simultaneously: (a) no slug appears more than once, (b) the array length is ≤ 5, and (c) the slug from the most recent call is at index 0.

**Validates: Requirements 4.6, 15.2**

---

### Property 5: Theme round-trip

*For any* call to `Theme_Service.setTheme(value)` where `value` is `"dark"` or `"light"`, a subsequent call to `Theme_Service.getTheme()` SHALL return `value`, and `document.documentElement.dataset.theme` SHALL equal `value`.

**Validates: Requirements 9.2, 9.6**

---

### Property 6: RSS_Service timeout error emission

*For any* simulated fetch response that resolves after a delay greater than 10 000 ms, the observable returned by `RSS_Service.fetchArticles()` SHALL emit an error notification before completing, and SHALL NOT emit a next value; the error SHALL cause `ArticlesSection` to render its error message rather than article cards.

**Validates: Requirements 5.5, 5.6**

---

### Property 7: Contact link accessibility invariant

*For any* array of `ContactLink` objects rendered by `ContactSection`, every rendered `<a>` element SHALL simultaneously satisfy: `target="_blank"`, `rel="noopener noreferrer"`, a non-empty `aria-label` attribute, and a computed minimum touch-target dimension of ≥ 44 px in both width and height.

**Validates: Requirements 8.3, 8.4, 8.6**

---

### Property 8: Tab ARIA state consistency

*For any* `NavTabs` render with N tabs and any active tab index i (0 ≤ i < N), exactly one tab SHALL have `aria-selected="true"` (the tab at index i), all other N−1 tabs SHALL have `aria-selected="false"`, the panel corresponding to tab i SHALL be visible (not `hidden`), and all other panels SHALL have the `hidden` attribute applied.

**Validates: Requirements 2.2, 2.6**

---

### Property 9: Storage_Service write-failure safety

*For any* key/value pair passed to `Storage_Service.set()` when the underlying `localStorage.setItem` throws (quota exceeded, access denied, or private-browsing restriction), the call SHALL return `false`, SHALL NOT propagate an unhandled exception, and a subsequent `Storage_Service.get()` for the same key SHALL return the value from the in-memory fallback store.

**Validates: Requirements 9.7, 15.1, 15.3**

---

### Property 10: Resume button state matches data

*For any* `resumeUrl` value (including `undefined`, the empty string `""`, and arbitrary non-empty strings), the Resume button rendered by `ChannelHeader` SHALL be in an enabled interactive state if and only if `resumeUrl` is a non-empty string; otherwise the button SHALL carry `aria-disabled="true"` and SHALL NOT navigate on click.

**Validates: Requirements 1.5, 1.6**

---

### Property 11: Tab keyboard navigation correctness

*For any* `NavTabs` render with N tabs and any initial focused tab at index i, pressing `ArrowRight` SHALL move focus to tab at index `(i + 1) mod N`, pressing `ArrowLeft` SHALL move focus to tab at index `(i − 1 + N) mod N`, and pressing `Enter` or `Space` on any focused tab at index j SHALL activate that tab (setting `aria-selected="true"` at j and `"false"` everywhere else).

**Validates: Requirements 2.7, 2.8**

---

### Property 12: RSS parse output validity and display cap

*For any* valid rss2json-format JSON response containing between 0 and N article items (N ≥ 0), the observable emitted by `RSS_Service.fetchArticles()` SHALL produce an array where every item contains `title` (non-empty string), `url` (non-empty string), and `pubDate` (parseable date string); and the `ArticlesSection` SHALL render `min(N, 10)` `ArticleCard` components.

**Validates: Requirements 5.2, 5.3**

---

### Property 13: Article date formatting invariant

*For any* `ArticleData` object whose `pubDate` field is a valid ISO 8601 date string, the date displayed inside the rendered `ArticleCard` SHALL exactly match the format `"Month DD, YYYY"` (e.g., `"January 05, 2024"`) — where `Month` is the full English month name, `DD` is zero-padded day, and `YYYY` is the four-digit year.

**Validates: Requirements 5.4**

---

### Property 14: GitHub repository display invariant

*For any* array of `RepoData` objects returned by the GitHub API, the `GitHubSection` SHALL render at most 6 featured repositories (those whose `topics` array contains `"featured"`) and at most 6 recent repositories (sorted by `pushed_at` descending), where both caps are enforced independently regardless of the total number of repositories in the input array.

**Validates: Requirements 7.2, 7.3**

---

### Property 15: Image alt attribute presence

*For any* set of image-containing components rendered with arbitrary `ProjectData`, `ArticleData`, or `ProfileData` values, every `<img>` element in the rendered output SHALL have an `alt` attribute present (the attribute may be empty `""` for decorative images but SHALL NOT be absent); for informational images, the `alt` text SHALL be no longer than 150 characters.

**Validates: Requirements 12.3, 11.2**

---

### Property 16: Reduced-motion animation variant compliance

*For any* animated component that uses Framer Motion and reads `useReducedMotion()`, when the hook returns `true`, the applied animation variant SHALL have no `y`, `x`, `scale`, or `rotate` transform properties (only `opacity` is permitted to animate), and the transition `duration` SHALL be ≤ 0.15 seconds.

**Validates: Requirements 10.6**

---

## Error Handling

### RSS Feed Failure
- Displayed as a non-blocking inline message inside `ArticlesSection` (not a toast or modal)
- Shown when: fetch fails, parse fails, or 10s timeout elapses
- Error message example: "Articles could not be loaded. Check your connection or visit Medium directly."
- The rest of the page remains fully functional

### GitHub API Failure
- `GitHubSection` replaces failed sub-sections with an inline message and a direct link to the GitHub profile
- Rate-limit (403) and network errors are both caught and displayed identically to the user
- Skeleton state is shown during loading; error state replaces skeletons on failure

### Project Page — 404 vs Runtime Error
- `useProject(slug)` returns `undefined` when slug has no match → renders `NotFoundPage` with a back link
- Runtime errors inside `ProjectPage` are caught by `ErrorBoundary` → renders inline error without redirect
- These two error paths are distinct: 404 uses router navigation, runtime error uses React error boundary

### Image Load Failures
- `ProjectCard` thumbnail: `onError` handler swaps `<img>` for a `<div>` styled placeholder displaying the project title
- `ArticleCard` cover image: `onError` handler swaps `<img>` for a styled placeholder
- `Banner`: `onError` swaps `<img>` for a CSS gradient placeholder

### localStorage Unavailability
- `Storage_Service.isAvailable()` is called once on app startup
- All subsequent reads/writes use an in-memory `Map` fallback when unavailable
- No error is thrown; the experience degrades gracefully (theme defaults to dark, recentlyViewed is session-only)

### Markdown Parsing Failures
- Invalid or missing frontmatter fields trigger `console.warn` only — the file is silently excluded
- Duplicate slugs trigger `console.warn` with both filenames and the duplicated slug

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

Focus areas:
- `useProjects()` hook: validation logic, sort order, duplicate slug detection, missing fields
- `Storage_Service`: write failure fallback, in-memory mode, deduplication logic
- `Theme_Service`: getTheme fallback to dark, setTheme round-trip, FOUC prevention script
- `NavTabs`: ARIA state, keyboard navigation (ArrowLeft, ArrowRight, Enter, Space), default Projects tab
- `ChannelHeader`: Resume button enabled/disabled state, social links rendering
- `ContactSection`: `aria-label` format, `rel` attribute, touch target size
- `RSS_Service`: timeout error emission, successful parse, malformed JSON handling
- `ProjectCard`: image load failure → placeholder fallback
- `ArticleCard`: date formatting, cover image fallback
- `ErrorBoundary`: render error in `ProjectPage` → inline error message, no redirect
- `NotFoundPage`: unmatched slug renders 404 with back link

### Property-Based Tests (fast-check)

Property-based testing is appropriate for this feature because several core behaviors involve universally quantified invariants over a large input space: the content pipeline (validation, deduplication, sorting), state persistence (recentlyViewed cap/dedup, theme round-trip), service contracts (timeout, error propagation, parse correctness), and accessibility invariants (ARIA state, contact link attributes). Each property test runs a minimum of 100 iterations.

Each test must include a comment referencing its design property:
```ts
// Feature: portfolio-website, Property N: <property text>
```

**Property 1** — Project validation excludes invalid files
Generate random arrays of project-shaped objects where a random subset is missing one or more required fields (`title`, `slug`, `description`, `technologies`, `github`). Assert `validateProjects()` output contains only fully-valid objects, and `console.warn` was called for each excluded file.

**Property 2** — Duplicate slug exclusion
Generate random project arrays where a random subset shares a duplicated `slug`. Assert that all objects sharing a duplicated slug are absent from the `validateProjects()` output, and `console.warn` was called identifying each conflict.

**Property 3** — Project sort order invariant
Generate random valid project arrays with random `featured` boolean values and arbitrary `title` strings. Assert `sortProjects()` output: all `featured === true` items precede all others; within each group, titles are in ascending case-insensitive alphabetical order.

**Property 4** — recentlyViewed deduplication and cap
Generate random sequences of slug strings of length 1–20, including intentional repeats. Apply each sequentially to `addRecentlyViewed()`. Assert: the resulting array contains no duplicates, has length ≤ 5, and the slug from the final call is at index 0.

**Property 5** — Theme round-trip
For each value in `["dark", "light"]`, call `Theme_Service.setTheme(value)`, then assert `Theme_Service.getTheme()` returns `value` and `document.documentElement.dataset.theme === value`. (Two cases, but the property generalises to all valid theme values.)

**Property 6** — RSS_Service timeout error emission
Generate random delay values > 10 000 ms (mocked via fake timers). Assert the observable from `RSS_Service.fetchArticles()` always emits an error notification and never emits a next value; assert `ArticlesSection` renders its error state rather than article cards.

**Property 7** — Contact link accessibility invariant
Generate random arrays of `ContactLink` objects with arbitrary platforms and URLs. Render `ContactSection`. Assert every `<a>` element has `target="_blank"`, `rel="noopener noreferrer"`, and a non-empty `aria-label`. Assert CSS classes that enforce ≥ 44 px min touch target are applied to each link.

**Property 8** — Tab ARIA state consistency
Generate random tab lists (2–8 tabs) and random target active tab indices. After simulating a tab activation, assert exactly one tab has `aria-selected="true"` (the activated tab), all others have `aria-selected="false"`, and the matching panel is visible while all other panels carry `hidden`.

**Property 9** — Storage_Service write-failure safety
Generate random key/value string pairs. Mock `localStorage.setItem` to always throw. Call `Storage_Service.set(key, value)`. Assert return value is `false`, no exception escapes the call, and `Storage_Service.get(key)` returns the expected value from the in-memory fallback.

**Property 10** — Resume button state matches data
Generate random `resumeUrl` values: empty string, `undefined`, and arbitrary non-empty URL strings. Render `ChannelHeader` with each. Assert the Resume button has `aria-disabled="true"` iff `resumeUrl` is empty or absent; otherwise the button is enabled and has the correct `href`.

**Property 11** — Tab keyboard navigation correctness
Generate random tab lists of length 2–10 and random initial focus positions. Simulate `ArrowRight` and `ArrowLeft` key events. Assert new focus index equals `(old ± 1) mod N` with wrap-around. Simulate `Enter` and `Space` on any focused tab and assert that tab becomes the active selection.

**Property 12** — RSS parse output validity and display cap
Generate random rss2json-shaped JSON responses with 0–20 items, where each item has random field values. Assert every item in the observable output has a non-empty `title`, non-empty `url`, and a parseable `pubDate`; assert `ArticlesSection` renders exactly `min(N, 10)` `ArticleCard` components.

**Property 13** — Article date formatting invariant
Generate random valid ISO 8601 date strings spanning years 2000–2099. Render `ArticleCard` with each as `pubDate`. Assert the displayed date string matches the regex `/^[A-Z][a-z]+ \d{2}, \d{4}$/` (e.g., `"January 05, 2024"`).

**Property 14** — GitHub repository display invariant
Generate random `RepoData` arrays of length 0–50, where a random subset has `"featured"` in their `topics` array and repos have random `pushed_at` dates. Assert `GitHubSection` renders at most 6 featured repos and at most 6 recent repos, with recent repos sorted by `pushed_at` descending.

**Property 15** — Image alt attribute presence
Generate random `ProjectData`, `ArticleData`, and `ProfileData` values with arbitrary image paths. Render the corresponding components. Assert every `<img>` element has an `alt` attribute present; for informational images assert `alt.length ≤ 150`.

**Property 16** — Reduced-motion animation variant compliance
Mock `useReducedMotion()` to return `true`. For each animated component (`ProjectCard`, `ArticleCard`, section wrappers), assert the applied Framer Motion variant has no `y`, `x`, `scale`, or `rotate` properties, and `transition.duration ≤ 0.15`.

### Integration Tests (Vitest + jsdom)

- Full `RSS_Service` pipeline: mock rss2json response → parsed `ArticleData[]` matches expected shape
- `useProjects()`: mock `import.meta.glob` return → correct project list after validation and sorting
- `ProjectPage` rendering: given a valid slug, renders all required sections from frontmatter
- Router navigation: clicking a `ProjectCard` navigates to `#/projects/:slug`
- `ErrorBoundary` in `ProjectPage`: simulated render error → inline error message shown, no redirect
- `GitHubSection`: mock GitHub API response → featured repos and recent repos rendered correctly
- Theme persistence: `Theme_Service.setTheme` → reload simulation → `Theme_Service.getTheme` returns same value

### Accessibility Tests (axe-core via `vitest-axe`)

- Run `axe()` on each major section component render
- Assert zero violations for rules: `color-contrast`, `aria-required-attr`, `label`, `focus-visible`
- Run axe on both `data-theme="dark"` and `data-theme="light"` variants
- Skip Navigation link: assert first focusable element in the DOM is the skip nav link

### Performance Validation

- Lighthouse CI in GitHub Actions: assert Performance ≥ 90 and Accessibility ≥ 90 on both desktop and mobile profiles
- `React.lazy` for `ProjectPage`: assert the initial JS bundle does not include the project page chunk (bundle size analysis)
- Image lazy loading: assert images below the fold carry `loading="lazy"` attribute
