import { languageNames, languages, pathFor, type Language } from './i18n';

export type WritingEntry = {
  id: string;
  data: {
    title: string; description: string; date: string; language: Language;
    kind: 'article' | 'note'; draft: boolean; translationGroup?: string;
  };
};

export function postPath(entry: WritingEntry): string {
  // The directory is organizational; the filename is the permanent URL slug.
  const slug = entry.id.split('/').at(-1)!;
  return `${pathFor(entry.data.language, 'writing')}${slug}/`;
}

export function publicWriting<T extends WritingEntry>(entries: T[], now = new Date()): T[] {
  const today = now.toISOString().slice(0, 10);
  const published = entries.filter((entry) => !entry.data.draft && entry.data.date <= today);
  const paths = new Set<string>();
  const translations = new Set<string>();
  for (const entry of published) {
    const path = postPath(entry);
    if (paths.has(path)) throw new Error(`Duplicate writing URL: ${path}`);
    paths.add(path);
    if (entry.data.translationGroup) {
      const key = `${entry.data.translationGroup}:${entry.data.language}`;
      if (translations.has(key)) throw new Error(`Duplicate translation: ${key}`);
      translations.add(key);
    }
  }
  return published.sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function postLanguages(entry: WritingEntry, entries: WritingEntry[]) {
  return languages.map((language) => {
    const translated = language === entry.data.language ? entry : entry.data.translationGroup
      ? entries.find((candidate) => candidate.data.translationGroup === entry.data.translationGroup && candidate.data.language === language)
      : undefined;
    return {
      language,
      label: languageNames[language],
      href: translated ? postPath(translated) : pathFor(language, 'writing'),
      translated: Boolean(translated),
    };
  });
}

export function formatDate(date: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
