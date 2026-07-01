# Requirements Document

## Introduction

A modern developer portfolio website that helps recruiters and employers quickly understand who the developer is, what they have built, what they write about, and what technologies they work with. The experience is inspired by YouTube channel pages rather than traditional portfolios. The site is built with React, Vite, Tailwind CSS v4, Framer Motion, RxJS (where appropriate), and deployed to GitHub Pages. Content is driven by Markdown files with frontmatter so that adding a project requires no changes to UI components.

## Glossary

- **Portfolio_Site**: The complete single-page application serving the developer portfolio.
- **Channel_Header**: The top section of the homepage, styled after a YouTube creator page, containing the banner, profile photo, name, title, intro, social links, and resume button.
- **Banner**: A full-width decorative image strip at the top of the Channel_Header, implemented as a reusable component with a placeholder image.
- **Nav_Tabs**: The horizontal tab bar below the Channel_Header that controls which section is displayed (Projects, Articles, Skills, About).
- **Project_Card**: A card component styled after a YouTube video card, used to display a project summary in the Projects section.
- **Project_Page**: A dedicated route (`/projects/:slug`) that displays the full detail for a single project.
- **Article_Card**: A card component used to display a summary of a Medium article.
- **Skills_Section**: The section that organises the developer's skills by category.
- **GitHub_Section**: The section near the bottom of the homepage showing GitHub contribution graph, featured repositories, and recent repositories.
- **Contact_Section**: The section providing icon-based links for reaching the developer.
- **Content_Directory**: The `src/content/projects/` directory where each project is represented by a Markdown file with frontmatter metadata.
- **Medium_Feed**: The public RSS feed exposed by Medium used to load articles automatically.
- **RSS_Service**: The client-side service responsible for fetching and parsing the Medium RSS feed.
- **Theme_Service**: The client-side service responsible for persisting and restoring the user's theme preference via localStorage.
- **Router**: The client-side router (React Router) responsible for navigating between the homepage and Project Pages.
- **Frontmatter**: YAML metadata embedded at the top of each Markdown file in the Content_Directory.

---

## Requirements

### Requirement 1: Channel Header

**User Story:** As a recruiter visiting the portfolio, I want to immediately see who the developer is and how to contact them, so that I can quickly evaluate fit without scrolling.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render the Channel_Header as the first visible section on the homepage.
2. THE Banner SHALL be implemented as a reusable React component that accepts an optional image source prop and displays a same-size placeholder graphic when no image is provided; the placeholder SHALL NOT render as a broken image or blank space.
3. THE Channel_Header SHALL display the developer's name, professional title, and a short introduction paragraph of no more than 300 characters; WHERE a profile photo is provided, THE Channel_Header SHALL display it as a circular image exactly 200×200 px.
4. THE Channel_Header SHALL display icon-based social links (email, LinkedIn, Medium, X/Twitter, GitHub) using Lucide React icons or custom SVGs.
5. THE Channel_Header SHALL always render the Resume button; WHEN the site's content data contains a non-empty resume URL, THE Channel_Header SHALL render the Resume button in an enabled state that opens the URL in a new browser tab.
6. IF the site's content data does not contain a resume URL or the URL is empty, THEN THE Channel_Header SHALL render the Resume button in a disabled state with an accessible aria-disabled attribute set to "true".

---

### Requirement 2: Navigation Tabs

**User Story:** As a visitor, I want to navigate between sections of the portfolio using tabs, so that I can quickly jump to the content I care about without scrolling through the entire page.

#### Acceptance Criteria

