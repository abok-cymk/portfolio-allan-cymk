---
title: Expenses Chart Component
slug: expenses-chart
description: Interactive bar chart component that visualises weekly spending data with optimistic UI updates and animated bar skeletons during loading.
technologies:
  - React
  - JavaScript
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/expenses-chart-component-main
demo: https://abok-cymk.github.io/expenses-chart-component-main/
featured: true
thumbnail: expense-chart.png
---

## Overview

A Frontend Mentor challenge that renders a responsive bar chart from local JSON data. The standout implementation detail is the optimistic update pattern — bar heights animate in immediately with skeleton placeholders before the real values settle.

## Features

- Custom SVG-free bar chart built entirely with CSS and Flexbox
- Animated bar skeletons on initial load
- Highlight of the current day's bar
- Hover tooltips showing exact spend amounts
- Accessible markup with `aria-label` on each bar

## Technical Decisions

### Pure CSS bars instead of a chart library
Keeping Chart.js or D3 out of the bundle saves ~200KB. Each bar is simply a `div` with a `height` driven by a CSS custom property, making animation trivial with `transition: height 300ms ease`.

### Optimistic updates
Bar heights are set to their final values immediately after the JSON is parsed, before the animation delay fires. This gives the illusion of instant rendering even on slow connections.

## Challenges

Getting the bar highlight for "today" to work correctly required mapping the JSON's day abbreviations to JavaScript's `Date.getDay()` index, accounting for the Sunday = 0 convention.

## Lessons Learned

CSS custom properties are a clean way to drive data-driven animations without JavaScript animation libraries — passing a `--bar-height` variable per element keeps the logic in JS and the rendering in CSS where it belongs.
