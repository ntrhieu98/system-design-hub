#!/usr/bin/env node
/**
 * One-off migration: turn assets/js/content/N.js (the old renderer's payload)
 * into src/content/topics/module-N/<sectionId>.mdx plus the module-level
 * extras (keywords + quiz) that the old module page showed below the lessons.
 *
 * The converter is deliberately dumb: it does not rewrite prose, reorder
 * anything, or drop markup. The only transformations are the ones MDX forces:
 *   - `{` / `}` become numeric entities (MDX would read them as JS expressions)
 *   - `<br>` becomes `<br />`
 *   - HTML comments are dropped (they never render, and MDX has no HTML comment
 *     syntax — keeping them as `{/* *\/}` leaked the comment text onto the page)
 * Everything else is copied byte for byte.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/content/topics');
const DATA = path.join(ROOT, 'src/data');

global.window = {};
const CONTENT = {};
for (let i = 0; i < 8; i++) {
  require(path.join(ROOT, 'legacy/assets/js/content', `${i}.js`));
  CONTENT[i] = global.window.SD_CONTENT[i];
}

/** Strip tags so we can build a plain-text description out of a section. */
const plain = (html) =>
  html
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<div class="codeblock"[\s\S]*?<\/div>\s*<\/div>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/\s+/g, ' ')
    // Tag stripping leaves a space before punctuation ("chung ." → "chung.").
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();

/**
 * One-sentence summary for the frontmatter `description`, which drives the
 * topic card, the page lead and <meta name="description">.
 *
 * The opening <p> of a section is prose written to introduce the topic, so it
 * is the right source. Using the whole section instead pulls in diagram
 * captions and callout text, which produced leads like
 * "…quan trọng hơn thuộc tên. Hình 1.2 — 12 bước mở rộng của Alex Xu. Đây cũng…"
 * — a caption spliced onto a sentence and then chopped mid-clause.
 *
 * Whole sentences are accumulated until the budget is spent, so the result
 * always ends on a sentence boundary. The first sentence is always kept even
 * when it alone exceeds the budget (the longest in this course is 192 chars);
 * HARD_MAX only guards against a future run-on paragraph.
 */
const DESC_MAX = 180;
const DESC_HARD_MAX = 240;

/**
 * Split text into sentences without a regular expression.
 *
 * A regex cannot do this correctly here: `10.000` looks like a sentence end,
 * and `?".` has the terminator wrapped in a quote before the real full stop.
 * Both cases produced broken leads ("000 lần. Điểm khác biệt…" and
 * `". Nghe đơn giản…`) because the splitter started the sentence after the
 * misread terminator and silently dropped the words before it.
 */
function sentencesOf(text) {
  const out = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;

    const prev = text[i - 1] ?? '';
    const next = text[i + 1];

    // 10.000 / v1.2 / 99.9% — a dot between digits is not a sentence end.
    if (c === '.' && /\d/.test(prev) && /\d/.test(next ?? '')) continue;
    // Only a terminator followed by whitespace (or the end) closes a sentence.
    if (next !== undefined && !/\s/.test(next)) continue;

    // Pull trailing closing quotes/brackets into the sentence they close.
    let end = i + 1;
    while (end < text.length && /["'”’)\]]/.test(text[end])) end++;
    out.push(text.slice(start, end).trim());
    start = end;
    i = end - 1;
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out.filter(Boolean);
}

function describe(html, title) {
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const text = plain(firstP ? firstP[1] : html);
  if (!text) return title;

  const sentences = sentencesOf(text);

  let out = '';
  for (const s of sentences) {
    const next = (out ? out + ' ' : '') + s;
    // A single short opener reads badly as a card subtitle, so allow a second
    // sentence to push past DESC_MAX — but never past the hard cap.
    const budget = out && out.length < 80 ? DESC_HARD_MAX : DESC_MAX;
    if (out && next.length > budget) break;
    if (next.length > DESC_HARD_MAX) break;
    out = next;
  }

  // A single run-on sentence longer than the hard cap: cut at a word boundary.
  if (out.length > DESC_HARD_MAX) {
    out = out.slice(0, DESC_HARD_MAX - 3);
    const cut = out.lastIndexOf(' ');
    if (cut > 80) out = out.slice(0, cut);
    out = out.replace(/[\s,;:—-]+$/, '') + '…';
  }
  return out;
}

/**
 * MDX-safe body.
 *
 * Two characters would change meaning and are entity-encoded instead:
 *   `{` / `}` — MDX reads them as JSX expressions
 *   newlines inside <pre> — a blank line ends the HTML block, so the code
 *     sample gets parsed as markdown and the <code> tag is reported as
 *     unclosed. Joining the block onto one physical line with &#10; keeps the
 *     newlines in the rendered output while keeping MDX happy.
 */
function mdxSafe(html) {
  return html
    // Comments never render in HTML, and MDX has no HTML-comment syntax. Turning
    // them into `{/* *\/}` and then entity-encoding the braces (the next line)
    // put the comment text on the page as body copy. Drop them instead.
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/g, '<br />')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/(<pre>[\s\S]*?<\/pre>)/g, (block) =>
      balanceSpans(block)
        // ASCII art and comparisons inside code samples ("A < B", "<--- ServerHello")
        // are literal text. MDX would try to read them as the start of a tag.
        .replace(/<(?![a-zA-Z/!?])/g, '&lt;')
        .replace(/\n/g, '&#10;')
    );
}

