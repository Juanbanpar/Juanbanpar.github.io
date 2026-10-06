import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const directory = new URL('../src/content/writing/__checks__/', import.meta.url);
const run = (args, env = {}) => {
  const result = spawnSync('npm', args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (${result.status})`);
};

// Exclusive directory creation prevents accidental replacement of existing content.
await mkdir(directory);
let failed = false;
try {
  const fixtures = [
    { slug: 'check-english', language: 'en', group: 'check', date: '2020-01-02', draft: false },
    { slug: 'check-galician', language: 'gl', group: 'check', date: '2020-01-01', draft: false },
    { slug: 'check-draft', language: 'es', group: 'check', date: '2020-01-03', draft: true },
    { slug: 'check-future', language: 'es', date: '9999-01-01', draft: false },
  ];
  for (const fixture of fixtures) {
    await writeFile(new URL(`${fixture.slug}.md`, directory), `---\ntitle: "A long article title about cryptography, remote attestation, and the systems that connect them"\ndescription: "Temporary fixture for the publishing checks."\ndate: "${fixture.date}"\nlanguage: ${fixture.language}\nkind: note\ndraft: ${fixture.draft}\n${fixture.group ? `translationGroup: ${fixture.group}\n` : ''}---\n\n## Code and long lines\n\n\`\`\`rust\nfn main() { println!("${'long code line '.repeat(18)}"); }\n\`\`\`\n\nA normal paragraph with **emphasis** and [a link](/work/).\n`);
  }
  run(['run', 'build']);
  const rss = await readFile('dist/rss.xml', 'utf8');
  const sitemapFiles = (await readdir('dist')).filter((file) => /^sitemap-\d+\.xml$/.test(file));
  const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(`dist/${file}`, 'utf8')))).join('\n');
  for (const path of ['/writing/check-english/', '/gl/writing/check-galician/']) {
    assert.ok(rss.includes(path), `Missing RSS entry: ${path}`);
    assert.ok(sitemap.includes(path), `Missing sitemap entry: ${path}`);
  }
  for (const hidden of ['check-draft', 'check-future', '/writing/example/']) {
    assert.ok(!rss.includes(hidden), `Hidden RSS entry: ${hidden}`);
    assert.ok(!sitemap.includes(hidden), `Hidden sitemap entry: ${hidden}`);
  }
  async function inspect(directory) {
    for (const file of await readdir(directory, { withFileTypes: true })) {
      const path = `${directory}/${file.name}`;
      if (file.isDirectory()) await inspect(path);
      else if (file.name.endsWith('.html')) {
        const html = await readFile(path, 'utf8');
        assert.ok(!/check-draft|check-future|A title for your first post/.test(html), `Hidden content in ${path}`);
        for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
          const target = decodeURIComponent(match[1]);
          const local = target.endsWith('/') ? `dist${target}index.html` : `dist${target}`;
          await readFile(local).catch(() => { throw new Error(`Broken local link ${target} in ${path}`); });
        }
      }
    }
  }
  await inspect('dist');
  run(['run', 'test:browser'], { SITE_FIXTURES: '1' });
} catch (error) {
  console.error(error);
  failed = true;
} finally {
  await rm(directory, { recursive: true });
  try { run(['run', 'build']); } catch (error) { console.error(error); failed = true; }
}
if (failed) process.exitCode = 1;
