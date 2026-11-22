// Client behaviours ported from the old assets/js/app.js: theme toggle, mobile
// menu, quiz reveal, code copy, reading position, TOC scrollspy, module search
// and the "done" checkbox. Astro renders the markup; this file only wires the
// interactions, so it stays framework-free.

const STORE = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('sd:' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('sd:' + key, JSON.stringify(value));
    } catch {
      /* private mode: progress is a nicety, never break the page for it */
    }
  },
};

/* ---------------- Theme ---------------- */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const current = document.documentElement.getAttribute('data-theme');
  btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    STORE.set('theme', next);
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  });
}

/* ---------------- Mobile menu ---------------- */
function initMenu() {
  const btn = document.getElementById('menuToggle');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
  });

  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------------- Quiz reveal ---------------- */
function initQuiz() {
  document.querySelectorAll('.quiz-reveal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      if (!answer) return;
      const open = answer.classList.toggle('is-open');
      btn.textContent = open ? 'Ẩn đáp án ▲' : 'Xem đáp án ▼';
    });
  });
}

/* ---------------- Code copy ---------------- */
function initCopy() {
  document.querySelectorAll('.codeblock-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const block = btn.closest('.codeblock');
      const code = block?.querySelector('pre code, pre');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        const original = btn.textContent;
        btn.textContent = 'Đã copy ✓';
        btn.classList.add('is-copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('is-copied');
        }, 1600);
      } catch {
        btn.textContent = 'Copy lỗi';
      }
    });
  });
}

/* ---------------- Reading position + TOC scrollspy ---------------- */
function initScrollUX() {
  const bar = document.querySelector('.progress-bar');
  const toc = document.querySelector('.toc');
  const links = toc ? [...toc.querySelectorAll('a[href^="#"]')] : [];
  const targets = links
    .map((a) => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      return el ? { link: a, el } : null;
    })
    .filter(Boolean);

  let queued = false;
  const update = () => {
    queued = false;

    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : '0%';
    }

    if (!targets.length) return;
    let active = targets[0];
    for (const t of targets) {
      if (t.el.getBoundingClientRect().top <= 140) active = t;
    }
    for (const t of targets) t.link.classList.toggle('is-active', t === active);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---------------- Mobile table of contents ----------------
 * Under 1100px the course sidebar is hidden and the lesson has no other
 * in-page navigation, so a reader who wants to jump between sections had to
 * scroll the whole article. The sections are authored HTML without ids, so the
 * list is built here from the lesson's own headings.
 */
function initMobileToc() {
  const box = document.querySelector('.toc-mobile');
  if (!box) return;
  const group = box.querySelector('[data-toc-headings]');
  const list = group?.querySelector('.toc-mobile-list');
  const lesson = document.querySelector('.lesson');
  if (!group || !list || !lesson) return;

  const headings = [...lesson.querySelectorAll('h3')].filter((h) => h.textContent.trim());
  if (headings.length < 2) {
    group.remove();
    return;
  }

  headings.forEach((h, i) => {
    if (!h.id) h.id = `sec-${i + 1}`;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();
    // Closing the panel on tap keeps the jump from hiding the target under it.
    a.addEventListener('click', () => {
      box.open = false;
    });
    li.append(a);
    list.append(li);
  });
  group.hidden = false;
}

/* ---------------- Module progress ("đã học") ---------------- */
function initProgress() {
  const done = STORE.get('done', {});

  document.querySelectorAll('[data-done-key]').forEach((btn) => {
    const key = btn.dataset.doneKey;
    if (done[key]) btn.classList.add('is-done');

    btn.addEventListener('click', () => {
      const state = STORE.get('done', {});
      state[key] = !state[key];
      STORE.set('done', state);
      btn.classList.toggle('is-done', !!state[key]);
      document.documentElement.dataset.progressTick = String(Date.now());
    });
  });

  // Badge on the module cards ("✓ đã học") is rendered server-side, so the
  // static HTML stays correct and only the labels refresh after a click.
  document.querySelectorAll('[data-progress-label]').forEach((el) => {
    const key = el.dataset.progressLabel;
    if (done[key]) el.textContent = '✓ đã học';
  });
}

/* ---------------- Old deep-link redirect ----------------
 * The static site rendered a whole module on one page, so links like
 * /modules/0/index.html#network pointed at an in-page anchor. The Astro build
 * gives every topic its own URL, so those links are translated here rather
 * than left to land on the top of the module overview.
 */
function initLegacyAnchors() {
  const hash = location.hash.replace('#', '');
  if (!hash) return;

  const node = document.getElementById(hash);
  if (node) return; // The anchor exists on this page; nothing to do.

  // Only module overview pages carry a topic list to resolve against.
  const map = document.querySelector('[data-topic-map]');
  if (!map) return;

  const target = map.dataset[hash] || JSON.parse(map.getAttribute('data-topic-map') || '{}')[hash];
  if (target) location.replace(target + location.hash);
}

/* ---------------- Module search + level filter ---------------- */
function initSearch() {
  const input = document.getElementById('moduleSearch');
  const cards = [...document.querySelectorAll('[data-module-card]')];
  const empty = document.getElementById('emptyState');
  const reset = document.getElementById('resetFilters');
  if (!cards.length) return;

  const filters = [...document.querySelectorAll('.filter-btn[data-level]')];
  let level = 'all';

  const norm = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const apply = () => {
    const q = norm((input?.value || '').trim());
    let shown = 0;

    for (const card of cards) {
      const haystack = norm(card.dataset.search || '');
      const okLevel = level === 'all' || norm(card.dataset.level || '') === level;
      const okText = !q || haystack.includes(q);
      const visible = okLevel && okText;
      card.classList.toggle('hidden', !visible);
      if (visible) shown++;
    }

    if (empty) empty.classList.toggle('hidden', shown > 0);
  };

  if (input) input.addEventListener('input', apply);

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      level = btn.dataset.level;
      filters.forEach((b) => b.classList.toggle('is-active', b === btn));
      apply();
    });
  });

  reset?.addEventListener('click', () => {
    level = 'all';
    if (input) input.value = '';
    filters.forEach((b) => b.classList.toggle('is-active', b.dataset.level === 'all'));
    apply();
  });
}

