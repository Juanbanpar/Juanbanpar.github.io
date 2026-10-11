import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import staticSecurity from './scripts/static-security.mjs';

export default defineConfig({
  site: 'https://juanbanpar.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') }), staticSecurity()],
  security: {
    csp: {
      directives: [
        "default-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
      ],
      scriptDirective: { resources: [{ resource: "'none'", kind: 'attribute' }] },
      styleDirective: { resources: [{ resource: "'none'", kind: 'attribute' }] },
    },
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
});
