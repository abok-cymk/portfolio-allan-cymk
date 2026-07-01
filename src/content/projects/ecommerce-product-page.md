---
title: Ecommerce Product Page
slug: ecommerce-product-page
description: A sample project demonstrating all optional frontmatter fields including thumbnail, demo link, and related Medium posts.
technologies:
  - JavaScrippt
  - CSS3
  - HTML5
  - React.Js
  - Vite
github: https://github.com/abok-cymk/ecommerce-product-page-main
demo: https://abok-cymk.github.io/ecommerce-product-page-main/
featured: false
thumbnail: ecommerce-product-page.png
mediumPosts:
  - sample-article-slug
---

## Overview

This is a sample project included to demonstrate how the content-driven architecture works. It shows all optional frontmatter fields in use: a `thumbnail` for the card image, a `demo` link, and `mediumPosts` to link related Medium articles.

## Features

- REST API with Express and PostgreSQL
- Dockerised development environment
- Full test coverage with Jest
- CI/CD via GitHub Actions

## Technical Decisions

### Docker Compose for local dev
Using Docker Compose ensures a consistent Postgres instance across all developer machines, eliminating "works on my machine" issues for database-dependent tests.

### Connection pooling
`pg`'s built-in pool is configured with a `max` of 10 connections to avoid exhausting the database under load while keeping latency low for concurrent requests.

## Challenges

Migrating from a single-container deployment to a multi-service Docker Compose setup required updating all environment variable references and adjusting the healthcheck timing for the database readiness probe.

## Lessons Learned

Starting with a well-defined database schema and writing migrations from day one makes it significantly easier to onboard new team members and roll back changes safely.