1. THE Nav_Tabs SHALL render at least the following tabs: Projects, Articles, Skills, About.
2. WHEN a tab is selected, THE Portfolio_Site SHALL display the corresponding section content and set the inactive panels to `hidden` so they are removed from both visual layout and the accessibility tree.
3. WHEN switching between tabs, THE Portfolio_Site SHALL apply an animated transition using Framer Motion with a duration no greater than 300ms.
4. THE Nav_Tabs SHALL indicate the currently active tab with a visual style that is visually distinguishable from inactive tabs (e.g., underline, highlight, or contrasting color).
5. WHEN the page loads, THE Nav_Tabs SHALL default to the Projects tab as the active selection.
6. THE Nav_Tabs SHALL comply with the ARIA tabs pattern: the container SHALL have `role="tablist"`, each tab SHALL have `role="tab"`, the active tab SHALL have `aria-selected="true"`, and all inactive tabs SHALL have `aria-selected="false"`.
7. WHEN focus is on a tab, pressing the Arrow Right or Arrow Left key SHALL move focus to the next or previous tab respectively, wrapping around at the ends of the tab list.
8. WHEN focus is on a tab, pressing Enter or Space SHALL activate that tab and display its associated section content.

---

### Requirement 3: Projects Section

**User Story:** As a recruiter, I want to browse the developer's projects in a visually engaging layout, so that I can assess depth and breadth of experience efficiently.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render the Projects section as a responsive grid of Project_Cards with at least 1 column on mobile (< 640px), at least 2 columns on tablet (640px–1023px), and at least 3 columns on desktop (≥ 1024px).
2. THE Portfolio_Site SHALL display each valid project from the Content_Directory as a Project_Card showing a thumbnail image, title, short description of no more than 150 characters, technology stack tags, a repository link, and an optional live demo link when `demo` is present in the Frontmatter.
3. WHEN a Project_Card is selected by click or keyboard activation, THE Router SHALL navigate to the corresponding Project_Page at `#/projects/:slug`.
4. THE Portfolio_Site SHALL derive project data exclusively from Markdown files in the Content_Directory; no project data SHALL be hardcoded inside React components.
5. WHEN the Content_Directory contains a new Markdown file with valid Frontmatter, THE Portfolio_Site SHALL automatically include that project in the Projects section without requiring changes to UI components.
6. WHERE a project has `featured: true` in its Frontmatter, THE Portfolio_Site SHALL render that Project_Card before non-featured cards.
7. IF a project thumbnail image fails to load, THEN THE Project_Card SHALL replace the broken image with a styled placeholder element that displays the project title as its visible text and sets the image's alt attribute to the project title.
8. WHEN the Content_Directory contains no valid project files, THE Portfolio_Site SHALL display an empty-state message in the Projects section indicating that no projects are available.

---

### Requirement 4: Project Pages

**User Story:** As a technical reviewer, I want a dedicated page for each project with full detail, so that I can deeply evaluate technical decisions and challenges.

#### Acceptance Criteria

1. THE Router SHALL resolve `#/projects/:slug` to the Project_Page whose Frontmatter `slug` field exactly matches the `:slug` segment of the URL.
2. IF no Markdown file's `slug` field matches the requested `:slug`, THEN THE Router SHALL render a 404 page with a link back to the homepage; IF a matching file exists but fails to load due to a runtime error, THEN THE Project_Page SHALL display an inline error message without redirecting to the 404 page.
3. THE Project_Page SHALL display the following sections from Frontmatter and Markdown body where the corresponding data is present: project title, overview, features list, technical decisions, screenshots, technology stack, challenges, lessons learned, repository link, and demo link when `demo` is present in the Frontmatter.
4. THE Project_Page SHALL render the Markdown body content with proper heading hierarchy (h1–h6), lists, code blocks with syntax highlighting, and inline links.
5. WHERE a project Frontmatter includes one or more `mediumPosts` slugs, THE Project_Page SHALL display the corresponding Article_Cards for those slugs; IF a `mediumPosts` slug does not match any article in the RSS_Service feed, THE Project_Page SHALL silently omit that card without displaying an error.
6. WHEN a visitor navigates to a Project_Page by any means (internal navigation or direct external link), THE Portfolio_Site SHALL store the project slug in localStorage under a `recentlyViewed` key, retaining at most the 5 most recently viewed slugs; IF the slug is already present in the list, THE Portfolio_Site SHALL move it to the most recent position without duplicating it.

---

### Requirement 5: Medium Integration

**User Story:** As a visitor interested in what the developer writes, I want to see Medium articles loaded automatically, so that I always see the latest published content without the developer manually updating the site.

#### Acceptance Criteria

