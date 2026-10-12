import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { htmlElements, verifyHtmlSecurity } from '../scripts/html-security.mjs';
import staticSecurity from '../scripts/static-security.mjs';

const assets = { '/_astro/app.js': 'console.log("asset");', '/_astro/app.css': 'body { color: black; }' };
const hash = (algorithm, text) => `${algorithm}-${createHash(algorithm).update(text).digest('base64')}`;
const policy = (content = "default-src 'none'") => `<META CONTENT="${content}" HTTP-EQUIV='Content-Security-Policy'>`;
const document = (head) => `<!doctype html><html><head><META CHARSET=utf-8>${head}</head><body></body></html>`;

async function secureHtml(t, html) {
  const directory = await mkdtemp(join(tmpdir(), 'site-security-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const dir = pathToFileURL(`${directory}/`);
  await mkdir(new URL('_astro/', dir));
  for (const [path, bytes] of Object.entries(assets)) await writeFile(new URL(`.${path}`, dir), bytes);
  const page = new URL('index.html', dir);
  await writeFile(page, html);
  const build = () => staticSecurity().hooks['astro:build:done']({ dir });
  await build();
  return { html: await readFile(page, 'utf8'), page, build };
}

test('build signs mixed-case assets with varied attributes and preserves inline script bytes', async (t) => {
  const inline = 'const text = "<SCRIPT SRC=\'/_astro/missing.js\'> > &";\nconsole.log(text);';
  const html = document([
    '<SCRIPT DATA-label="a > b" SRC=/_astro/app.js></SCRIPT>',
    '<Script crossorigin=use-credentials src="/_astro/app.js?v=1#module"></sCrIpT>',
    "<LINK HREF='/_astro/app&#46;css?v=1' REL='alternate StyleSheet' />",
    `<ScRiPt type='module' data-label='a > b'>${inline}</SCRIPT foo='bar'>`,
    policy(`default-src 'none'; script-src '${hash('sha256', inline)}'`),
  ].join(''));
  const result = await secureHtml(t, html);
  assert.ok(result.html.includes(`<ScRiPt type='module' data-label='a > b'>${inline}</SCRIPT foo='bar'>`));
  assert.ok(result.html.includes('<META CHARSET=utf-8>' + policy(`default-src 'none'; script-src '${hash('sha256', inline)}'`)));
  const elements = await verifyHtmlSecurity(result.html, 'fixture', (path) => assets[path]);
  const signed = elements.filter((element) => element.attributes.integrity);
  assert.equal(signed.length, 3);
  assert.equal(signed[0].attributes.integrity, hash('sha384', assets['/_astro/app.js']));
  assert.equal(signed[1].attributes.crossorigin, 'anonymous');
  assert.equal(signed[2].attributes.integrity, hash('sha384', assets['/_astro/app.css']));
  await result.build();
  assert.equal(await readFile(result.page, 'utf8'), result.html, 'A second build must leave the secured HTML unchanged');
});

test('build leaves tag-like text in comments, styles and inert templates unchanged', async (t) => {
  const content = [
    '<!-- <script src="/_astro/missing.js"></script> -->',
    '<style>body::after { content: "<script src=/_astro/missing.js>"; }</style>',
    '<template><script src="/_astro/missing.js"></script></template>',
  ].join('');
  const html = document(policy() + content);
  const result = await secureHtml(t, html);
  assert.equal(result.html, html);
  await verifyHtmlSecurity(result.html, 'fixture', () => assert.fail('Inert text must not be treated as an asset'));
});

test('inline-script checks reject missing hashes for browser-accepted tag variants', async (t) => {
  const inline = 'console.log("inline");';
  for (const tag of [
    `<SCRIPT>${inline}</SCRIPT>`,
    `<script data-label="a > b">${inline}</script>`,
    `<script>${inline}</script foo="bar">`,
  ]) {
    await t.test(tag, async () => {
      await assert.rejects(verifyHtmlSecurity(document(policy() + tag), 'fixture', () => assert.fail()), /Missing inline script hash/);
      await verifyHtmlSecurity(document(policy(`script-src '${hash('sha256', inline)}';`) + tag), 'fixture', () => assert.fail());
    });
  }
});

test('inline-script checks hash browser-normalized line endings', async () => {
  const inline = 'console.log("first");\r\nconsole.log("second");';
  await verifyHtmlSecurity(document(policy(`script-src '${hash('sha256', inline.replaceAll('\r\n', '\n'))}'`)
    + `<script>${inline}</script>`), 'fixture', () => assert.fail());
});

test('inline-script checks require the hash in the effective script directive', async () => {
  const inline = 'console.log("inline");';
  const token = `'${hash('sha256', inline)}'`;
  const script = `<script>${inline}</script>`;
  for (const content of [`default-src ${token};`, `script-src 'none'; script-src-elem ${token};`]) {
    await verifyHtmlSecurity(document(policy(content) + script), 'fixture', () => assert.fail());
  }
  for (const content of [`script-src 'none'; style-src ${token};`, `script-src ${token}; script-src-elem 'none';`,
    `script-src 'none'; script-src ${token};`]) {
    await assert.rejects(verifyHtmlSecurity(document(policy(content) + script), 'fixture', () => assert.fail()), /Missing inline script hash/);
  }
});

test('asset checks reject missing or incorrect integrity and crossorigin', async () => {
  for (const attributes of ['', 'integrity="sha384-wrong"', `integrity="${hash('sha384', assets['/_astro/app.js'])}" crossorigin="use-credentials"`]) {
    await assert.rejects(verifyHtmlSecurity(document(policy() + `<SCRIPT SRC=/_astro/app.js ${attributes}></SCRIPT>`),
      'fixture', (path) => assets[path]), /Incorrect SRI|Incorrect crossorigin/);
  }
});

test('CSP checks reject policies after scripts or stylesheets and unsafe directives', async () => {
  for (const tag of ['<SCRIPT SRC=/_astro/app.js></SCRIPT>', '<LINK REL=stylesheet HREF=/_astro/app.css>']) {
    await assert.rejects(verifyHtmlSecurity(document(tag + policy()), 'fixture', () => assert.fail()), /CSP must precede/);
  }
  await assert.rejects(verifyHtmlSecurity(document(policy("script-src 'unsafe-inline'")), 'fixture', () => assert.fail()), /Unsafe CSP/);
  await assert.rejects(verifyHtmlSecurity(document(policy() + policy()), 'fixture', () => assert.fail()), /Expected one CSP/);
});

test('build rejects missing CSP or charset and missing bundled assets', async (t) => {
  await assert.rejects(secureHtml(t, document('')), /Missing CSP or charset/);
  await assert.rejects(secureHtml(t, document(policy()).replace('<META CHARSET=utf-8>', '')), /Missing CSP or charset/);
  await assert.rejects(secureHtml(t, document(policy() + '<SCRIPT SRC=/_astro/missing.js></SCRIPT>')), /ENOENT/);
});

test('parser extracts actual local links with decoded entities and varied quoting', () => {
  const elements = htmlElements(document(policy()) + "<A HREF='/work/?a=1&amp;b=2'>Work</A><img SRC=/social.png>");
  assert.equal(elements.find((element) => element.tagName === 'a').attributes.href, '/work/?a=1&b=2');
  assert.equal(elements.find((element) => element.tagName === 'img').attributes.src, '/social.png');
});
