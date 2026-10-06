import rss from '@astrojs/rss';
import { site } from '../data/site';
import { getPublicWriting } from '../lib/content';
import { postPath } from '../lib/writing';

export async function GET() {
  const entries = await getPublicWriting();
  return rss({
    title: `${site.name} · Writing`,
    description: 'Articles and notes by Juan Banga Pardo.',
    site: site.url,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: new Date(`${entry.data.date}T00:00:00Z`),
      link: postPath(entry),
    })),
  });
}
