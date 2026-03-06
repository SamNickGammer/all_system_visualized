import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode } from '@/lib/helpers';

export const appWebArchitectureDiagrams: DiagramDef[] = [
  // 0: HTTP Request Lifecycle
  {
    title: 'HTTP Request Lifecycle',
    desc: 'Browser → DNS → TCP → TLS → Server → Response',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const steps = [
        createNode(canvas, 30, 120, 90, 'Browser', 'chrome/ff', 'np'),
        createNode(canvas, cx / 6, 120, 90, 'DNS Lookup', 'resolve IP', 'nb'),
        createNode(canvas, (cx / 6) * 2, 120, 90, 'TCP Connect', '3-way hs', 'ny'),
        createNode(canvas, (cx / 6) * 3, 120, 90, 'TLS Setup', 'cert verify', 'no'),
        createNode(canvas, (cx / 6) * 4, 120, 100, 'HTTP Request', 'GET /page', 'nk'),
        createNode(canvas, (cx / 6) * 5, 120, 100, 'HTTP Response', '200 + HTML', 'ng'),
      ];

      let si = 0;
      const times = [0, 2, 15, 80, 100, 250];
      const msgs = [
        '[Browser] user navigates to example.com',
        `[DNS] resolving example.com → 93.184.216.34 (${times[1]}ms)`,
        `[TCP] SYN→SYN-ACK→ACK complete (${times[2]}ms)`,
        `[TLS] handshake, cert verified, session key (${times[3]}ms)`,
        `[HTTP] GET / HTTP/2 Host: example.com (${times[4]}ms)`,
        `[Response] 200 OK 24kb HTML TTFB:${times[5]}ms`,
      ];

      const tick = (): void => {
        steps.forEach((n) => n.classList.remove('active'));
        steps[si].classList.add('active');
        log(si === 5 ? 'ok' : 'info', msgs[si]);
        si = (si + 1) % steps.length;
      };

      return { tick, interval: 1000 };
    },
  },

  // 1: React Rendering Cycle
  {
    title: 'React Rendering Cycle',
    desc: 'State change → reconciliation → virtual DOM diff → commit',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const state = createNode(canvas, 30, 100, 110, 'State/Props', 'useState/Redux', 'np');
      const render = createNode(canvas, cx / 4, 100, 110, 'render()', 'JSX → vDOM', 'nk');
      const vdom = createNode(canvas, cx / 2 - 60, 60, 130, 'Virtual DOM', 'new tree', 'nb');
      const diff = createNode(canvas, cx / 2 - 60, 160, 130, 'Reconciler', 'fiber diff', 'ny');
      const commit = createNode(canvas, (cx * 3) / 4, 100, 120, 'Commit Phase', 'apply patches', 'no');
      const dom = createNode(canvas, cx - 160, 100, 140, 'Real DOM', 'browser paint', 'ng');

      let renders = 0;
      const components = ['<App>', '<Header>', '<Button>', '<Modal>', '<List>'];
      const nodes = [state, render, vdom, diff, commit, dom];

      const tick = (): void => {
        renders++;
        const comp = components[Math.floor(Math.random() * components.length)];
        const isUpdate = Math.random() > 0.3;
        let delay = 0;
        nodes.forEach((n) => {
          const d = delay;
          setTimeout(() => {
            flashNode(n, 250);
          }, d);
          delay += 120;
        });
        const patches = Math.floor(Math.random() * 8 + 1);
        log(
          'info',
          `[${comp}] render #${renders} → ${patches} DOM patch${patches > 1 ? 'es' : ''} (${isUpdate ? 'update' : 'mount'})`,
        );
        if (patches === 0) log('ok', '[Reconciler] bailed out — no changes detected');
      };

      return { tick, interval: 1400 };
    },
  },

  // 2: GraphQL Resolver Chain
  {
    title: 'GraphQL Resolver Chain',
    desc: 'Query parsing → resolver tree → data sources → response',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const _client = createNode(canvas, 30, 130, 90, 'Client', 'query', 'np');
      const gql = createNode(canvas, cx / 5, 130, 110, 'GQL Engine', 'parse+plan', 'nk');
      const r1 = createNode(canvas, cx / 2 - 80, 60, 120, 'userResolver', 'User type', 'nb');
      const r2 = createNode(canvas, cx / 2 - 80, 130, 120, 'postsResolver', '[Post]', 'ny');
      const r3 = createNode(canvas, cx / 2 - 80, 200, 120, 'friendsResolver', '[User]', 'no');
      const db = createNode(canvas, cx - 160, 80, 120, 'PostgreSQL', 'users/posts', 'ng');
      const _cache = createNode(canvas, cx - 160, 180, 120, 'Redis Cache', 'friends', 'ng');

      const queries = [
        '{ user(id:1) { name posts { title } } }',
        '{ me { friends { name } notifications } }',
        '{ search(q:"kafka") { users posts } }',
      ];
      let qi = 0;

      const tick = (): void => {
        const q = queries[qi % queries.length];
        qi++;
        flashNode(gql, 300);
        const resolvers = [r1, r2, r3];
        const used = resolvers.slice(0, Math.floor(Math.random() * 3) + 1);
        used.forEach((r, i) => {
          setTimeout(() => {
            flashNode(r, 300);
          }, 300 + i * 200);
        });
        setTimeout(() => {
          flashNode(db, 300);
        }, 700);
        log('info', `[GQL] ${q.slice(0, 50)}`);
        setTimeout(() => log('ok', `[Response] resolved ${used.length} resolvers, 1 DB query`), 800);
      };

      return { tick, interval: 1500 };
    },
  },

  // 3: Cache Hierarchy
  {
    title: 'Cache Hierarchy',
    desc: 'L1 memory → L2 Redis → origin DB — hit rate and latency',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const _req = createNode(canvas, 30, 130, 90, 'Request', 'GET /data', 'np');
      const l1 = createNode(canvas, cx / 4, 60, 120, 'L1 Cache', 'in-memory', 'ng');
      const l2 = createNode(canvas, cx / 2 - 60, 60, 120, 'L2 Cache', 'Redis', 'ny');
      const db = createNode(canvas, (cx * 3) / 4, 60, 120, 'Database', 'PostgreSQL', 'nb');
      const resp = createNode(canvas, cx - 120, 130, 100, 'Response', '200 OK', 'ng');

      const hits = { l1: 0, l2: 0, db: 0 };

      const statEl = document.createElement('div');
      statEl.style.cssText =
        'position:absolute;bottom:20px;left:20px;font-size:9px;color:var(--dim);line-height:2';
      canvas.appendChild(statEl);

      const updateStat = (): void => {
        const t = hits.l1 + hits.l2 + hits.db || 1;
        statEl.innerHTML =
          `L1 hit: <span style="color:var(--accent)">${((hits.l1 / t) * 100).toFixed(0)}%</span>  ` +
          `L2 hit: <span style="color:var(--yellow)">${((hits.l2 / t) * 100).toFixed(0)}%</span>  ` +
          `DB: <span style="color:var(--blue)">${((hits.db / t) * 100).toFixed(0)}%</span>`;
      };

      const tick = (): void => {
        const r = Math.random();
        if (r < 0.6) {
          hits.l1++;
          flashNode(l1, 300);
          flashNode(resp, 300);
          log('ok', `[Cache] L1 HIT key:item_${Math.floor(Math.random() * 100)} lat:0.1ms`);
        } else if (r < 0.85) {
          hits.l2++;
          flashNode(l2, 300);
          flashNode(resp, 300);
          log('warn', '[Cache] L1 MISS → L2 HIT lat:3ms');
        } else {
          hits.db++;
          flashNode(db, 400);
          log('err', `[Cache] L1+L2 MISS → DB query lat:${Math.floor(Math.random() * 20 + 10)}ms`);
          setTimeout(() => log('info', '[Cache] result stored in L1+L2'), 300);
        }
        updateStat();
      };

      return { tick, interval: 700 };
    },
  },

  // 4: WebSocket vs REST
  {
    title: 'WebSocket vs REST',
    desc: 'Side-by-side comparison of bidirectional vs request-response',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const half = cx / 2 - 20;

      // Labels
      const lbl1 = document.createElement('div');
      lbl1.style.cssText =
        'position:absolute;left:20px;top:5px;font-size:9px;color:var(--blue);letter-spacing:.12em;text-transform:uppercase';
      lbl1.textContent = 'REST (HTTP)';
      canvas.appendChild(lbl1);

      const lbl2 = document.createElement('div');
      lbl2.style.cssText = `position:absolute;left:${half + 30}px;top:5px;font-size:9px;color:var(--accent);letter-spacing:.12em;text-transform:uppercase`;
      lbl2.textContent = 'WebSocket';
      canvas.appendChild(lbl2);

      // Divider
      const divider = document.createElement('div');
      divider.style.cssText = `position:absolute;left:${half + 10}px;top:0;bottom:0;width:1px;background:var(--border)`;
      canvas.appendChild(divider);

      // REST side
      const rc = createNode(canvas, 20, 60, 90, 'Client', 'browser', 'nb');
      const rs = createNode(canvas, 20 + half - 110, 60, 100, 'Server', 'api.example', 'nb');

      // WebSocket side
      const wc = createNode(canvas, half + 20, 60, 90, 'Client', 'browser', 'ng');
      const ws = createNode(canvas, half + 20 + half - 110, 60, 100, 'Server', 'ws.example', 'ng');

      let rtick = 0;
      let wstick = 0;

      const tick = (): void => {
        rtick++;
        flashNode(rc, 200);
        flashNode(rs, 300);
        log('info', `[REST] req #${rtick} → new TCP+TLS per request`);

        wstick++;
        const dir = Math.random() > 0.5;
        flashNode(dir ? wc : ws, 300);
        log('ok', `[WS] frame #${wstick} ${dir ? 'client→server' : 'server→client'} (persistent conn)`);
      };

      return { tick, interval: 900 };
    },
  },

  // 5: SSR vs CSR vs SSG
  {
    title: 'SSR vs CSR vs SSG',
    desc: 'Server-Side, Client-Side, and Static Site Generation rendering compared',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const third = Math.floor(cx / 3) - 10;

      // Column labels
      const columnLabels = ['SSR (Next.js)', 'CSR (React SPA)', 'SSG (Astro)'];
      const columnColors = ['var(--blue)', 'var(--orange)', 'var(--accent)'];
      columnLabels.forEach((label, i) => {
        const l = document.createElement('div');
        l.style.cssText = `position:absolute;left:${10 + i * (third + 10)}px;top:5px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${columnColors[i]}`;
        l.textContent = label;
        canvas.appendChild(l);
      });

      // SSR nodes
      const ssr = [
        createNode(canvas, 10, 40, third, 'Request', 'GET /page', 'nb'),
        createNode(canvas, 10, 100, third, 'Server Render', 'HTML generated', 'nb'),
        createNode(canvas, 10, 160, third, 'Send HTML', 'full content', 'nb'),
        createNode(canvas, 10, 220, third, 'Hydrate', 'interactive', 'ng'),
      ];

      // CSR nodes
      const csr = [
        createNode(canvas, 10 + third + 10, 40, third, 'Request', 'GET /', 'no'),
        createNode(canvas, 10 + third + 10, 100, third, 'Empty HTML', 'shell only', 'no'),
        createNode(canvas, 10 + third + 10, 160, third, 'Download JS', 'bundle.js', 'no'),
        createNode(canvas, 10 + third + 10, 220, third, 'Client Render', 'React mounts', 'no'),
      ];

      // SSG nodes
      const ssg = [
        createNode(canvas, 10 + (third + 10) * 2, 40, third, 'Build Time', 'generate HTML', 'ng'),
        createNode(canvas, 10 + (third + 10) * 2, 100, third, 'CDN Cache', 'edge served', 'ng'),
        createNode(canvas, 10 + (third + 10) * 2, 160, third, 'Request', 'instant HTML', 'ng'),
        createNode(canvas, 10 + (third + 10) * 2, 220, third, 'Hydrate', 'optional JS', 'ng'),
      ];

      const all = [ssr, csr, ssg];
      const names = ['SSR', 'CSR', 'SSG'];
      const metrics = [
        ['TTFB:200ms', 'FCP:300ms'],
        ['TTFB:50ms', 'FCP:1200ms'],
        ['TTFB:20ms', 'FCP:50ms'],
      ];
      let col = 0;
      let step = 0;

      const tick = (): void => {
        all.flat().forEach((n) => n.classList.remove('active'));
        all[col][step].classList.add('active');
        log(col === 2 ? 'ok' : 'info', `[${names[col]}] step ${step + 1}/4 — ${metrics[col][step > 1 ? 1 : 0]}`);
        step++;
        if (step >= 4) {
          step = 0;
          col = (col + 1) % 3;
        }
      };

      return { tick, interval: 800 };
    },
  },

  // 6: Service Worker Caching
  {
    title: 'Service Worker Caching',
    desc: 'SW intercepts requests — serve from cache or fetch from network',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const browser = createNode(canvas, 30, 120, 100, 'Browser', 'fetch()', 'np');
      const sw = createNode(canvas, cx / 3 - 30, 120, 130, 'Service Worker', 'interceptor', 'ny');
      const cache = createNode(canvas, (cx * 2) / 3 - 30, 60, 120, 'Cache Storage', 'local cache', 'ng');
      const network = createNode(canvas, (cx * 2) / 3 - 30, 190, 120, 'Network', 'origin server', 'nb');
      const _response = createNode(canvas, cx - 120, 120, 100, 'Response', '200 OK', 'ng');

      let hits = 0;
      let misses = 0;
      const urls = ['/api/data', '/images/logo.png', '/styles.css', '/api/users', '/manifest.json', '/offline.html'];

      const tick = (): void => {
        const url = urls[Math.floor(Math.random() * urls.length)];
        flashNode(browser, 300);
        flashNode(sw, 300);

        const hit = Math.random() > 0.4;
        if (hit) {
          hits++;
          flashNode(cache, 300);
          flashNode(_response, 300);
          log('ok', `[SW] ${url} → cache HIT (${hits} hits, ${misses} misses)`);
        } else {
          misses++;
          flashNode(network, 300);
          setTimeout(() => {
            flashNode(cache, 200);
          }, 200);
          log('warn', `[SW] ${url} → cache MISS → fetch network → stored in cache`);
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 7: Event Loop
  {
    title: 'Event Loop',
    desc: 'Call stack, Web APIs, microtask queue, macrotask queue — JS execution model',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const stack = createNode(canvas, 20, 40, 120, 'Call Stack', 'executing', 'nk');
      const webapi = createNode(canvas, cx / 3, 40, 130, 'Web APIs', 'setTimeout/fetch', 'nb');
      const micro = createNode(canvas, (cx * 2) / 3, 40, 130, 'Microtask Queue', 'Promise.then', 'np');
      const macro = createNode(canvas, (cx * 2) / 3, 150, 130, 'Macrotask Queue', 'setTimeout cb', 'ny');
      const loop = createNode(canvas, cx / 3, 150, 130, 'Event Loop', 'scheduler', 'ng');

      // Loop arrow indicator
      const arrow = document.createElement('div');
      arrow.style.cssText = `position:absolute;left:${cx / 3 + 65}px;top:110px;font-size:16px;color:var(--accent)`;
      arrow.textContent = '\u21BB';
      canvas.appendChild(arrow);

      const events: Array<() => void> = [
        () => {
          flashNode(stack, 300);
          log('info', '[Stack] executing main() — synchronous code');
        },
        () => {
          flashNode(stack, 300);
          flashNode(webapi, 300);
          log('info', '[Stack→WebAPI] setTimeout(cb, 0) registered');
        },
        () => {
          flashNode(stack, 300);
          flashNode(micro, 300);
          log('info', '[Stack] Promise.resolve().then(cb) → microtask queued');
        },
        () => {
          flashNode(stack, 300);
          log('info', '[Stack] console.log("sync") — stack now empty');
        },
        () => {
          flashNode(loop, 300);
          flashNode(micro, 300);
          log('ok', '[EventLoop] microtask queue → stack (Promise.then runs)');
        },
        () => {
          flashNode(loop, 300);
          flashNode(macro, 300);
          log('ok', '[EventLoop] macrotask queue → stack (setTimeout cb runs)');
        },
        () => {
          flashNode(loop, 300);
          log('info', '[EventLoop] checking queues... both empty, waiting for events');
        },
      ];

      let si = 0;

      const tick = (): void => {
        events[si % events.length]();
        si++;
      };

      return { tick, interval: 1100 };
    },
  },
];
