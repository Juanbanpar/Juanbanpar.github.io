# Juan Banga Pardo

## Stack

Astro, TypeScript, Markdown, plain CSS. Node.js 24 and npm. Hosted on GitHub Pages.

## Edit content

| Content | File |
| --- | --- |
| Biography | `src/content/biography/{en,gl,es}.md` |
| Publications, talks, projects | `src/data/work.ts` |
| Homepage selection | `selectedWork` in `src/data/work.ts` |
| Profile links | `src/data/site.ts` |
| Navigation and interface text | `src/lib/i18n.ts` |

Update core content in English, Galician, and Spanish. Keep original publication and talk titles.

### Posts

Add a Markdown file under `src/content/writing/{en,gl,es}/`:

```yaml
---
title: "Post title"
description: "Summary"
date: "2026-10-06"
language: en
kind: article
draft: true
---
```

Write the body below the frontmatter. The filename becomes the URL slug. Use `kind: note` for short posts. Give translations the same `translationGroup` value and their own `language`.

Put images in `public/images/`; reference them as `![Alt text](/images/file.webp)`.

Set `draft: false` and a date of today or earlier, then push to `main` to publish.

### Preview

```sh
npm ci
npm run dev
```
