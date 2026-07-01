---
title: Job Listings with Filtering
slug: job-listings
description: A job board UI where users can filter listings by role, level, languages, and tools. Filter tags accumulate in a persistent bar above the list, managed with React Context.
technologies:
  - React
  - JavaScript
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/static-job-listings-master
demo: https://abok-cymk.github.io/static-job-listings-master/
featured: true
thumbnail: job-listing.png
---

## Overview

A Frontend Mentor challenge that renders a static job board from local JSON and lets users build up a filter set by clicking technology tags on each card. The active filters live in a sticky bar at the top of the page and can be cleared individually or all at once.

## Features

- Multi-tag filtering — add any combination of role, level, language, or tool filters
- Sticky filter bar appears only when at least one filter is active
- Individual filter removal with × button, plus a "Clear" control
- Intersection-based filtering (all active tags must match)
- Accessible — filter buttons include `aria-label` text, list is a `<ul>` with `role="list"`

## Technical Decisions

### React Context for filter state
Lifting filter state into a `FilterContext` avoids passing callbacks through multiple component layers. Any card can dispatch an `ADD_FILTER` action and the list re-renders automatically.

### Derived filtered list via `useMemo`
The visible jobs array is computed with `useMemo(() => filterJobs(allJobs, activeFilters), [activeFilters])`, keeping the filtering logic pure and side-effect free.

## Challenges

The JSON data uses a mix of `null` and empty arrays for optional fields like `languages` and `tools`. Normalising these to empty arrays before filtering prevented runtime errors on `Array.includes()` calls.

## Lessons Learned

Keeping filter logic in a pure function (`filterJobs`) made it trivial to unit test the filtering rules independently from React rendering, catching edge cases like empty filter sets early.
