import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';

// Source locations let the build edit tags without reserializing script contents.
export function htmlElements(html) {
  const elements = [];
  function visit(node) {
    if (node.tagName && node.sourceCodeLocation) {
      elements.push({
        tagName: node.tagName,
        attributes: Object.fromEntries(node.attrs.map(({ name, value }) => [name, value])),
        location: node.sourceCodeLocation,
        inHead: node.parentNode?.tagName === 'head',
        text: (node.childNodes ?? []).map((child) => child.value ?? '').join(''),
      });
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parse(html, { sourceCodeLocationInfo: true }));
  return elements.sort((a, b) => a.location.startOffset - b.location.startOffset);
}

export function bundledAssetPath({ tagName, attributes }) {
  let path;
  if (tagName === 'script') path = attributes.src;
  else if (tagName === 'link' && attributes.rel?.toLowerCase().split(/\s+/).includes('stylesheet')) path = attributes.href;
  return path?.startsWith('/_astro/') ? path.split(/[?#]/, 1)[0] : undefined;
}

export async function verifyHtmlSecurity(html, path, readAsset) {
  const elements = htmlElements(html);
  const policies = elements.filter((element) => element.inHead && element.tagName === 'meta'
    && element.attributes['http-equiv']?.toLowerCase() === 'content-security-policy');
  assert.equal(policies.length, 1, `Expected one CSP in ${path}`);
  const policy = policies[0];
  const content = policy.attributes.content;
  assert.ok(content, `Missing CSP content in ${path}`);
  assert.ok(!/unsafe-inline|unsafe-eval/.test(content), `Unsafe CSP in ${path}`);
  const directives = new Map();
  for (const directive of content.split(';')) {
    const [name, ...sources] = directive.trim().split(/\s+/);
    if (!directives.has(name.toLowerCase())) directives.set(name.toLowerCase(), sources);
  }
  const scriptSources = directives.get('script-src-elem') ?? directives.get('script-src') ?? directives.get('default-src') ?? [];
  for (const element of elements) {
    const asset = bundledAssetPath(element);
    if (element.tagName === 'script' || asset) {
      assert.ok(policy.location.endOffset <= element.location.startOffset, `CSP must precede scripts and assets in ${path}`);
    }
    if (element.tagName === 'script' && !Object.hasOwn(element.attributes, 'src')) {
      const hash = `sha256-${createHash('sha256').update(element.text).digest('base64')}`;
      assert.ok(scriptSources.includes(`'${hash}'`), `Missing inline script hash in ${path}`);
    }
    if (asset) {
      const hash = `sha384-${createHash('sha384').update(await readAsset(asset)).digest('base64')}`;
      assert.equal(element.attributes.integrity, hash, `Incorrect SRI in ${path}`);
      assert.equal(element.attributes.crossorigin, 'anonymous', `Incorrect crossorigin in ${path}`);
    }
  }
  return elements;
}
