#!/usr/bin/env node
/**
 * Build-time guard for the shared numbers shown across the site.
 *
 * Astro will happily publish "64 chủ đề" while the folder holds 61 — nothing in
 * the framework knows those two facts are related. This script recomputes every
 * headline figure from the real files and fails the build when src/data/stats.js
 * no longer matches, so the copy cannot drift away from the content.
 *
 * Counts:
 *   topics    every module-N/*.mdx file
 *   diagrams  topics that contain at least one inline <svg> (the old site
 *             advertised "49 diagram", one per illustrated section — a section
 *             with two figures still counts once)
 *   keywords  entries in MODULE_EXTRAS[*].keywords
 *   quizzes   entries in MODULE_EXTRAS[*].quiz
 *   adrs      src/content/adr/*.mdx (the Vietnamese originals live here now;
 *             the page is rendered from this collection)
 *   exercises src/content/exercises/*.mdx
 *
 * Usage: node scripts/check-stats.mjs [--write]
 *   --write  rewrite src/data/stats.js from the measured numbers instead of
 *            failing (only for intentional content changes).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TOPICS = path.join(ROOT, 'src/content/topics');
const STATS_FILE = path.join(ROOT, 'src/data/stats.js');
const EXTRAS_FILE = path.join(ROOT, 'src/data/module-extras.js');
const WRITE = process.argv.includes('--write');

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function measure() {
  if (!fs.existsSync(TOPICS)) fail(`Không tìm thấy thư mục nội dung: ${TOPICS}`);

  const moduleDirs = fs
    .readdirSync(TOPICS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^module-\d+$/.test(d.name));

  let topics = 0;
  let diagrams = 0;

  for (const dir of moduleDirs) {
    const files = fs
      .readdirSync(path.join(TOPICS, dir.name))
      .filter((f) => f.endsWith('.mdx'));
    for (const f of files) {
      const body = fs.readFileSync(path.join(TOPICS, dir.name, f), 'utf8');
      topics += 1;
      if (/<svg[\s>]/.test(body)) diagrams += 1;
    }
  }

  const extrasSrc = fs.readFileSync(EXTRAS_FILE, 'utf8');
  const extras = JSON.parse(
    extrasSrc.slice(extrasSrc.indexOf('{'), extrasSrc.lastIndexOf('}') + 1)
  );
  const keywords = Object.values(extras).reduce((n, e) => n + (e.keywords?.length ?? 0), 0);
  const quizzes = Object.values(extras).reduce((n, e) => n + (e.quiz?.length ?? 0), 0);

  // The ADRs and exercises are content-collection entries now, so count the
  // source files they are rendered from (not the old public/ copies).
  const countMd = (dir) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md')).length
      : 0;
  const adrs = countMd(path.join(ROOT, 'src/content/adr'));
  const exercises = countMd(path.join(ROOT, 'src/content/exercises'));

  return {
    modules: moduleDirs.length,
    topics,
    diagrams,
    keywords,
    quizzes,
    adrs,
    exercises,
  };
}

const actual = measure();
const statsSrc = fs.readFileSync(STATS_FILE, 'utf8');

// stats.js is an ES module, so import it rather than slicing the object literal
// out of the file (unquoted keys are valid JS but not valid JSON).
const { SITE_STATS: declared } = await import(`file://${STATS_FILE}?t=${Date.now()}`);

const mismatches = Object.keys(actual).filter((k) => declared[k] !== actual[k]);

if (mismatches.length === 0) {
  console.log(`✓ Số liệu khớp nội dung thật: ${actual.topics} chủ đề, ${actual.diagrams} diagram, ${actual.keywords} từ khoá, ${actual.quizzes} quiz.`);
  process.exit(0);
}

if (!WRITE) {
  console.error('\n✗ Số liệu lệch khỏi nội dung thật:\n');
  for (const k of mismatches) {
    console.error(`    ${k}: src/data/stats.js ghi ${declared[k]}, nội dung thật là ${actual[k]}`);
  }
  console.error('\n  Sửa src/data/stats.js cho khớp, hoặc chạy: node scripts/check-stats.mjs --write\n');
  process.exit(1);
}

// --write: regenerate the file, keeping the explanatory header comment.
const header = statsSrc.slice(0, statsSrc.indexOf('export const SITE_STATS'));
const body = `export const SITE_STATS = ${JSON.stringify(
  { ...declared, ...actual },
  null,
  2
)};\n`;
fs.writeFileSync(STATS_FILE, header + body);
console.log(`✓ Đã ghi lại src/data/stats.js: ${actual.topics} chủ đề, ${actual.diagrams} diagram.`);