1. WHEN the page loads, THE RSS_Service SHALL fetch the developer's Medium RSS feed using the public URL `https://medium.com/feed/@{username}`.
2. WHEN the RSS feed is fetched successfully, THE RSS_Service SHALL parse the feed and expose an observable stream of Article objects, each containing: title, publication date, reading time (when present in the feed), cover image URL (when present), and article URL.
3. WHEN the Articles tab is selected, THE Portfolio_Site SHALL display up to 10 Article_Cards populated from the RSS_Service observable stream.
4. EACH Article_Card SHALL display the title, publication date formatted as "Month DD, YYYY", and reading time when available; IF a cover image URL is present in the Article object, THE Article_Card SHALL display the cover image; IF no cover image URL is present, THE Article_Card SHALL display a styled placeholder in place of the image.
5. IF the RSS_Service fails to fetch or parse the feed, OR IF the request exceeds 10 seconds without a response, THEN THE Portfolio_Site SHALL display a non-blocking error message in the Articles section explaining that articles could not be loaded.
6. THE RSS_Service SHALL use RxJS to manage the fetch lifecycle, including a 10-second timeout per request; WHEN the timeout elapses before a response is received, THE RSS_Service SHALL emit an error through the observable stream.
7. WHILE the RSS feed is loading, THE Portfolio_Site SHALL display 3 skeleton placeholder cards in the Articles section.

---

### Requirement 6: Skills Section

**User Story:** As a recruiter, I want to see the developer's technical skills organised by category, so that I can quickly identify relevant expertise.

#### Acceptance Criteria

1. THE Skills_Section SHALL organise skills into named categories: Frontend, Backend, Languages, Tools.
2. THE Skills_Section SHALL display each skill as a compact tag or badge showing the skill name.
3. THE Skills_Section SHALL limit each category to the technologies actively used, with a maximum of 12 skills per category.
4. THE Skills_Section SHALL be defined in a static data file (not in a React component) so that skills can be updated without modifying component code.

---

### Requirement 7: GitHub Section

**User Story:** As a technical evaluator, I want to see the developer's GitHub activity at a glance, so that I can assess consistency of contribution and open-source involvement.

#### Acceptance Criteria

1. WHEN the page loads, THE GitHub_Section SHALL display a GitHub contribution graph for the developer's username.
2. WHEN the page loads, THE GitHub_Section SHALL display a list of up to 6 pinned (featured) repositories, each showing name, description, primary language, star count, and a link to the repository.
3. WHEN the page loads, THE GitHub_Section SHALL display a list of up to 6 most recently updated repositories, each showing name, description, and last-updated date formatted as "Month DD, YYYY".
4. WHILE GitHub data is loading, THE GitHub_Section SHALL display skeleton placeholder elements for the contribution graph and repository lists.
5. IF GitHub data fails to load for any reason (rate limiting, network failure, authentication error, or malformed response), THEN THE GitHub_Section SHALL replace the failed content with a message indicating that GitHub data could not be loaded and a direct link to the developer's GitHub profile.
6. THE GitHub_Section SHALL be positioned below the Nav_Tabs content area on the homepage.

---

### Requirement 8: Contact Section

**User Story:** As a recruiter, I want to find the developer's contact information quickly, so that I can reach out without friction.

#### Acceptance Criteria

1. THE Contact_Section SHALL display icon-based links for: email (mailto: link), LinkedIn profile, Medium profile, X (Twitter) profile, and GitHub profile.
2. THE Contact_Section SHALL use Lucide React icons or custom SVGs exclusively; no emoji SHALL be used.
3. EACH contact link SHALL open in a new browser tab with `rel="noopener noreferrer"` for security.
4. EACH contact link SHALL include an accessible aria-label in the format "[Platform] profile" (e.g., "LinkedIn profile") or "Email [address]" for the mailto link.
5. EACH contact link SHALL be reachable and activatable via keyboard Tab and Enter keys.
6. EACH contact link's interactive target area SHALL be at least 44×44 px.

---

### Requirement 9: Theme

