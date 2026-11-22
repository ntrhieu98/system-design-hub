// Markdown tables in the ADR, exercise and curriculum files are written as
// plain pipe tables, so they arrive as a bare <table>. The topic files wrap
// theirs in <div class="table-wrap"> by hand, and .table-wrap is what provides
// the horizontal scroll frame on mobile. Without it a 560px min-width table
// sticks out of a 358px column and widens the whole page.
//
// This hast plugin wraps every <table> that isn't already inside a
// .table-wrap, so both content styles end up with the same scrollable frame.

/** @type {import('@astrojs/markdown-satteri').HastPluginDefinition} */
export const wrapTables = {
  name: 'wrap-tables',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      // Wrap into a fresh div; `wrapNode` makes the table its first child.
      // Tables already inside .table-wrap are left alone — wrapping twice
      // would nest two scroll containers.
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [],
      });
    },
  },
};
