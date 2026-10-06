# Juan Banga Pardo

Personal website at <https://juanbanpar.github.io>. Built with Astro, Markdown, and plain CSS. English, Galician, and Spanish core pages; writing can be published in any of those languages.

## Local development

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Astro. For the production version:

```sh
npm run check
npm test
npm run build
npm run preview
```

## Publish writing

Add a Markdown file to `src/content/writing/en/`, `gl/`, or `es/`. The filename becomes its URL slug: `en/my-post.md` produces `/writing/my-post/`; a Galician entry produces `/gl/writing/my-post/`.

```yaml
---
title: "My post"
description: "A short summary."
date: "2026-10-06"
language: en
kind: article
draft: true
---
```

Write the body below the frontmatter. Use `kind: note` for short curiosities. Change `draft` to `false` to publish, then commit and push to `main`. Drafts and posts dated after the build date (UTC) are excluded from pages, RSS, and the sitemap. Future-dated posts require another push or a manual deployment on or after their date; there is no scheduled rebuild.

`src/content/writing/en/example.md` is an unpublished example. Rename it before using it. Put public images in `public/images/` and reference them as `![Descriptive alt text](/images/file.webp)`. Files in `public/` are always public, even when only a draft references them.

### Translations

Use the same `translationGroup` value in translated entries, with a different `language` in each. Translated filenames may differ. There can be only one published entry per group and language.

Every writing archive lists all published languages. Its links open the entry in its own language. The language menu links to available translations; when a translation is missing, the menu explicitly links to that language’s writing archive. English core pages use root URLs; Galician and Spanish use `/gl/` and `/es/`.

## Update the profile

- Biography: `src/content/biography/{en,gl,es}.md`.
- Publications, talks, and projects: `src/data/work.ts`. Update summaries in all three languages; preserve original titles. `selectedWork` chooses homepage entries.
- Profile links: `src/data/site.ts`.
- Navigation and interface text: `src/lib/i18n.ts`.
- Colors, typography, and spacing: `src/styles/global.css`.

The CV is used as a source, not shipped with the site. Email, phone, and home address are omitted.

## GitHub Pages

Use the dedicated `Juanbanpar/Juanbanpar.github.io` repository, separate from the profile README repository. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.

The workflow checks types, publishing rules, and browser behavior before deployment. Pushes to `main` deploy; pull requests only validate. **Actions → Website → Run workflow** triggers a manual deployment. The workflow uses GitHub’s Pages artifact and deployment actions; no personal access token is needed.

The site URL is configured in `astro.config.mjs` and `src/data/site.ts`; update both and `public/robots.txt` when adding a custom domain. Enable HTTPS in Pages settings once available. Check the deployment job and the live homepage, localized pages, and RSS before considering publication complete. Redeploy a previous known-good commit to roll back.

## Validation

```sh
npm run check
npm test
npx playwright install chromium
npm run test:site
```

`test:site` adds temporary posts to verify translations, draft/future exclusion, RSS, and sitemap behavior. It builds, runs browser checks, removes the fixtures, and rebuilds the clean site, including when a check fails. Screenshots are saved in `test-results/`. To check an existing production build without fixtures, run `npm run test:browser`.

Content was adapted from the supplied CV and public GitHub profile. There are no runtime API requests, tracking scripts, contact forms, or third-party fonts.