**User Story:** As a visitor, I want the site to default to a dark theme and respect my saved preference, so that the experience matches my environment on every visit.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL default to a dark theme on first load when no stored preference exists.
2. THE Theme_Service SHALL persist the user's theme preference to localStorage under the key `theme` with the value `"dark"` or `"light"`.
3. WHEN the page loads, THE Theme_Service SHALL read the stored theme preference and apply a `data-theme` attribute to the `<html>` element before body content renders, so that no flash of unstyled content occurs.
4. IF reading from localStorage fails or the stored value is absent or invalid, THE Portfolio_Site SHALL apply the dark theme immediately without waiting and proceed without retrying localStorage.
5. THE Portfolio_Site SHALL render a theme toggle control that is visible and keyboard-focusable; the control SHALL have an accessible label indicating the current theme and the action of switching.
6. WHEN the theme toggle is activated, THE Portfolio_Site SHALL switch the active theme, update the `data-theme` attribute on the `<html>` element, and write the new value to localStorage via the Theme_Service.
7. IF a write to localStorage fails when persisting the theme toggle selection, THE Theme_Service SHALL continue operating with the in-memory value without throwing an unhandled error.

---

### Requirement 10: Animations and Motion

**User Story:** As a visitor, I want smooth, subtle animations that enhance the experience without distracting from the content, so that the site feels polished and professional.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL use Framer Motion to manage all animated transitions; static CSS utility classes used solely for styling (not for animated transitions) are exempt from this requirement.
2. WHEN a section or card enters the viewport, THE Portfolio_Site SHALL apply a fade-in animation, optionally combined with a slide-up of no more than 24px, with a duration no greater than 400ms.
3. WHEN a Project_Card or Article_Card is hovered, THE Portfolio_Site SHALL apply a scale transition of no more than 1.03× and a shadow change using Framer Motion.
4. WHEN navigating between Nav_Tabs, THE Portfolio_Site SHALL animate the content transition using Framer Motion's AnimatePresence with a duration no greater than 300ms.
5. THE Portfolio_Site SHALL not apply animations that cause layout shift or reduce Lighthouse performance scores below 90.
6. WHERE a user has enabled the `prefers-reduced-motion` media query, THE Portfolio_Site SHALL replace all transform-based animations with an opacity-only transition of no more than 150ms.

---

### Requirement 11: Performance

**User Story:** As a visitor on any device, I want the portfolio to load and respond quickly, so that I have a smooth browsing experience regardless of connection speed.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL achieve a Lighthouse Performance score of 90 or above on both desktop and mobile.
2. THE Portfolio_Site SHALL defer loading of images that are outside the initial viewport until the image is within one viewport height of the visible area, using the native `loading="lazy"` attribute or an IntersectionObserver-based equivalent.
3. WHEN the Portfolio_Site initialises, THE Router SHALL load the Project_Page component via a dynamic import (`React.lazy`); WHILE the Project_Page chunk is loading, THE Portfolio_Site SHALL display a Suspense fallback indicator to the user.
4. IF image assets are provided in WebP format and the resulting build achieves a Lighthouse Performance score of 90 or above, THE Portfolio_Site SHALL use WebP; IF the 90+ score cannot be maintained with WebP, THE Portfolio_Site SHALL use JPEG or PNG instead provided the 90+ score is maintained.

---

### Requirement 12: Accessibility

**User Story:** As a visitor using assistive technology, I want the portfolio to be fully navigable and understandable, so that I can access all content regardless of ability.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL achieve a Lighthouse Accessibility score of 90 or above.
2. ALL interactive elements (buttons, links, tabs) SHALL have a focus indicator that is a minimum 2px solid outline with a contrast ratio of at least 3:1 against the adjacent background color.
3. ALL images SHALL have an alt attribute; informational images SHALL have alt text of no more than 150 characters describing the image content; decorative images SHALL use an empty alt attribute (`alt=""`).
4. THE Portfolio_Site SHALL use semantic HTML elements (header, nav, main, section, footer, article) to structure content.
5. THE Portfolio_Site SHALL maintain a minimum colour contrast ratio of 4.5:1 for normal text and 3:1 for large text, in both dark and light themes.
6. THE Portfolio_Site SHALL include a visible skip-navigation link as the first focusable element on the page, allowing keyboard users to bypass the Channel_Header and Nav_Tabs and jump directly to the main content area; all interactive elements SHALL be reachable in a logical tab order without keyboard traps.
7. ALL interactive components with dynamic state (tabs, theme toggle, expandable sections) SHALL expose appropriate ARIA roles, states, and properties so that their current state is announced by screen readers.

