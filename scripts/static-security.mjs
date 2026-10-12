import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { bundledAssetPath, htmlElements } from './html-security.mjs';

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
              const html = await readFile(file, 'utf8');
              const elements = htmlElements(html);
              const policy = elements.find((element) => element.inHead && element.tagName === 'meta'
                && element.attributes['http-equiv']?.toLowerCase() === 'content-security-policy');
              const charset = elements.find((element) => element.inHead && element.tagName === 'meta'
                && element.attributes.charset?.toLowerCase() === 'utf-8');
              if (!policy || !charset) throw new Error(`Missing CSP or charset in ${file}`);
              const edits = [];
              // Meta CSP only protects resources that appear after it.
              if (policy.location.startOffset !== charset.location.endOffset) {
                edits.push({ start: policy.location.startOffset, end: policy.location.endOffset, text: '' });
                edits.push({ start: charset.location.endOffset, end: charset.location.endOffset,
                  text: html.slice(policy.location.startOffset, policy.location.endOffset) });
              }
              for (const element of elements) {
                const path = bundledAssetPath(element);
                if (!path || Object.hasOwn(element.attributes, 'integrity')) continue;
                const start = element.location.startTag.startOffset + 1 + element.tagName.length;
                let attributes = ` integrity="${await integrity(path)}"`;
                if (Object.hasOwn(element.attributes, 'crossorigin')) {
                  const location = element.location.attrs.crossorigin;
                  edits.push({ start: location.startOffset, end: location.endOffset, text: 'crossorigin="anonymous"' });
                } else attributes += ' crossorigin="anonymous"';
                edits.push({ start, end: start, text: attributes });
              }
              // Applying edits backwards keeps every original source offset valid.
              let secured = html;
              for (const edit of edits.sort((a, b) => b.start - a.start)) {
                secured = secured.slice(0, edit.start) + edit.text + secured.slice(edit.end);
              }
              await writeFile(file, secured);
            }
          }
        }
        await visit(dir);
      },
    },
  };
}
