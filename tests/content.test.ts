import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languages, pathFor } from '../src/lib/i18n.ts';
import { postLanguages, postPath, publicWriting, type WritingEntry } from '../src/lib/writing.ts';

const now = new Date('2026-10-06T12:00:00Z');
const entry = (id: string, data: Partial<WritingEntry['data']> = {}): WritingEntry => ({
  id, data: { title: id, description: 'Summary', date: '2026-10-06', language: 'en', kind: 'article', draft: false, ...data },
});

test('publishing excludes drafts and future dates, includes today, and sorts newest first', () => {
  const entries = [entry('older', { date: '2026-10-01' }), entry('draft', { draft: true }), entry('future', { date: '2026-10-07' }), entry('today')];
  assert.deepEqual(publicWriting(entries, now).map((item) => item.id), ['today', 'older']);
});

test('localized post URLs use the filename and the entry language', () => {
  assert.equal(postPath(entry('en/my-post')), '/writing/my-post/');
  assert.equal(postPath(entry('gl/un-artigo', { language: 'gl' })), '/gl/writing/un-artigo/');
  assert.equal(postPath(entry('es/un-articulo', { language: 'es' })), '/es/writing/un-articulo/');
  assert.deepEqual(languages.map((language) => pathFor(language)), ['/', '/gl/', '/es/']);
});

test('language switches use actual translated slugs and explicit archive fallbacks', () => {
  const english = entry('en/trust', { translationGroup: 'trust' });
  const galician = entry('gl/confianza', { language: 'gl', translationGroup: 'trust' });
  const hiddenSpanish = entry('es/confianza', { language: 'es', translationGroup: 'trust', draft: true });
  const publicEntries = publicWriting([english, galician, hiddenSpanish], now);
  assert.deepEqual(postLanguages(english, publicEntries).map(({ href, translated }) => ({ href, translated })), [
    { href: '/writing/trust/', translated: true },
    { href: '/gl/writing/confianza/', translated: true },
    { href: '/es/writing/', translated: false },
  ]);
});

test('unrelated posts are never presented as translations', () => {
  const english = entry('en/trust');
  const galician = entry('gl/trust', { language: 'gl' });
  assert.equal(postLanguages(english, [english, galician])[1].translated, false);
});

test('duplicate URLs and duplicate language translations fail instead of overwriting content', () => {
  assert.throws(() => publicWriting([entry('en/trust'), entry('other/trust')], now), /Duplicate writing URL/);
  assert.throws(() => publicWriting([entry('en/trust', { translationGroup: 'trust' }), entry('en/another', { translationGroup: 'trust' })], now), /Duplicate translation/);
});
