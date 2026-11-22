import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every topic is one MDX file inside its module folder:
//   src/content/topics/module-3/5-replication.mdx
// The sidebar, the module pages and the standalone topic pages are all derived
// from these files, so adding a topic never requires editing a list by hand.
const topics = defineCollection({
  loader: glob({ pattern: 'module-*/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    // Required: the topic title shown in the hero, the sidebar, the TOC and the
    // prev/next pager. A glob loader only exposes fields declared here, so
    // leaving it out silently renders empty headings instead of failing.
    title: z.string().min(1),

    // Required: without a description the page has no SEO summary and no card
    // text, so the build must fail instead of shipping a half-blank page.
    description: z.string().min(1),

    // Required: the module this topic belongs to. Anything outside 0-7 means
    // the file sits in the wrong folder or the number was mistyped.
    module: z.number().int().min(0).max(7),

    // Order inside the module. Drives the sidebar and the prev/next links.
    order: z.number().int().positive(),

    // The h2 number shown in the section badge ("3.4").
    num: z.string().min(1),

    // Anchor id kept from the static site so old deep links (#replication)
    // still land on the right section.
    sectionId: z.string().min(1),

    // Reading time is computed from the body at build time; this is only an
    // optional override for topics that are heavy on diagrams.
    estimatedMinutes: z.number().int().positive().optional(),
  }),
});

// Architecture Decision Records. These were raw .md files served from /public,
// which meant a click dropped the reader out of the site shell entirely (no
// header, no sidebar, no way back). They are a collection now so they render
// through the normal layout.
const adrs = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/adr' }),
  schema: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    status: z.enum(['proposed', 'accepted', 'rejected', 'superseded']),
    date: z.string().min(1),
    // The one-line question this decision answers, used as the page lead and as
    // the card text on /adr.
    summary: z.string().min(1),
    tags: z.array(z.string()).default([]),
    // Which module the decision belongs to, so the page can link back.
    module: z.number().int().min(0).max(7).optional(),
    order: z.number().int().positive(),
  }),
});

// Practice exercises. Same reasoning as ADRs: a raw .md link lost the shell.
const exercises = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/exercises' }),
  schema: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    summary: z.string().min(1),
    // Free-form key/value rows shown in the spec grid ("QPS mục tiêu", "Độ trễ").
    specs: z
      .array(z.object({ k: z.string().min(1), v: z.string().min(1) }))
      .default([]),
    module: z.number().int().min(0).max(7).optional(),
    order: z.number().int().positive(),
  }),
});

// Standalone long-form pages (currently the full curriculum). Kept as a
// collection so it renders through the normal layout instead of dropping the
// reader onto a raw .md file outside the site shell.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().positive().default(1),
  }),
});

export const collections = { topics, adrs, exercises, pages };