---

### Requirement 13: Content-Driven Architecture

**User Story:** As the developer maintaining the portfolio, I want to add or update projects by creating Markdown files only, so that I never need to touch component code to publish new content.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL read all `.md` files from the `src/content/projects/` directory at build time using Vite's `import.meta.glob` or an equivalent build-time static file discovery mechanism.
2. THE Portfolio_Site SHALL treat a Markdown file as valid only if it contains all of the following Frontmatter fields: `title` (string), `slug` (string, unique across all project files), `description` (string, 1–300 characters), `technologies` (array of 1–20 strings), and `github` (string matching a valid URL format).
3. THE Portfolio_Site SHALL treat the following Frontmatter fields as optional: `featured` (boolean), `demo` (string matching a valid URL format), `thumbnail` (string containing an image file path), and `mediumPosts` (array of 0–10 strings).
4. IF a Markdown file is missing one or more required Frontmatter fields, THEN THE Portfolio_Site SHALL exclude that project from the rendered output and log a warning to the browser console identifying the filename and each missing field name.
5. IF two or more Markdown files contain the same `slug` value, THEN THE Portfolio_Site SHALL exclude all affected files from the rendered output and log a warning to the browser console identifying the conflicting filenames and the duplicate `slug` value.
6. THE Portfolio_Site SHALL sort valid projects by placing all files where `featured` is `true` first, followed by all remaining projects sorted by their Frontmatter `title` field in ascending alphabetical order.

---

### Requirement 14: Routing and Deployment

**User Story:** As a visitor who bookmarks or shares a project URL, I want deep links to work correctly on GitHub Pages, so that I can return directly to a project page without hitting a 404.

#### Acceptance Criteria

1. THE Router SHALL use hash-based routing so that all navigation paths (e.g., `#/projects/:slug`) are encoded in the URL fragment, ensuring GitHub Pages serves the root `index.html` for all deep links without server-side configuration.
2. THE Portfolio_Site SHALL include a `deploy` script in `package.json` that publishes the built output to the `gh-pages` branch using the `gh-pages` npm package or a GitHub Actions workflow; the script SHALL accept a configurable base path via `vite.config.js` so that the same codebase can be deployed to Netlify or Vercel without architectural changes.
3. WHEN deployed to GitHub Pages under the `/portfolio-website/` repository path, THE Portfolio_Site SHALL load all JavaScript bundles, CSS files, and static assets without 404 errors; asset URLs SHALL use the configured base path as their prefix.
4. IF a visitor navigates directly to `https://{user}.github.io/portfolio-website/` or any hash-based deep link, THE Portfolio_Site SHALL serve the correct page without a 404 response from the server.

---

### Requirement 15: localStorage State Management

**User Story:** As the developer, I want user preferences and browsing history to persist across sessions using localStorage, so that the site feels responsive to returning visitors without requiring a backend.

#### Acceptance Criteria

1. THE Theme_Service SHALL read and write the theme preference to localStorage using the key `theme`; IF a write to localStorage fails (e.g., quota exceeded or access denied), THEN THE Theme_Service SHALL continue operating using the in-memory value without throwing an unhandled error.
2. THE Portfolio_Site SHALL store the array of recently viewed project slugs in localStorage under the key `recentlyViewed`, capped at 5 entries; WHEN a new slug is added and the cap is already reached, THE Portfolio_Site SHALL remove the oldest entry before inserting the new one.
3. THE Portfolio_Site SHALL check localStorage availability once on startup by attempting a test write and read; IF localStorage is unavailable, THEN THE Portfolio_Site SHALL use in-memory state for the remainder of the session without retrying localStorage on every operation.
4. THE Portfolio_Site SHALL not store personally identifiable information in localStorage; only the `theme` key and the `recentlyViewed` key are permitted.