/**
 * A browser silently auto-closes a stray <span>; MDX refuses to compile it.
 * The old content has one such span inside a code sample (module 3, cdc).
 * Closing it here produces byte-identical rendered HTML in a browser and
 * keeps the MDX compiler happy, without editing the lesson text.
 */
const repaired = [];
function balanceSpans(block) {
  const opens = (block.match(/<span[^>]*>/g) || []).length;
  const closes = (block.match(/<\/span>/g) || []).length;
  if (opens === closes) return block;
  if (opens > closes) {
    repaired.push(`auto-closed ${opens - closes} <span> in a <pre> block`);
    return block.replace(/<\/code>/, '</span>'.repeat(opens - closes) + '</code>');
  }
  // More closing tags than opening ones: drop the extras at the end.
  repaired.push(`dropped ${closes - opens} stray </span> in a <pre> block`);
  return block.replace(/(<\/span>)+(?=<\/code>)/, '');
}

const yamlStr = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

const extras = {};
let fileCount = 0;

for (let m = 0; m < 8; m++) {
  const mod = CONTENT[m];
  const dir = path.join(OUT, `module-${m}`);
  fs.mkdirSync(dir, { recursive: true });

  mod.sections.forEach((section, idx) => {
    const order = idx + 1;
    const fm = [
      '---',
      `title: ${yamlStr(section.title)}`,
      `description: ${yamlStr(describe(section.html, section.title))}`,
      `module: ${m}`,
      `order: ${order}`,
      `num: ${yamlStr(section.num)}`,
      `sectionId: ${yamlStr(section.id)}`,
      '---',
      '',
    ].join('\n');

    const file = path.join(dir, `${section.id}.mdx`);
    fs.writeFileSync(file, fm + mdxSafe(section.html).trim() + '\n');
    fileCount++;
  });

  extras[m] = { keywords: mod.keywords || [], quiz: mod.quiz || [] };
}

const extrasSrc =
  '// Module-level extras that belong to a whole module rather than a single\n' +
  '// topic: the keyword glossary and the self-check quiz. They are kept out of\n' +
  '// the MDX files because every topic file is meant to be one lesson, not a\n' +
  '// dumping ground. `scripts/check-stats.mjs` counts these lists against\n' +
  '// src/data/stats.json so the published numbers cannot drift.\n' +
  'export const MODULE_EXTRAS = ' +
  JSON.stringify(extras, null, 2) +
  ';\n';
fs.writeFileSync(path.join(DATA, 'module-extras.js'), extrasSrc);

if (repaired.length) console.log("repaired:", repaired.join("; "));
console.log(`wrote ${fileCount} topic files`);
for (const [m, e] of Object.entries(extras)) {
  console.log(`  module ${m}: ${e.keywords.length} keywords, ${e.quiz.length} quiz`);
}
