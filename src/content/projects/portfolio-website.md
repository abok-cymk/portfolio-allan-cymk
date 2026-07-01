---
title: Portfolio Website
slug: portfolio-website
description: A YouTube-channel-inspired developer portfolio built with React, Vite, Tailwind CSS v4, and Framer Motion. Content-driven via Markdown files.
technologies:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Framer Motion
  - RxJS
  - React Router
github: https://github.com/abok-cymk/portfolio-allan-cymk
demo: https://your-username.github.io/portfolio-website/
featured: true
---

## Overview

This portfolio website is a single-page application (SPA) inspired by YouTube channel pages rather than traditional portfolio designs. It showcases projects, articles, skills, and GitHub activity in a clean, accessible layout.

## Features

- **Content-driven architecture** — add a project by dropping a Markdown file into `src/content/projects/`, no component changes required
- **Dark/light theme** — persisted to localStorage, applied before body render to prevent FOUC
- **Medium RSS integration** — articles stream automatically from the developer's Medium feed via RxJS
- **GitHub section** — contribution graph and repository cards via public GitHub REST API
- **Accessible** — ARIA tabs, skip navigation, keyboard-navigable, axe-clean

## Technical Decisions

### Hash-based routing
GitHub Pages cannot rewrite arbitrary paths to `index.html`, so React Router's `HashRouter` encodes all navigation in the URL fragment (e.g., `#/projects/portfolio-website`). This makes all deep links work without any server configuration.

### Tailwind CSS v4 (CSS-only)
No `tailwind.config.js` — all design tokens live inside `@theme {}` blocks in `index.css` as CSS custom properties. The `[data-theme="dark"]` selector overrides these variables to drive the dark/light theme switch.

### RxJS for RSS
The Medium RSS feed is proxied through rss2json.com to avoid CORS issues on a fully-static site. The `fetchArticles()` observable applies a 10-second timeout and surfaces errors through the observable stream rather than throwing.

## Challenges

Getting Tailwind v4's data-attribute dark mode to coexist with Framer Motion's inline styles required careful separation: Tailwind utilities handle layout and spacing, while themed colours always reference CSS custom properties via `style` props.

## Lessons Learned

Building with Vite's `import.meta.glob` at build time is surprisingly ergonomic — the glob result is eagerly evaluated and fully typed, making the project pipeline simple and colocated.