/* ---------------- Learning path state ----------------
 * The 12-week plan used to hardcode "Tuần 1–3 đã xong" and "Tuần 8 đang học"
 * for every visitor, which contradicted the progress saved in localStorage.
 * Each step declares the modules it covers; a step is done when all of them
 * are ticked, and the first unfinished step is the one the reader is on.
 */
function initPathStates() {
  const items = [...document.querySelectorAll('[data-step-modules]')];
  if (!items.length) return;

  const done = STORE.get('done', {});
  let marked = false;

  for (const item of items) {
    const mods = (item.dataset.stepModules || '')
      .split(',')
      .filter(Boolean)
      .map(Number);
    const complete = mods.length > 0 && mods.every((id) => done['m' + id]);

    item.classList.remove('done', 'now');
    item.querySelector('.tl-now')?.remove();

    if (complete) {
      item.classList.add('done');
      continue;
    }
    if (marked) continue;
    marked = true;
    item.classList.add('now');

    const label = document.createElement('span');
    label.className = 'tl-now';
    label.textContent = 'Đang ở đây';
    item.querySelector('.tl-week')?.append(label);
  }
}

function boot() {
  initTheme();
  initMenu();
  initQuiz();
  initCopy();
  initScrollUX();
  initMobileToc();
  initProgress();
  initPathStates();
  initSearch();
  initSiteSearch();
  initLegacyAnchors();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/**
 * Site-wide search. The index is a static JSON file covering all topics and
 * keywords, fetched once on first open. The module-list search box on
 * /modules stays as it was: it filters cards in place, which is the right
 * behaviour there and is cheaper than navigating to a result page.
 */
function initSiteSearch() {
  const overlay = document.getElementById('searchOverlay');
  const toggle = document.getElementById('searchToggle');
  if (!overlay || !toggle) return;

  const input = document.getElementById('siteSearchInput');
  const results = document.getElementById('searchResults');
  const empty = document.getElementById('searchEmpty');
  const close = document.getElementById('searchClose');
  const indexUrl = overlay.dataset.indexUrl;
  // Index rows carry site-root paths (/modules/3/x); the deploy base has to be
  // prepended or every hit 404s on GitHub Pages.
  const base = (overlay.dataset.base || '/').replace(/\/$/, '');

  let rows = null;
  let loading = null;
  let active = -1;
  let hits = [];

  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const load = () => {
    if (rows) return Promise.resolve(rows);
    if (!loading) {
      loading = fetch(indexUrl)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => (rows = Array.isArray(data) ? data : []))
        .catch(() => (rows = []));
    }
    return loading;
  };

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const render = () => {
    const q = norm(input.value.trim());
    active = -1;

    if (!q) {
      hits = [];
      results.innerHTML = '';
      empty.hidden = true;
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);
    hits = rows
      .map((r) => {
        const title = norm(r.title);
        const text = norm(r.text);
        let score = 0;
        for (const t of terms) {
          if (title.includes(t)) score += 10;
          if (title.startsWith(t)) score += 10;
          if (text.includes(t)) score += 3;
        }
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.r.title.length - b.r.title.length)
      .slice(0, 24)
      .map((x) => x.r);

    if (hits.length === 0) {
      results.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    results.innerHTML = hits
      .map(
        (r, i) => `
        <a class="search-hit" href="${esc(base + r.url)}" data-hit="${i}" role="option">
          <span class="search-hit-badge">${
            r.type === 'keyword'
              ? 'Từ khoá'
              : r.type === 'reference'
                ? 'Nguồn'
                : 'M' + r.num.split('.')[0] + ' · §' + r.num
          }</span>
          <span class="search-hit-body">
            <span class="search-hit-title">${esc(r.title)}</span>
            <span class="search-hit-desc">${esc(r.desc)}</span>
          </span>
          <span class="search-hit-go">${
            r.type === 'keyword' ? 'Module ' + r.module : r.type === 'reference' ? 'Tham khảo' : 'Chủ đề'
          }</span>
        </a>`
      )
      .join('');

    // Typing a query is a strong signal the user wants the first hit: enter
    // opens it without requiring arrow keys first.
    active = 0;
    markActive();
  };

  const markActive = () => {
    const nodes = results.querySelectorAll('.search-hit');
    nodes.forEach((n, i) => n.classList.toggle('is-active', i === active));
    nodes[active]?.scrollIntoView({ block: 'nearest' });
  };

  const open = () => {
    overlay.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('search-open');
    input.value = '';
    results.innerHTML = '';
    empty.hidden = true;
    load();
    setTimeout(() => input.focus(), 20);
  };

  const shut = () => {
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('search-open');
  };

  toggle.addEventListener('click', () => (overlay.hidden ? open() : shut()));
  close.addEventListener('click', shut);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) shut();
  });

  input.addEventListener('input', () => {
    if (!rows) load().then(render);
    else render();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.hidden ? open() : shut();
      return;
    }
    if (overlay.hidden) return;
    if (e.key === 'Escape') {
      shut();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (hits.length === 0) return;
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      markActive();
      return;
    }
    if (e.key === 'Enter' && hits[active]) {
      e.preventDefault();
      // Same base prefix as the rendered href: the index stores site-root
      // paths, so navigating without it 404s on a project-page deploy.
      location.href = base + hits[active].url;
    }
  });
}
