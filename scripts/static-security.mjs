import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';

// Astro has finished writing assets before this hook hashes their final bytes.
export default function staticSecurity() {
  return {
    name: 'static-security',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const hashes = new Map();
        async function integrity(path) {
          if (!hashes.has(path)) {
            const bytes = await readFile(new URL(`.${path}`, dir));
            hashes.set(path, `sha384-${createHash('sha384').update(bytes).digest('base64')}`);
          }
          return hashes.get(path);
        }
        async function visit(directory) {
          for (const entry of await readdir(directory, { withFileTypes: true })) {
            const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
            if (entry.isDirectory()) await visit(file);
            else if (entry.name.endsWith('.html')) {
              let html = await readFile(file, 'utf8');
              // Meta CSP only protects resources that appear after it.
              const policy = html.match(/<meta http-equiv="content-security-policy"[^>]*>/)?.[0];
              if (!policy || !html.includes('<meta charset="utf-8">')) throw new Error(`Missing CSP or charset in ${file}`);
              html = html.replace(policy, '').replace('<meta charset="utf-8">', `<meta charset="utf-8">${policy}`);
              for (const match of html.matchAll(/<(?:link|script)\b[^>]*>/g)) {
                const tag = match[0];
                if (!tag.startsWith('<script') && !/\brel="stylesheet"/.test(tag)) continue;
                const path = tag.match(/\b(?:src|href)="(\/_astro\/[^"?#]+)"/)?.[1];
                if (!path || /\bintegrity=/.test(tag)) continue;
                const signed = tag.replace(/\s*\/?>(?=$)/, ` integrity="${await integrity(path)}" crossorigin="anonymous">`);
                html = html.replace(tag, signed);
              }
              await writeFile(file, html);
            }
          }
        }
        await visit(dir);
      },
    },
  };
}
