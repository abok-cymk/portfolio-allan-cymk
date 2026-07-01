---
title: Notification Page
slug: notification-page
description: A notifications inbox UI with an unread count badge and a "Mark all as read" toggle that clears the badge and removes unread highlights in one click.
technologies:
  - React
  - JavaScript
  - Tailwind CSS
  - Vite
github: https://github.com/abok-cymk/notifications-page-main
demo: https://abok-cymk.github.io/notifications-page-main/
featured: false
thumbnail: notification-page.png
---

## Overview

A Frontend Mentor challenge that renders a list of mixed notification types — reactions, follows, messages, group mentions, and picture comments. The unread count badge in the header updates reactively as the user reads individual notifications or uses "Mark all as read".

## Features

- Unread count badge derived from notification state
- Per-notification unread dot that disappears on interaction
- "Mark all as read" clears all unread states in one action
- Varied notification subtypes with different layouts (avatar + image previews)
- Accessible list with semantic HTML and readable contrast ratios

## Technical Decisions

### Derived unread count
The badge count is `notifications.filter(n => n.isUnread).length`, computed on each render rather than stored separately. This keeps state minimal and the count always consistent with the list.

### Immutable state updates
Each notification is updated with `map()` returning a new object rather than mutating the original — this ensures React re-renders correctly and keeps state updates predictable.

## Challenges

Different notification types needed different card layouts (some with a thumbnail image on the right, some without). A discriminated union approach — checking a `type` field and rendering conditionally — kept the single `NotificationCard` component manageable without splitting into many specialised components.

## Lessons Learned

Mapping a diverse data shape to a single flexible component is cleaner than creating one component per notification type, as long as the conditional rendering logic stays readable.
