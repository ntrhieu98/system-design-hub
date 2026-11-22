// Build-time search index over every topic. Generated from the MDX collection
// so the header search can find a topic from any page without a backend and
// without shipping the whole course to the browser on first load.
import { getFlatTopics, moduleExtras } from '../lib/content.js';
import { REFERENCES } from './references.js';

const strip = (html) =>
  html
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function buildSearchIndex() {
  const topics = await getFlatTopics();
  const rows = [];

  for (const t of topics) {
    const body = strip(t.entry.body ?? '');
    rows.push({
      type: 'topic',
      id: `${t.module}/${t.slug}`,
      module: t.module,
      num: t.num,
      title: t.title,
      desc: t.description,
      url: `/modules/${t.module}/${t.slug}`,
      // Index the whole body. A 1600-char cap truncated 58 of 66 topics (the
      // median topic body is ~3,300 chars), so real words were unfindable —
      // searching "elasticsearch" missed the section that explains it. The
      // full index is ~289 KB raw / ~111 KB gzipped, and it is only fetched
      // when the reader opens search, so the cost is paid by the people who
      // actually search.
      text: body,
    });
  }

  // Keywords and quiz questions are per module, not per topic: index them as
  // module-level rows so searching "hotspot" or "quorum" still lands somewhere.
  for (const t of topics.filter((x) => x.isLastInModule)) {
    const extras = moduleExtras(t.module);
    for (const k of extras.keywords) {
      rows.push({
        type: 'keyword',
        id: `kw-${t.module}-${k.term}`,
        module: t.module,
        num: `${t.module}`,
        title: k.term,
        desc: strip(k.def),
        url: `/modules/${t.module}#keywords`,
        text: `${k.term} ${strip(k.def)}`,
      });
    }
  }

  // Reference sources: searching "alex xu" or "bytebytego" should land on the
  // page that actually hosts or links them.
  for (const r of REFERENCES) {
    rows.push({
      type: 'reference',
      id: `ref-${r.id}`,
      module: r.id,
      num: '',
      title: `${r.author} — ${r.title}`,
      desc: r.desc,
      url: '/references',
      text: `${r.author} ${r.title} ${r.kind} ${strip(r.desc)} ${strip(r.why)}`,
    });
  }

  return rows;
}
