// Static search index endpoint. Fetched lazily the first time the header
// search opens, so the ~64 topic rows never weigh down a normal page load.
import { buildSearchIndex } from '../data/search-index.js';

export async function GET() {
  const rows = await buildSearchIndex();
  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
