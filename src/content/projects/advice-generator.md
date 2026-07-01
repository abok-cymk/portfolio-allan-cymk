---
title: Advice Generator App
slug: advice-generator
description: Fetches random advice from the Advice Slip API using TanStack Query for data fetching, with loading skeletons and accessibility-focused markup.
technologies:
  - React
  - TypeScript
  - TanStack Query
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/advice-generator-app-main
demo: https://abok-cymk.github.io/advice-generator-app-main/
featured: true
thumbnail: advice-generator.png
---

## Overview

A Frontend Mentor challenge solution that generates random advice on demand by consuming the [Advice Slip API](https://api.adviceslip.com/). Built with React and TypeScript, it demonstrates clean async data fetching patterns using TanStack Query.

## Features

- Fetches a new random advice slip on button click
- TanStack Query handles caching, loading, and error states
- Loading skeleton shown while request is in-flight
- Fully accessible — keyboard navigable with proper ARIA labels
- Lighthouse-audited for performance and accessibility

## Technical Decisions

### TanStack Query over raw fetch
Using `useQuery` with `refetchOnWindowFocus: false` and manual `refetch` triggers keeps the UX predictable — no surprise advice swaps when the user alt-tabs back in.

### TypeScript throughout
Typing the API response up front catches shape mismatches at compile time rather than at runtime in production.

## Challenges

The Advice Slip API doesn't cache-bust responses reliably, so rapid successive clicks could return the same advice. Solved by appending a timestamp query param to force a fresh request each time.

## Lessons Learned

TanStack Query's `isFetching` vs `isLoading` distinction matters: `isLoading` only fires on the initial load, while `isFetching` fires on every refetch — using the wrong one leads to a skeleton that never shows on subsequent clicks.
