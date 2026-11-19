/* ==========================================================================
   System Design Hub — App shell & behaviors
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Icons ---------------- */
  const I = {
    logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    git: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>'
  };

  /* ---------------- Module registry ---------------- */
  const MODULES = [
    {
      id: 0, slug: '0', icon: I.cpu, color: 'var(--cyan)', badge: 'Nền tảng', level: 'Beginner',
      title: 'Kiến thức nền tảng',
      short: 'Prerequisites',
      desc: 'Mạng máy tính, hệ điều hành, cơ sở dữ liệu và những khái niệm phân tán cơ bản nhất — bắt buộc trước khi thiết kế hệ thống.',
      topics: ['OSI & TCP/IP', 'DNS/CDN/TLS', 'Process & Thread', 'ACID & Index', 'CAP & PACELC'],
      time: '2 tuần', sections: 8,
      tags: ['osi','tcp','udp','dns','tls','http','https','tls','thread','process','acid','index','cap','pacelc','cache','b-tree','latency','rest','grpc','websocket','ip','subnet','load balancer','cdn','cors']
    },
    {
      id: 1, slug: '1', icon: I.target, color: 'var(--yellow)', badge: 'Phương pháp', level: 'Beginner',
      title: 'Nền tảng System Design',
      short: 'Foundations',
      desc: 'Khung 5 bước trả lời mọi bài toán thiết kế, cách hỏi yêu cầu, ước lượng back-of-envelope và đọc chỉ số độ trễ.',
      topics: ['4-Step Framework', 'NFR', 'Back-of-envelope', 'Latency vs Throughput', 'URL Shortener'],
      time: '2 tuần', sections: 7,
      tags: ['framework','requirements','nfr','estimation','qps','latency','throughput','availability','sla','slo','url shortener','back of envelope','trade-off','capacity']
    },
    {
      id: 2, slug: '2', icon: I.layers, color: 'var(--blue)', badge: 'Building Blocks', level: 'Intermediate',
      title: 'Building Blocks',
      short: 'Khối xây dựng',
      desc: 'Load balancer, caching, rate limiter, message queue, CDN, search — những viên gạch lặp đi lặp lại trong mọi thiết kế.',
      topics: ['Load Balancer', 'Cache Strategies', 'Rate Limiting', 'Message Queue', 'CDN'],
      time: '2 tuần', sections: 8,
      tags: ['load balancer','l4','l7','nginx','cache','redis','cache aside','write through','stampede','penetration','avalanche','rate limit','token bucket','leaky bucket','sliding window','message queue','kafka','sqs','rabbitmq','cdn','cache control','inverted index','elasticsearch','bm25','snowflake','uuid','id generator','consistent hashing']
    },
    {
      id: 3, slug: '3', icon: I.database, color: 'var(--purple)', badge: 'Data', level: 'Intermediate',
      title: 'Dữ liệu & Lưu trữ',
      short: 'Data & Storage',
      desc: 'Chọn đúng loại storage, hiểu B+ tree vs LSM tree, replication, sharding và cách dữ liệu chảy qua pipeline.',
      topics: ['B+ vs LSM Tree', 'Replication', 'Quorum R+W>N', 'Sharding', 'CDC & Streaming'],
      time: '2 tuần', sections: 8,
      tags: ['b+ tree','lsm tree','rocksdb','cassandra','postgres','mysql','index','composite index','covering index','replication','leader follower','replication lag','quorum','r+w>n','read repair','hinted handoff','sharding','shard key','hotspot','consistent hashing','cdc','debezium','outbox','partition','ttl','tombstone','compaction','write amplification']
    },
    {
      id: 4, slug: '4', icon: I.network, color: 'var(--orange)', badge: 'Distributed', level: 'Advanced',
      title: 'Hệ thống phân tán',
      short: 'Distributed Systems',
      desc: 'Consensus (Raft), distributed transactions (2PC, Saga), fault tolerance patterns, observability và bảo mật.',
      topics: ['Raft', '2PC vs Saga', 'Circuit Breaker', 'Observability', 'Zero Trust'],
      time: '2 tuần', sections: 9,
      tags: ['cap','pacelc','linearizability','raft','paxos','consensus','leader election','split brain','fencing token','2pc','saga','distributed transaction','idempotency','circuit breaker','bulkhead','retry','backoff','distributed lock','redlock','observability','tracing','metrics','logs','slo','sli','error budget','mtls','zero trust','jwt','oauth','idor']
    },
    {
      id: 5, slug: '5', icon: I.grid, color: 'var(--green)', badge: 'Classic', level: 'Advanced',
      title: 'Bài toán kinh điển',
      short: 'Classic Problems',
      desc: '20 bài toán phỏng vấn hay gặp nhất: URL shortener, rate limiter, KV store, news feed, chat, Uber, payment…',
      topics: ['URL Shortener', 'KV Store', 'News Feed', 'Chat', 'Payment Ledger'],
      time: '4 tuần', sections: 10,
      tags: ['url shortener','rate limiter','kv store','key value','news feed','fan-out','celebrity','chat','websocket','presence','search','autocomplete','trie','inverted index','bm25','video','hls','dash','transcode','cdn','google drive','chunking','dedup','payment','ledger','double entry','idempotency','uber','geo','geohash','h3','s2','notification','web crawler','youtube','twitter','instagram']
    },
    {
      id: 6, slug: '6', icon: I.cloud, color: 'var(--red)', badge: 'Cloud', level: 'Expert',
      title: 'Cloud & Kiến trúc hiện đại',
      short: 'Cloud & Modern',
      desc: 'Microservices, Kubernetes, service mesh, SRE practices, multi-region và tối ưu chi phí trên cloud.',
      topics: ['Microservices', 'Kubernetes', 'Service Mesh', 'SRE & SLO', 'Cost Optimization'],
      time: '2 tuần', sections: 8,
      tags: ['microservices','monolith','modular monolith','bounded context','ddd','docker','container','kubernetes','k8s','pod','deployment','statefulset','hpa','autoscaling','service mesh','istio','linkerd','envoy','api gateway','ingress','sre','slo','sli','error budget','golden signals','multi region','active active','active passive','cell','blast radius','cost','egress','finops','event driven','outbox','event sourcing','deployment','canary','blue green','feature flag','dora']
    },
    {
      id: 7, slug: '7', icon: I.zap, color: 'var(--yellow)', badge: 'Interview', level: 'Expert',
      title: 'Luyện phỏng vấn',
      short: 'Interview Prep',
      desc: 'Framework 45 phút, checklist trước khi nộp bài, mock interview, cách trình bày trade-off và tài nguyên học tiếp.',
      topics: ['45-min Framework', 'Checklist', 'Trade-off Talk', 'Mock Interview', 'Resources'],
      time: '2 tuần', sections: 6,
      tags: ['interview','framework','45 minutes','requirements','estimation','trade-off','deep dive','checklist','mock','behavioral','storytelling','communication']
    }
  ];

  /* ---------------- Storage helpers ---------------- */
  const STORE = {
    get(key, fallback) {
      try { const v = localStorage.getItem('sd:' + key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('sd:' + key, JSON.stringify(value)); } catch (e) {}
    }
  };

  /* ---------------- Header / Footer ---------------- */
  function currentPage() {
    const p = location.pathname;
    if (/\/modules\/\d+\//.test(p) || p.includes('module.html')) return 'module';
    if (p.includes('/modules')) return 'modules';
    if (p.includes('/adr')) return 'adr';
    if (p.includes('/exercises')) return 'exercises';
    if (p.includes('learning-path') || p.includes('/path')) return 'path';
    return 'home';
  }

  function rootPrefix() {
    const p = location.pathname;
    if (/\/modules\/\d+\//.test(p)) return '../../';
    if (p.includes('/modules/') || p.endsWith('/modules/index.html')) return '../';
    if (p.includes('/adr/') || p.includes('/exercises/')) return '../';
    return '';
  }

  function renderHeader(active) {
    const R = rootPrefix();
    const navItems = [
      { key: 'home', href: R + 'index.html', label: 'Trang chủ', icon: I.layers },
      { key: 'modules', href: R + 'modules/index.html', label: 'Modules', icon: I.book, count: '8' },
      { key: 'path', href: R + 'learning-path.html', label: 'Lộ trình', icon: I.git },
      { key: 'adr', href: R + 'adr/index.html', label: 'ADR', icon: I.file, count: '6' },
      { key: 'exercises', href: R + 'exercises/index.html', label: 'Bài tập', icon: I.code, count: '2' }
    ];
    const links = navItems.map(n => `
      <a class="nav-link${active === n.key ? ' is-active' : ''}" href="${n.href}">
        ${n.icon}<span>${n.label}</span>
        ${n.count ? `<span class="nav-count">${n.count}</span>` : ''}
      </a>`).join('');

    const mobile = navItems.map(n => `
      <a href="${n.href}" class="${active === n.key ? 'is-active' : ''}">${n.icon}<span>${n.label}</span></a>`).join('');

    return `
    <header class="site-header">
      <div class="container">
        <a class="brand" href="${R}index.html" aria-label="System Design Hub — trang chủ">
          <span class="brand-mark">${I.logo}</span>
          <span class="brand-text">
            <span class="brand-title">System Design Hub
              <span class="badge badge-yellow" style="font-size:9px;padding:2px 7px;">VI</span>
            </span>
            <span class="brand-sub">8 modules · 6 ADR · hands-on</span>
          </span>
        </a>
        <nav class="nav-links" aria-label="Điều hướng chính">${links}</nav>
        <div class="header-actions">
          <button class="icon-btn" id="themeToggle" title="Đổi giao diện sáng/tối" aria-label="Đổi giao diện">${I.moon}</button>
          <button class="icon-btn menu-btn" id="menuToggle" title="Mở menu" aria-label="Mở menu" aria-expanded="false">${I.menu}</button>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav">
        <div class="container">${mobile}</div>
      </div>
    </header>`;
  }

  function renderFooter() {
    const R = rootPrefix();
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-main">
          <div class="footer-brand">
            <a class="brand" href="${R}index.html">
              <span class="brand-mark">${I.logo}</span>
              <span class="brand-text">
                <span class="brand-title">System Design Hub</span>
                <span class="brand-sub">Học thiết kế hệ thống từ gốc</span>
              </span>
            </a>
            <p>Nền tảng học System Design tiếng Việt: 8 module từ nền tảng đến phỏng vấn, kèm ADR, bài tập và sơ đồ kiến trúc cho từng chủ đề.</p>
          </div>
          <div class="footer-col">
            <h4>Nội dung</h4>
            <a href="${R}modules/index.html">Tất cả modules</a>
            <a href="${R}modules/0/index.html">Module 0 — Nền tảng</a>
            <a href="${R}modules/2/index.html">Module 2 — Building Blocks</a>
            <a href="${R}modules/5/index.html">Module 5 — Bài toán kinh điển</a>
          </div>
          <div class="footer-col">
            <h4>Tài nguyên</h4>
            <a href="${R}adr/index.html">Architecture Decision Records</a>
            <a href="${R}exercises/index.html">Bài tập thực hành</a>
            <a href="${R}learning-path.html">Lộ trình 12 tuần</a>
            <a href="${R}curriculum.md">Giáo trình (markdown)</a>
          </div>
          <div class="footer-col">
            <h4>Nguồn tham khảo</h4>
            <a href="https://www.alexxu.dev/" target="_blank" rel="noopener">Alex Xu — System Design Interview</a>
            <a href="https://github.com/" target="_blank" rel="noopener">60 Days of System Design</a>
            <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener">System Design Primer</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 System Design Hub · Xây dựng cho việc học, không phải production.</span>
          <span class="mono" style="font-size:11.5px;">Nội dung: Alex Xu · Joud Awad · Franco Fernando</span>
        </div>
      </div>
    </footer>`;
  }

  function renderMarquee() {
    const words = ['QPS', 'P99 LATENCY', 'CONSISTENT HASHING', 'CAP THEOREM', 'RATE LIMITING', 'SHARDING', 'CACHE-ASIDE', 'RAFT', 'SAGA PATTERN', 'IDEMPOTENCY', 'FAN-OUT', 'BACK-OF-ENVELOPE'];
    const seq = words.concat(words);
    const items = seq.map(w => `<span class="marquee-item"><span class="dot"></span>${w}</span>`).join('');
    return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${items}</div></div>`;
  }

  /* ---------------- Theme ---------------- */
  function initTheme() {
    const saved = STORE.get('theme', null);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const paint = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = dark ? I.sun : I.moon;
    };
    paint();
    btn.addEventListener('click', () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      STORE.set('theme', next);
      paint();
    });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMenu() {
    const btn = document.getElementById('menuToggle');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------------- Quiz ---------------- */
  function initQuiz() {
    document.querySelectorAll('.quiz-reveal').forEach(btn => {
      btn.addEventListener('click', () => {
        const ans = btn.closest('.quiz').querySelector('.quiz-answer');
        if (!ans) return;
        const open = ans.classList.toggle('is-open');
        btn.textContent = open ? 'Ẩn đáp án ▲' : 'Xem đáp án ▼';
      });
    });
  }

  /* ---------------- Code copy ---------------- */
  function initCopy() {
    document.querySelectorAll('.codeblock-copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const code = btn.closest('.codeblock').querySelector('pre');
        const text = code ? code.innerText : '';
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Đã copy ✓';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
        } catch (e) {
          btn.textContent = 'Lỗi';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
        }
      });
    });
  }

  /* ---------------- Progress ---------------- */
  function initProgress() {
    const done = STORE.get('done', {});
    document.querySelectorAll('[data-done-key]').forEach(btn => {
      const key = btn.dataset.doneKey;
      if (done[key]) btn.classList.add('is-done');
      btn.addEventListener('click', () => {
        const d = STORE.get('done', {});
        if (d[key]) delete d[key]; else d[key] = Date.now();
        STORE.set('done', d);
        btn.classList.toggle('is-done', !!d[key]);
        updateOverall();
      });
    });
    updateOverall();
  }

  function updateOverall() {
    const done = STORE.get('done', {});
    const els = document.querySelectorAll('[data-overall]');
    if (!els.length) return;
    const total = MODULES.length;
    const count = MODULES.filter(m => done['m' + m.id]).length;
    els.forEach(el => { el.textContent = Math.round((count / total) * 100) + '%'; });
  }

  /* ---------------- Reading progress + TOC scrollspy ---------------- */
  function initScrollUX() {
    const bar = document.querySelector('.progress-bar');
    const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
    const heads = tocLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

    const onScroll = () => {
      if (bar) {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      }
      if (heads.length) {
        let active = heads[0];
        for (const h of heads) {
          if (h.getBoundingClientRect().top <= 140) active = h;
        }
        tocLinks.forEach(a => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + active.id);
        });
      }
    };
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; onScroll(); });
    }, { passive: true });
    onScroll();
  }

  /* ---------------- Search (modules index page) ---------------- */
  function initSearch() {
    const input = document.getElementById('moduleSearch');
    if (!input) return;
    const cards = [...document.querySelectorAll('[data-module-card]')];
    const empty = document.getElementById('emptyState');
    const filterBtns = [...document.querySelectorAll('.filter-btn')];
    let level = 'all';

    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const hay = (card.dataset.search || '').toLowerCase();
        const okQ = !q || hay.includes(q);
        const okL = level === 'all' || card.dataset.level === level;
        const show = okQ && okL;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.style.display = shown === 0 ? '' : 'none';
    };

    input.addEventListener('input', apply);
    filterBtns.forEach(b => b.addEventListener('click', () => {
      filterBtns.forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      level = b.dataset.level;
      apply();
    }));

    const reset = document.getElementById('resetFilters');
    if (reset) reset.addEventListener('click', () => {
      input.value = '';
      level = 'all';
      filterBtns.forEach(x => x.classList.toggle('is-active', x.dataset.level === 'all'));
      apply();
      input.focus();
    });
  }

  /* ---------------- Module page renderer ---------------- */
  function renderModulePage() {
    const host = document.getElementById('moduleRoot');
    if (!host) return;
    const idx = Number(host.dataset.module);
    const meta = MODULES.find(m => m.id === idx);
    const content = (window.SD_CONTENT || {})[idx];
    if (!meta || !content) return;

    const done = STORE.get('done', {});
    const isDone = !!done['m' + idx];

    document.title = `${content.title} | System Design Hub`;

    const sections = content.sections || [];
    const toc = sections.map(s => {
      const subs = (s.subs || []).map(x => `<a class="toc-sub" href="#${x.id}">${x.title}</a>`).join('');
      return `<a href="#${s.id}">${s.title}</a>${subs}`;
    }).join('');

    const kwBlock = content.keywords ? `
      <div class="lesson" id="keywords">
        <h2><span class="num">KW</span>Từ khoá cần nắm</h2>
        <p class="text-muted text-sm mb-4">Đây là danh sách từ khoá bạn phải giải thích được bằng lời của mình sau khi học xong module. Bấm vào từng từ để xem định nghĩa nhanh.</p>
        <dl class="kw-grid">
          ${content.keywords.map(k => `<div class="kw-card"><dt>${k.term}</dt><dd>${k.def}</dd></div>`).join('')}
        </dl>
      </div>` : '';

    const prev = MODULES.find(m => m.id === idx - 1);
    const next = MODULES.find(m => m.id === idx + 1);

    host.innerHTML = `
    <div class="progress-bar" role="progressbar" aria-label="Tiến độ đọc"></div>

    <div class="container" style="padding-top:32px;">
      <a href="../index.html" class="section-link" style="margin-bottom:16px;display:inline-flex;">${I.arrowLeft}<span>Quay lại danh sách modules</span></a>

      <div class="module-hero">
        <div class="module-hero-top">
          <span class="badge badge-yellow">Module ${idx}</span>
          <span class="badge">${meta.badge}</span>
          <span class="badge badge-blue">${meta.level}</span>
          ${isDone ? '<span class="badge badge-green">Đã hoàn thành ✓</span>' : ''}
        </div>
        <h1>${content.title}</h1>
        <p class="lead">${content.lead}</p>
        <div class="meta-row">
          <span class="meta-item">${I.clock}<span>${meta.time}</span></span>
          <span class="meta-item">${I.book}<span>${sections.length} mục</span></span>
          <span class="meta-item">${I.zap}<span>${(content.keywords || []).length} từ khoá</span></span>
          <span class="meta-item">${I.gauge}<span>${meta.level}</span></span>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <button class="done-btn${isDone ? ' is-done' : ''}" data-done-key="m${idx}">${I.check}<span>Đánh dấu hoàn thành</span></button>
          <a class="btn btn-sm btn-secondary" href="#keywords">Từ khoá</a>
          <a class="btn btn-sm btn-secondary" href="#quiz">Quiz tự kiểm tra</a>
        </div>
      </div>

      <div class="module-layout">
        <div id="lessonColumn">
          ${sections.map(s => `
            <section class="lesson" id="${s.id}">
              <h2><span class="num">${s.num}</span>${s.title}</h2>
              ${s.html}
            </section>`).join('')}
          ${kwBlock}
          <section class="lesson" id="quiz">
            <h2><span class="num">?</span>Quiz tự kiểm tra</h2>
            ${(content.quiz || []).map((q, i) => `
              <div class="quiz">
                <div class="quiz-head">${I.sparkles}<span>Câu ${i + 1}</span></div>
                <div class="quiz-body">
                  <p class="quiz-q">${q.q}</p>
                  <button class="quiz-reveal" type="button">Xem đáp án ▼</button>
                  <div class="quiz-answer">${q.a}</div>
                </div>
              </div>`).join('')}
          </section>
          <nav class="pager" aria-label="Điều hướng module">
            ${prev ? `<a href="../${prev.slug}/index.html"><span class="dir">← Module trước</span><span class="name">${prev.id}. ${prev.title}</span></a>` : '<span></span>'}
            ${next ? `<a class="next" href="../${next.slug}/index.html"><span class="dir">Module tiếp →</span><span class="name">${next.id}. ${next.title}</span></a>` : '<span></span>'}
          </nav>
        </div>
        <aside class="toc" aria-label="Mục lục">
          <div class="toc-title">Trong module này</div>
          ${toc}
          <a href="#quiz" style="margin-top:8px;">Quiz tự kiểm tra</a>
        </aside>
      </div>
    </div>`;
  }

  /* ---------------- Module index cards ---------------- */
  function renderModuleGrid() {
    const host = document.getElementById('moduleGrid');
    if (!host) return;
    const done = STORE.get('done', {});
    // Trên trang chủ, module nằm trong ./modules/; trên /modules/index.html
    // thì chỉ cần ./{slug}/. Phải phân biệt, nếu không link sẽ 404.
    const modBase = /\/modules\//.test(location.pathname) ? './' : './modules/';
    host.innerHTML = MODULES.map(m => `
      <a class="mod-card" href="${modBase}${m.slug}/index.html"
         data-module-card data-level="${m.level.toLowerCase()}"
         data-search="module ${m.id} ${m.title} ${m.short} ${m.desc} ${m.topics.join(' ')} ${m.level} ${(m.tags || []).join(' ')}">
        <div class="mod-card-top">
          <span class="mod-icon" style="background:${m.color}">${m.icon}</span>
          <span class="mod-num">MODULE ${m.id}</span>
        </div>
        <h3 class="mod-title">${m.title}</h3>
        <p class="mod-desc">${m.desc}</p>
        <div class="chip-row mb-3">
          ${m.topics.slice(0, 3).map(t => `<span class="chip chip-mono">${t}</span>`).join('')}
        </div>
        <div class="mod-foot">
          <span>${m.time} · ${done['m' + m.id] ? '✓ đã học' : m.level}</span>
          <span class="mod-arrow">${I.arrow}</span>
        </div>
      </a>`).join('');
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    const active = currentPage();

    const headerHost = document.getElementById('siteHeader');
    if (headerHost) headerHost.outerHTML = renderHeader(active);
    const footerHost = document.getElementById('siteFooter');
    if (footerHost) footerHost.outerHTML = renderFooter();
    const marqueeHost = document.getElementById('marqueeHost');
    if (marqueeHost) marqueeHost.innerHTML = renderMarquee();

    renderModulePage();
    renderModuleGrid();

    initTheme();
    initMenu();
    initQuiz();
    initCopy();
    initProgress();
    initScrollUX();
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.SD = { MODULES, I, STORE, rootPrefix };
})();
