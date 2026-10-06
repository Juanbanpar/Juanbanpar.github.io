import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const biography = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/biography' }),
  schema: z.object({ language: z.enum(['en', 'gl', 'es']) }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a quoted YYYY-MM-DD date').refine(
      (date) => !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date,
      'Use a valid calendar date',
    ),
    language: z.enum(['en', 'gl', 'es']),
    kind: z.enum(['article', 'note']).default('article'),
    translationGroup: z.string().min(1).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { biography, writing };
