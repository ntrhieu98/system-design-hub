// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { wrapTables } from './src/lib/wrap-tables.js';

// Deploy as a GitHub Pages project site:
// https://ntrhieu98.github.io/system-design-hub/
// `base` must stay in sync with the repository name, otherwise every asset and
// internal link resolves one level too high and the site 404s.
export default defineConfig({
  site: 'https://ntrhieu98.github.io',
  base: '/system-design-hub',
  trailingSlash: 'ignore',
  build: {
    // Emit `modules/0/network/index.html` rather than `modules/0/network.html`,
    // so the URLs keep the same shape as the static site they replace.
    format: 'directory',
  },
  // smartPunctuation would rewrite the straight quotes inside code samples and
  // prose into curly ones, silently changing the published text. The content
  // is Vietnamese technical copy where " is meaningful, so it stays off.
  markdown: {
    processor: satteri({
      features: { smartPunctuation: false },
      // Markdown pipe tables arrive as a bare <table>; without the scroll
      // frame a wide table pushes the whole page wider than the viewport.
      hastPlugins: [wrapTables],
    }),
  },
  integrations: [mdx()],
});
