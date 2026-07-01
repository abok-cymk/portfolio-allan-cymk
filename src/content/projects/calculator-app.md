---
title: Calculator App
slug: calculator-app
description: A fully functional calculator with three switchable colour themes, built with React Context for theme state and keyboard support for all operations.
technologies:
  - React
  - JavaScript
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/calculator-app-main
demo: https://abok-cymk.github.io/calculator-app-main/
featured: true
thumbnail: calculator-app.png
---

## Overview

A Frontend Mentor challenge that goes beyond a basic calculator by adding three distinct colour themes (light, dark, violet) toggled via a three-position slider. All calculator logic is self-contained and the UI is fully operable via keyboard.

## Features

- Four arithmetic operations with decimal support
- Three switchable themes stored in React Context
- Keyboard support for digits, operators, Enter, Backspace, and Escape
- Prevents invalid input sequences (e.g. double operators)
- Responsive layout that works on mobile and desktop

## Technical Decisions

### React Context for themes
Theme state is lifted into a `ThemeProvider` at the app root so any component can read the active theme without prop drilling. The active theme drives a `data-theme` attribute on `<html>`, which Tailwind's dark-mode variant picks up.

### Evaluated expression as a string
Keeping the display value as a string and parsing it only on `=` avoids floating-point representation issues during input — the user sees exactly what they type until evaluation.

## Challenges

Handling the edge case where the user presses an operator immediately after `=` (chaining results) required distinguishing between "just evaluated" and "mid-expression" states in the reducer.

## Lessons Learned

Using a `useReducer` instead of multiple `useState` calls made the calculator's state transitions explicit and easy to test — each button press maps to a single dispatched action type.
