# Allan Cymk Portfolio

A modern personal portfolio website built with **React + TypeScript + Vite** and deployed to **GitHub Pages**.

🔗 **Live Site:** https://abok-cymk.github.io/portfolio-allan-cymk/

## Overview

This project showcases Allan's work, profile, and selected frontend projects in a fast, responsive, and maintainable web app.

The codebase uses a component-driven architecture with dedicated folders for pages, reusable components, content, hooks, services, and tests.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** CSS + Tailwind CSS tooling
- **Animation:** Framer Motion
- **Markdown Rendering:** react-markdown + gray-matter + rehype-highlight
- **Testing:** Vitest + Testing Library + jsdom + vitest-axe
- **Deployment:** GitHub Pages (via `gh-pages`)
- **Package Manager:** pnpm

## Project Structure

```text
.
├── public/                # Static assets and project images
├── src/
│   ├── assets/
│   ├── components/        # Reusable UI components
│   ├── content/           # Content sources (including markdown-based content)
│   ├── data/              # Structured app data
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility modules
│   ├── pages/             # Route-level pages
│   ├── services/          # External/service-layer logic
│   ├── test/              # Test setup and test utilities
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **pnpm**

### Install

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

The app will start on the local Vite dev server.

## Available Scripts

- `pnpm dev` – start local development server
- `pnpm build` – type-check and create production build
- `pnpm preview` – preview the production build locally
- `pnpm lint` – run ESLint
- `pnpm test` – run tests with Vitest
- `pnpm test:ui` – open Vitest UI
- `pnpm deploy` – build and deploy `dist` to GitHub Pages

## Deployment

This repository is configured for GitHub Pages deployment.

```bash
pnpm deploy
```

This runs the build and publishes the `dist` folder.

## Notes

- The previous default Vite template README has been replaced with project-specific documentation.
- If you add new sections/features (e.g., blog, CMS integration, or API-backed content), update this README to keep it aligned with the current project.
