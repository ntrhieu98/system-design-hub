// Everything that reads the topic collection lives here, so pages never
// re-implement "which topics belong to module 3, in what order".
import { getCollection } from 'astro:content';
import { MODULES } from '../data/modules.js';
import { MODULE_EXTRAS } from '../data/module-extras.js';

/**
 * All topics grouped by module id, each group sorted by the `order`
 * frontmatter field. The sidebar and prev/next links read this, which is why
 * no hand-written topic list exists anywhere in the repo.
 */
export async function getModulesWithTopics() {
  const all = await getCollection('topics');

  return MODULES.map((meta) => {
    const topics = all
      .filter((t) => t.data.module === meta.id)
      .sort((a, b) => a.data.order - b.data.order)
      .map((t) => ({
        slug: t.id.split('/').pop(),
        entry: t,
        title: t.data.title,
        description: t.data.description,
        num: t.data.num,
        sectionId: t.data.sectionId,
        order: t.data.order,
        module: t.data.module,
      }));

    return { meta, topics };
  });
}

/** Flat list of every topic in course order — used for prev/next across modules. */
export async function getFlatTopics() {
  const groups = await getModulesWithTopics();
  return groups.flatMap((g) =>
    g.topics.map((t, i) => ({
      ...t,
      isFirstInModule: i === 0,
      isLastInModule: i === g.topics.length - 1,
      moduleMeta: g.meta,
    }))
  );
}

/**
 * Reading time from the rendered body: 200 words per minute is the usual
 * Vietnamese reading pace for technical prose, rounded up.
 */
export function readingTime(body, override) {
  if (override) return override;
  const words = body
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Keywords + quiz for a whole module (kept out of individual topic files). */
export function moduleExtras(moduleId) {
  return MODULE_EXTRAS[moduleId] ?? { keywords: [], quiz: [] };
}

/** URL helpers so every link agrees on the trailing-slash shape. */
export const topicUrl = (moduleId, slug) => `/modules/${moduleId}/${slug}`;
export const moduleUrl = (moduleId) => `/modules/${moduleId}`;

/** @typedef {{ term: string, def: string }} Keyword */
