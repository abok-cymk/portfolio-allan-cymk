---
title: Pricing Component with Toggle
slug: pricing-component
description: A pricing page with an annual/monthly billing toggle. Switching between plans animates the price change and the active plan is visually differentiated with an accent gradient card.
technologies:
  - React
  - JavaScript
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/pricing-component-with-toggle-master
demo: https://abok-cymk.github.io/pricing-component-with-toggle-master/
featured: true
thumbnail: pricing-component.png
---

## Overview

A Frontend Mentor challenge implementing a common SaaS pricing pattern — three tiers with an annual/monthly billing toggle that updates displayed prices instantly. The middle "Pro" card uses an accent gradient to visually anchor it as the recommended tier.

## Features

- Annual / monthly billing toggle with a custom-styled switch
- Prices update immediately on toggle with a smooth CSS transition
- Three pricing tiers: Basic, Professional, Master
- Highlighted "recommended" centre card with gradient background
- Fully responsive and accessible toggle (role="switch", aria-checked)

## Technical Decisions

### Boolean state for billing cycle
A single `isAnnual` boolean in `useState` drives all three price displays. Price values are stored as objects `{ monthly, annual }` per tier and the active key is derived from the boolean.

### CSS transition on price numbers
Wrapping price spans in a container with `overflow: hidden` and applying a `translateY` transition on the inner element creates a slot-machine style reveal when the billing cycle changes.

## Challenges

Styling the custom toggle switch to match the design precisely while remaining keyboard accessible required careful use of `focus-visible` and a visually hidden `<input type="checkbox">` driving the visual layer via sibling selectors.

## Lessons Learned

Separating data (tier configs) from presentation (card components) kept the JSX clean — adding a fourth tier in the future would only require one new entry in the config array, not changes to any component.
