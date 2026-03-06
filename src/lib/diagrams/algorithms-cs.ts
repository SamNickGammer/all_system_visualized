import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createLabel } from '@/lib/helpers';

export const algorithmsCsDiagrams: DiagramDef[] = [
  // 0: Bubble Sort
  {
    title: 'Bubble Sort',
    desc: 'Adjacent element comparison and swap — O(n^2) time complexity',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const N = 14;
      let arr = Array.from({ length: N }, () => Math.floor(Math.random() * 200 + 20));
      const cx = canvas.offsetWidth - 64;
      const barW = Math.floor(cx / N) - 2;
      let bars: HTMLDivElement[] = [];

      const render = (): void => {
        canvas.querySelectorAll('.bar').forEach(b => b.remove());
        bars = arr.map((v, i) => {
          const b = document.createElement('div');
          b.className = 'bar';
          b.style.cssText = `left:${i * (barW + 2)}px;width:${barW}px;height:${v}px`;
          canvas.appendChild(b);
          return b;
        });
      };
      render();

      let i = 0;
      let j = 0;
      let passes = 0;
      let swaps = 0;
      let sorted = false;

      const tick = (): void => {
        if (sorted) return;
        bars.forEach(b => {
          b.classList.remove('comparing', 'swapping');
        });
        if (j < N - i - 1) {
          bars[j].classList.add('comparing');
          bars[j + 1].classList.add('comparing');
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            bars[j].style.height = arr[j] + 'px';
            bars[j + 1].style.height = arr[j + 1] + 'px';
            bars[j].classList.add('swapping');
            bars[j + 1].classList.add('swapping');
            swaps++;
            log('info', `[Swap] arr[${j}]<>arr[${j + 1}] swaps:${swaps}`);
          }
          j++;
        } else {
          bars[N - i - 1].classList.add('sorted');
          j = 0;
          i++;
          passes++;
          log('ok', `[Pass ${passes}] completed, ${N - i} elements remaining`);
          if (i >= N) {
            sorted = true;
            bars.forEach(b => b.classList.add('sorted'));
            log('ok', `Sorted in ${passes} passes, ${swaps} swaps`);
          }
        }
      };

      return { tick, interval: 180 };
    },
  },

  // 1: BFS Graph Traversal
  {
    title: 'BFS Graph Traversal',
    desc: 'Breadth-first search — visit all nodes level by level using a queue',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const positions = [
        { x: canvas.offsetWidth / 2 - 20, y: 30 },
        { x: canvas.offsetWidth / 4 - 20, y: 120 },
        { x: (canvas.offsetWidth * 3) / 4 - 20, y: 120 },
        { x: canvas.offsetWidth / 6 - 20, y: 220 },
        { x: canvas.offsetWidth / 3 - 20, y: 220 },
        { x: (canvas.offsetWidth * 2) / 3 - 20, y: 220 },
        { x: (canvas.offsetWidth * 5) / 6 - 20, y: 220 },
      ];
      const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];

      // Draw edges
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      edges.forEach(([a, b]) => {
        const pa = positions[a];
        const pb = positions[b];
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(pa.x + 20));
        l.setAttribute('y1', String(pa.y + 20));
        l.setAttribute('x2', String(pb.x + 20));
        l.setAttribute('y2', String(pb.y + 20));
        l.setAttribute('stroke', '#2a3545');
        l.setAttribute('stroke-width', '1.5');
        svg.appendChild(l);
      });
      canvas.appendChild(svg);

      // Draw nodes
      const gnodes = positions.map((p, i) => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.left = p.x + 'px';
        d.style.top = p.y + 'px';
        d.textContent = String(i);
        canvas.appendChild(d);
        return d;
      });

      const adjacency: number[][] = [[1, 2], [3, 4], [5, 6], [], [], [], []];
      const visited = new Array(7).fill(false) as boolean[];
      const queue: number[] = [0];
      visited[0] = true;
      gnodes[0].classList.replace('unvisited', 'visiting');

      const tick = (): void => {
        if (queue.length === 0) {
          log('ok', '[BFS] traversal complete — all nodes visited');
          return;
        }
        const node = queue.shift()!;
        gnodes[node].classList.replace('visiting', 'visited');
        log('info', `[BFS] dequeue node:${node} queue:[${queue}]`);
        adjacency[node].forEach(n => {
          if (!visited[n]) {
            visited[n] = true;
            queue.push(n);
            gnodes[n].classList.replace('unvisited', 'visiting');
            log('info', `[BFS] enqueue node:${n}`);
          }
        });
      };

      return { tick, interval: 900 };
    },
  },

  // 2: Consistent Hashing
  {
    title: 'Consistent Hashing',
    desc: 'Hash ring with virtual nodes — key routing and node rebalancing',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cx = canvas.offsetWidth / 2;
      const cy = 150;
      const R = 110;

      // Ring
      const ringDiv = document.createElement('div');
      ringDiv.style.cssText = `position:absolute;left:${cx - R}px;top:${cy - R}px;width:${R * 2}px;height:${R * 2}px;border-radius:50%;border:1px dashed rgba(255,107,53,.25)`;
      canvas.appendChild(ringDiv);

      const serverAngles = [0, 90, 180, 270];
      const serverColors = ['#00d4aa', '#4fc3f7', '#7c6af7', '#ffd166'];
      serverAngles.forEach((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * R;
        const y = cy + Math.sin(rad) * R;
        const n = document.createElement('div');
        n.className = 'ring-node';
        n.style.cssText = `left:${x}px;top:${y}px;background:${serverColors[i]}18;border-color:${serverColors[i]}88;color:${serverColors[i]};font-size:9px`;
        n.textContent = `S${i}`;
        canvas.appendChild(n);
      });

      const timeouts: ReturnType<typeof setTimeout>[] = [];

      const tick = (): void => {
        const hash = Math.floor(Math.random() * 360);
        const si = Math.floor(hash / 90) % 4;
        const rad = (hash * Math.PI) / 180;
        const x = cx + Math.cos(rad) * R;
        const y = cy + Math.sin(rad) * R;
        const dot = document.createElement('div');
        dot.style.cssText = `position:absolute;left:${x - 5}px;top:${y - 5}px;width:10px;height:10px;border-radius:50%;background:${serverColors[si]};z-index:5`;
        canvas.appendChild(dot);
        const tid = setTimeout(() => dot.remove(), 1200);
        timeouts.push(tid);
        log('info', `[Hash] key:${Math.random().toString(36).slice(2, 8)} hash:${hash} -> Server S${si}`);
      };

      const cleanup = (): void => {
        timeouts.forEach(t => clearTimeout(t));
      };

      return { tick, interval: 800, cleanup };
    },
  },

  // 3: Raft Consensus
  {
    title: 'Raft Consensus',
    desc: 'Leader election, log replication, and commit across a 5-node cluster',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cw = canvas.offsetWidth;
      const positions = [
        { x: cw / 2 - 20, y: 20 },
        { x: 80, y: 100 },
        { x: cw - 130, y: 100 },
        { x: 120, y: 210 },
        { x: cw - 160, y: 210 },
      ];

      const nodes = positions.map((p, i) => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.cssText = `left:${p.x}px;top:${p.y}px;width:50px;height:50px;font-size:9px`;
        d.innerHTML = `N${i}<div style="font-size:7px;color:var(--dim);margin-top:2px">follower</div>`;
        canvas.appendChild(d);
        return d;
      });

      let leader = 0;
      let term = 1;
      let logIdx = 0;

      const makeLeader = (i: number): void => {
        nodes.forEach(n => {
          n.classList.remove('visiting', 'visited');
          n.classList.add('unvisited');
          const sub = n.querySelector('div');
          if (sub) sub.textContent = 'follower';
        });
        leader = i;
        nodes[i].classList.replace('unvisited', 'visiting');
        const sub = nodes[i].querySelector('div');
        if (sub) sub.textContent = 'LEADER';
      };
      makeLeader(0);

      const events: (() => void)[] = [
        () => {
          logIdx++;
          log('info', `[Leader N${leader}] appending entry idx:${logIdx} term:${term}`);
        },
        () => {
          const f = Math.floor(Math.random() * 4) + 1;
          if (f === leader) return;
          nodes[f].classList.add('visited');
          log('info', `[N${f}] AppendEntries ACK idx:${logIdx}`);
        },
        () => {
          log('ok', `[Raft] quorum reached, entry idx:${logIdx} committed`);
        },
        () => {
          if (Math.random() > 0.7) {
            const newLeader = Math.floor(Math.random() * 5);
            term++;
            makeLeader(newLeader);
            log('warn', `[Election] term:${term} N${newLeader} wins election`);
          } else {
            log('info', `[Heartbeat] N${leader} -> followers term:${term}`);
          }
        },
      ];

      let ei = 0;
      const tick = (): void => {
        events[ei % events.length]();
        ei++;
      };

      return { tick, interval: 950 };
    },
  },

  // 4: Token Bucket Rate Limiter
  {
    title: 'Token Bucket Rate Limiter',
    desc: 'Tokens fill at steady rate — requests consume tokens, bursts allowed',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const MAX = 10;
      let tokens = 10;
      let allowed = 0;
      let denied = 0;

      // Bucket visual
      const bucketEl = document.createElement('div');
      bucketEl.style.cssText = 'position:absolute;left:50%;top:40px;transform:translateX(-50%);width:160px;height:120px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.03)';
      canvas.appendChild(bucketEl);

      const fill = document.createElement('div');
      fill.style.cssText = 'position:absolute;bottom:0;left:0;right:0;background:rgba(0,212,170,.2);transition:height .3s';
      bucketEl.appendChild(fill);

      const countEl = document.createElement('div');
      countEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;font-weight:700;color:var(--accent)';
      bucketEl.appendChild(countEl);

      const labelEl = document.createElement('div');
      labelEl.style.cssText = 'position:absolute;top:200px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--dim);text-align:center;white-space:nowrap;letter-spacing:.06em';
      canvas.appendChild(labelEl);

      const statsEl = document.createElement('div');
      statsEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statsEl);

      const update = (): void => {
        fill.style.height = `${(tokens / MAX) * 100}%`;
        countEl.textContent = String(tokens);
        labelEl.textContent = `capacity: ${MAX} tokens  ·  refill: 1/sec`;
        statsEl.innerHTML = `allowed: <span style="color:var(--accent)">${allowed}</span>  denied: <span style="color:var(--red)">${denied}</span>`;
      };
      update();

      let tickCount = 0;
      const tick = (): void => {
        tickCount++;
        // Refill 1 token per 3 ticks
        if (tickCount % 3 === 0 && tokens < MAX) {
          tokens++;
          log('info', `[Bucket] refill +1 token -> ${tokens}/${MAX}`);
        }
        // Incoming request
        const cost = Math.random() > 0.7 ? 2 : 1;
        if (tokens >= cost) {
          tokens -= cost;
          allowed++;
          log('ok', `[Allow] request consumed ${cost} token(s), remaining:${tokens}`);
        } else {
          denied++;
          log('err', `[Deny] insufficient tokens (need:${cost} have:${tokens}) — rate limited`);
        }
        update();
      };

      return { tick, interval: 500 };
    },
  },

  // 5: Binary Search
  {
    title: 'Binary Search',
    desc: 'Divide and conquer — O(log n) search through sorted array',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const N = 16;
      const arr = Array.from({ length: N }, (_, i) => i * 7 + Math.floor(Math.random() * 4));
      arr.sort((a, b) => a - b);
      let target = arr[Math.floor(Math.random() * N)];
      const cx = canvas.offsetWidth - 64;
      const barW = Math.floor(cx / N) - 2;
      let lo = 0;
      let hi = N - 1;
      let found = false;
      let steps = 0;

      const render = (lo: number, hi: number, mid: number, foundNow: boolean): void => {
        canvas.querySelectorAll('.bar,.bs-label').forEach(b => b.remove());
        arr.forEach((v, i) => {
          const b = document.createElement('div');
          b.className = 'bar';
          if (foundNow && i === mid) b.classList.add('sorted');
          else if (i === mid) b.classList.add('swapping');
          else if (i >= lo && i <= hi) b.classList.add('comparing');
          b.style.cssText = `left:${i * (barW + 2)}px;width:${barW}px;height:${Math.floor((v / arr[arr.length - 1]) * 160) + 20}px`;
          const lbl = document.createElement('div');
          lbl.style.cssText = `position:absolute;bottom:-18px;width:${barW}px;text-align:center;font-size:7px;color:var(--dim)`;
          lbl.textContent = String(v);
          b.appendChild(lbl);
          canvas.appendChild(b);
        });
        const tl = document.createElement('div');
        tl.className = 'bs-label';
        tl.style.cssText = 'position:absolute;bottom:30px;left:0;font-size:9px;color:var(--dim)';
        tl.textContent = `target: ${target}`;
        canvas.appendChild(tl);
      };
      render(lo, hi, -1, false);

      const tick = (): void => {
        if (found || lo > hi) {
          if (lo > hi && !found) {
            log('err', `[BinSearch] target ${target} not found`);
            lo = 0;
            hi = N - 1;
            target = arr[Math.floor(Math.random() * N)];
            steps = 0;
          } else if (found) {
            lo = 0;
            hi = N - 1;
            target = arr[Math.floor(Math.random() * N)];
            found = false;
            steps = 0;
          }
          render(lo, hi, -1, false);
          return;
        }
        const mid = Math.floor((lo + hi) / 2);
        steps++;
        if (arr[mid] === target) {
          found = true;
          render(lo, hi, mid, true);
          log('ok', `[BinSearch] found ${target} at idx:${mid} in ${steps} steps`);
        } else if (arr[mid] < target) {
          log('info', `[BinSearch] arr[${mid}]=${arr[mid]} < ${target}, search right`);
          lo = mid + 1;
          render(lo, hi, mid, false);
        } else {
          log('info', `[BinSearch] arr[${mid}]=${arr[mid]} > ${target}, search left`);
          hi = mid - 1;
          render(lo, hi, mid, false);
        }
      };

      return { tick, interval: 700 };
    },
  },

  // 6: Dijkstra's Shortest Path
  {
    title: "Dijkstra's Shortest Path",
    desc: 'Greedy shortest path algorithm on a weighted graph — O((V+E)logV)',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cw = canvas.offsetWidth;
      const positions = [
        { x: cw / 2 - 20, y: 20 },
        { x: 80, y: 100 },
        { x: cw - 130, y: 100 },
        { x: 40, y: 210 },
        { x: cw / 3 - 20, y: 220 },
        { x: (cw * 2) / 3 - 20, y: 220 },
        { x: cw - 90, y: 210 },
      ];
      const edges: [number, number, number][] = [
        [0, 1, 4], [0, 2, 3], [1, 3, 5], [1, 4, 2],
        [2, 5, 6], [2, 6, 1], [3, 4, 3], [4, 5, 4], [5, 6, 2],
      ];

      // Draw edges with SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      edges.forEach(([a, b, w]) => {
        const pa = positions[a];
        const pb = positions[b];
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(pa.x + 20));
        l.setAttribute('y1', String(pa.y + 20));
        l.setAttribute('x2', String(pb.x + 20));
        l.setAttribute('y2', String(pb.y + 20));
        l.setAttribute('stroke', '#2a3545');
        l.setAttribute('stroke-width', '1.5');
        svg.appendChild(l);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', String((pa.x + pb.x) / 2 + 20));
        t.setAttribute('y', String((pa.y + pb.y) / 2 + 15));
        t.setAttribute('fill', '#4a5568');
        t.setAttribute('font-size', '9');
        t.setAttribute('font-family', 'JetBrains Mono');
        t.textContent = String(w);
        svg.appendChild(t);
      });
      canvas.appendChild(svg);

      const gnodes = positions.map((p, i) => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.left = p.x + 'px';
        d.style.top = p.y + 'px';
        d.textContent = String(i);
        canvas.appendChild(d);
        return d;
      });

      const dist = [0, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity];
      const visited = new Array(7).fill(false) as boolean[];
      const adj: [number, number][][] = [[], [], [], [], [], [], []];
      edges.forEach(([a, b, w]) => {
        adj[a].push([b, w]);
        adj[b].push([a, w]);
      });
      gnodes[0].classList.replace('unvisited', 'visiting');

      const findNext = (): number => {
        let mn = Infinity;
        let mi = -1;
        for (let i = 0; i < 7; i++) {
          if (!visited[i] && dist[i] < mn) {
            mn = dist[i];
            mi = i;
          }
        }
        return mi;
      };

      const tick = (): void => {
        const u = findNext();
        if (u === -1) {
          log('ok', "[Dijkstra] all nodes visited — shortest paths found");
          return;
        }
        visited[u] = true;
        gnodes[u].classList.remove('visiting');
        gnodes[u].classList.add('visited');
        log('info', `[Dijkstra] visiting node ${u} dist:${dist[u]}`);
        adj[u].forEach(([v, w]) => {
          if (!visited[v] && dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            gnodes[v].classList.remove('unvisited');
            gnodes[v].classList.add('visiting');
            log('info', `[Update] node ${v} dist:${dist[v]} via node ${u}`);
          }
        });
      };

      return { tick, interval: 1200 };
    },
  },

  // 7: LRU Cache Eviction
  {
    title: 'LRU Cache Eviction',
    desc: 'Least Recently Used cache — access moves to front, evict from back',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cw = canvas.offsetWidth;
      const CAPACITY = 4;
      let cache: string[] = [];

      const slotEls: HTMLDivElement[] = [];
      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;left:20px;top:10px;font-size:9px;color:var(--dim);letter-spacing:.08em';
      label.textContent = '// cache (capacity: 4) — MRU <- -> LRU';
      canvas.appendChild(label);

      const slotW = Math.floor((cw - 60) / CAPACITY) - 4;
      for (let i = 0; i < CAPACITY; i++) {
        const s = document.createElement('div');
        s.className = 'bar';
        s.style.cssText = `left:${20 + i * (Math.floor((cw - 60) / CAPACITY) + 2)}px;width:${slotW}px;height:60px;bottom:auto;top:40px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border-top:none;border:1px solid var(--border);background:rgba(79,195,247,.05)`;
        s.textContent = '\u2014';
        canvas.appendChild(s);
        slotEls.push(s);
      }

      const renderCache = (): void => {
        slotEls.forEach((s, i) => {
          if (i < cache.length) {
            s.textContent = cache[i];
            s.style.borderColor = 'rgba(0,212,170,.4)';
            s.style.color = 'var(--accent)';
            s.style.background = 'rgba(0,212,170,.08)';
          } else {
            s.textContent = '\u2014';
            s.style.borderColor = 'var(--border)';
            s.style.color = 'var(--dim)';
            s.style.background = 'rgba(79,195,247,.05)';
          }
        });
      };

      const timeouts: ReturnType<typeof setTimeout>[] = [];
      const keys = 'ABCDEFGH'.split('');

      const tick = (): void => {
        const key = keys[Math.floor(Math.random() * keys.length)];
        const idx = cache.indexOf(key);
        slotEls.forEach(s => {
          s.classList.remove('sorted', 'swapping', 'comparing');
        });
        if (idx >= 0) {
          cache.splice(idx, 1);
          cache.unshift(key);
          slotEls[0].classList.add('sorted');
          log('ok', `[Cache] GET key:${key} -> HIT (moved to front)`);
        } else if (cache.length >= CAPACITY) {
          const evicted = cache.pop();
          cache.unshift(key);
          slotEls[CAPACITY - 1].classList.add('swapping');
          log('warn', `[Cache] GET key:${key} -> MISS, evict key:${evicted} (LRU)`);
          const tid = setTimeout(() => {
            slotEls[0].classList.add('sorted');
            renderCache();
          }, 200);
          timeouts.push(tid);
        } else {
          cache.unshift(key);
          slotEls[0].classList.add('sorted');
          log('info', `[Cache] SET key:${key} at front (${cache.length}/${CAPACITY})`);
        }
        renderCache();
      };

      const cleanup = (): void => {
        timeouts.forEach(t => clearTimeout(t));
      };

      return { tick, interval: 800, cleanup };
    },
  },

  // 8: Bloom Filter
  {
    title: 'Bloom Filter',
    desc: 'Probabilistic set membership — insert with k hash functions, query with possible false positives',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cw = canvas.offsetWidth;
      const BITS = 20;
      const bitArray = new Array(BITS).fill(0) as number[];
      const inserted = new Set<string>();

      const bitW = Math.floor((cw - 60) / BITS) - 2;
      const bitEls: HTMLDivElement[] = [];

      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;left:20px;top:10px;font-size:9px;color:var(--dim);letter-spacing:.06em';
      label.textContent = '// bit array (20 bits) — 3 hash functions';
      canvas.appendChild(label);

      for (let i = 0; i < BITS; i++) {
        const b = document.createElement('div');
        b.style.cssText = `position:absolute;left:${20 + i * (bitW + 2)}px;top:35px;width:${bitW}px;height:30px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--dim);transition:all .3s`;
        b.textContent = '0';
        canvas.appendChild(b);
        bitEls.push(b);
      }

      // Hash function labels
      (['H1', 'H2', 'H3'] as const).forEach((h, i) => {
        const d = document.createElement('div');
        d.style.cssText = `position:absolute;left:${20 + i * 80}px;top:80px;font-size:9px;padding:3px 8px;border:1px solid rgba(124,106,247,.3);color:var(--purple)`;
        d.textContent = h;
        canvas.appendChild(d);
      });

      const hash = (str: string, seed: number): number => {
        let h = seed;
        for (let i = 0; i < str.length; i++) {
          h = ((h << 5) - h + str.charCodeAt(i)) & 0x7fffffff;
        }
        return h % BITS;
      };

      const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
      let tickCount = 0;

      const tick = (): void => {
        tickCount++;
        bitEls.forEach(b => {
          b.style.borderColor = 'var(--border)';
        });
        if (tickCount <= 5) {
          // Insert phase
          const word = words[tickCount - 1];
          inserted.add(word);
          const h1 = hash(word, 7);
          const h2 = hash(word, 13);
          const h3 = hash(word, 31);
          [h1, h2, h3].forEach(i => {
            bitArray[i] = 1;
            bitEls[i].textContent = '1';
            bitEls[i].style.background = 'rgba(0,212,170,.15)';
            bitEls[i].style.color = 'var(--accent)';
            bitEls[i].style.borderColor = 'var(--accent)';
          });
          log('info', `[Insert] "${word}" -> H1:${h1} H2:${h2} H3:${h3} — bits set`);
        } else {
          // Query phase
          const word = words[Math.floor(Math.random() * words.length)];
          const h1 = hash(word, 7);
          const h2 = hash(word, 13);
          const h3 = hash(word, 31);
          [h1, h2, h3].forEach(i => {
            bitEls[i].style.borderColor = 'var(--yellow)';
          });
          const allSet = [h1, h2, h3].every(i => bitArray[i] === 1);
          const actuallyIn = inserted.has(word);
          if (allSet && !actuallyIn) {
            log('err', `[Query] "${word}" -> bits ${h1},${h2},${h3} all set -> FALSE POSITIVE`);
          } else if (allSet) {
            log('ok', `[Query] "${word}" -> probably in set (bits ${h1},${h2},${h3})`);
          } else {
            log('info', `[Query] "${word}" -> DEFINITELY NOT in set (bit ${[h1, h2, h3].find(i => !bitArray[i])} is 0)`);
          }
          if (tickCount > 12) {
            tickCount = 0;
            bitArray.fill(0);
            inserted.clear();
            bitEls.forEach(b => {
              b.textContent = '0';
              b.style.background = 'transparent';
              b.style.color = 'var(--dim)';
            });
            log('info', '[Reset] bloom filter cleared for next round');
          }
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 9: Merkle Tree Verification
  {
    title: 'Merkle Tree Verification',
    desc: 'Hash tree for data integrity — leaf hashes combine up to root hash',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();

      const cw = canvas.offsetWidth;
      const leaves = ['Block 0', 'Block 1', 'Block 2', 'Block 3'];
      const nodeW = Math.floor((cw - 120) / 4);
      const leafX = leaves.map((_, i) => 40 + i * (nodeW + 10));

      // Draw leaf nodes
      const leafEls = leaves.map((l, i) => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.cssText = `left:${leafX[i]}px;top:200px;width:${nodeW}px;height:36px;border-radius:4px;font-size:8px`;
        d.textContent = l;
        canvas.appendChild(d);
        return d;
      });

      const int0El = document.createElement('div');
      int0El.className = 'gnode unvisited';
      int0El.style.cssText = `left:${(leafX[0] + leafX[1]) / 2 + nodeW / 4}px;top:120px;width:${nodeW}px;height:36px;border-radius:4px;font-size:8px`;
      int0El.textContent = 'H(0+1)';
      canvas.appendChild(int0El);

      const int1El = document.createElement('div');
      int1El.className = 'gnode unvisited';
      int1El.style.cssText = `left:${(leafX[2] + leafX[3]) / 2 + nodeW / 4}px;top:120px;width:${nodeW}px;height:36px;border-radius:4px;font-size:8px`;
      int1El.textContent = 'H(2+3)';
      canvas.appendChild(int1El);

      const rootEl = document.createElement('div');
      rootEl.className = 'gnode unvisited';
      rootEl.style.cssText = `left:${cw / 2 - nodeW / 2}px;top:40px;width:${nodeW}px;height:36px;border-radius:4px;font-size:8px`;
      rootEl.textContent = 'Root Hash';
      canvas.appendChild(rootEl);

      const hashes = leaves.map(() => Math.random().toString(16).slice(2, 6));
      const intHashes = ['', ''];
      const allNodes = [...leafEls, int0El, int1El, rootEl];

      let step = 0;
      const steps: (() => void)[] = [
        () => {
          leafEls[0].classList.replace('unvisited', 'visiting');
          log('info', `[Leaf] H(Block0) = ${hashes[0]}...`);
        },
        () => {
          leafEls[0].classList.replace('visiting', 'visited');
          leafEls[1].classList.replace('unvisited', 'visiting');
          log('info', `[Leaf] H(Block1) = ${hashes[1]}...`);
        },
        () => {
          leafEls[1].classList.replace('visiting', 'visited');
          leafEls[2].classList.replace('unvisited', 'visiting');
          log('info', `[Leaf] H(Block2) = ${hashes[2]}...`);
        },
        () => {
          leafEls[2].classList.replace('visiting', 'visited');
          leafEls[3].classList.replace('unvisited', 'visiting');
          log('info', `[Leaf] H(Block3) = ${hashes[3]}...`);
        },
        () => {
          leafEls[3].classList.replace('visiting', 'visited');
          intHashes[0] = Math.random().toString(16).slice(2, 6);
          int0El.classList.replace('unvisited', 'visiting');
          log('info', `[Level1] H(${hashes[0]}+${hashes[1]}) = ${intHashes[0]}...`);
        },
        () => {
          int0El.classList.replace('visiting', 'visited');
          intHashes[1] = Math.random().toString(16).slice(2, 6);
          int1El.classList.replace('unvisited', 'visiting');
          log('info', `[Level1] H(${hashes[2]}+${hashes[3]}) = ${intHashes[1]}...`);
        },
        () => {
          int1El.classList.replace('visiting', 'visited');
          const rootHash = Math.random().toString(16).slice(2, 8);
          rootEl.classList.replace('unvisited', 'visiting');
          log('ok', `[Root] H(${intHashes[0]}+${intHashes[1]}) = ${rootHash}`);
        },
        () => {
          rootEl.classList.replace('visiting', 'visited');
          log('ok', '[Verify] Block0 verified with sibling H(Block1) + H(2+3) -> root');
        },
        () => {
          allNodes.forEach(n => {
            n.classList.remove('visited', 'visiting');
            n.classList.add('unvisited');
          });
          log('info', '[Reset] ready for next verification round');
        },
      ];

      const tick = (): void => {
        steps[step % steps.length]();
        step++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 10: Quick Sort
  {
    title: 'Quick Sort',
    desc: 'Partition-based divide and conquer — O(n log n) average, in-place',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const N = 16;
      const arr = Array.from({ length: N }, () => Math.floor(Math.random() * 200 + 20));
      const cx = canvas.offsetWidth - 64;
      const barW = Math.floor(cx / N) - 2;
      let bars: HTMLDivElement[] = [];
      const sorted = new Set<number>();

      const render = (): void => {
        canvas.querySelectorAll('.bar').forEach(b => b.remove());
        bars = arr.map((v, i) => {
          const b = document.createElement('div');
          b.className = 'bar';
          if (sorted.has(i)) b.classList.add('sorted');
          b.style.cssText = `left:${i * (barW + 2)}px;width:${barW}px;height:${v}px`;
          canvas.appendChild(b);
          return b;
        });
      };
      render();

      const stack: [number, number][] = [[0, N - 1]];
      let lo = 0, hi = N - 1, pivotIdx = -1, partI = 0;
      let phase: 'pick' | 'partition' | 'done' = 'pick';
      let swaps = 0;

      const tick = (): void => {
        if (stack.length === 0 && phase === 'pick') {
          for (let i = 0; i < N; i++) sorted.add(i);
          render();
          log('ok', `Quick Sort complete — ${swaps} swaps`);
          return;
        }
        bars.forEach(b => b.classList.remove('comparing', 'swapping'));

        if (phase === 'pick') {
          const range = stack.pop()!;
          lo = range[0]; hi = range[1];
          if (lo >= hi) { if (lo === hi) sorted.add(lo); render(); return; }
          pivotIdx = hi;
          partI = lo;
          bars[pivotIdx]?.classList.add('swapping');
          log('info', `[Pivot] arr[${pivotIdx}]=${arr[pivotIdx]} range:[${lo}..${hi}]`);
          phase = 'partition';
        } else if (phase === 'partition') {
          if (partI < hi) {
            bars[partI]?.classList.add('comparing');
            bars[pivotIdx]?.classList.add('swapping');
            if (arr[partI] < arr[pivotIdx]) {
              partI++;
            } else {
              // swap partI with hi-1 area — simple partition step
              partI++;
            }
            // Simplified: do full partition in one tick for better visual
          }
          // Do full partition at once
          let i = lo;
          for (let j = lo; j < hi; j++) {
            if (arr[j] <= arr[hi]) {
              [arr[i], arr[j]] = [arr[j], arr[i]];
              i++;
            }
          }
          [arr[i], arr[hi]] = [arr[hi], arr[i]];
          swaps++;
          sorted.add(i);
          log('ok', `[Partition] pivot ${arr[i]} placed at idx:${i}`);
          if (i - 1 > lo) stack.push([lo, i - 1]);
          if (i + 1 < hi) stack.push([i + 1, hi]);
          render();
          phase = 'pick';
        }
      };

      return { tick, interval: 600 };
    },
  },

  // 11: Merge Sort
  {
    title: 'Merge Sort',
    desc: 'Divide and conquer — O(n log n) stable sort by splitting and merging',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const N = 16;
      const arr = Array.from({ length: N }, () => Math.floor(Math.random() * 200 + 20));
      const cx = canvas.offsetWidth - 64;
      const barW = Math.floor(cx / N) - 2;

      const render = (highlight?: [number, number]): void => {
        canvas.querySelectorAll('.bar').forEach(b => b.remove());
        arr.forEach((v, i) => {
          const b = document.createElement('div');
          b.className = 'bar';
          if (highlight && i >= highlight[0] && i <= highlight[1]) b.classList.add('comparing');
          b.style.cssText = `left:${i * (barW + 2)}px;width:${barW}px;height:${v}px`;
          canvas.appendChild(b);
        });
      };
      render();

      // Pre-compute merge steps
      const steps: { lo: number; hi: number; msg: string; type: 'split' | 'merge' }[] = [];
      const buildSteps = (lo: number, hi: number): void => {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        steps.push({ lo, hi, msg: `[Split] range [${lo}..${hi}] mid:${mid}`, type: 'split' });
        buildSteps(lo, mid);
        buildSteps(mid + 1, hi);
        steps.push({ lo, hi, msg: `[Merge] range [${lo}..${hi}]`, type: 'merge' });
      };
      buildSteps(0, N - 1);

      let si = 0;
      const tick = (): void => {
        if (si >= steps.length) {
          canvas.querySelectorAll('.bar').forEach(b => b.classList.add('sorted'));
          log('ok', `Merge Sort complete`);
          return;
        }
        const s = steps[si];
        if (s.type === 'split') {
          render([s.lo, s.hi]);
          log('info', s.msg);
        } else {
          // Perform actual merge
          const mid = Math.floor((s.lo + s.hi) / 2);
          const left = arr.slice(s.lo, mid + 1);
          const right = arr.slice(mid + 1, s.hi + 1);
          let i = 0, j = 0, k = s.lo;
          while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) { arr[k++] = left[i++]; }
            else { arr[k++] = right[j++]; }
          }
          while (i < left.length) arr[k++] = left[i++];
          while (j < right.length) arr[k++] = right[j++];
          render([s.lo, s.hi]);
          log('ok', s.msg);
        }
        si++;
      };

      return { tick, interval: 400 };
    },
  },

  // 12: DFS Graph Traversal
  {
    title: 'DFS Graph Traversal',
    desc: 'Depth-first search — explore as deep as possible before backtracking using a stack',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;
      const positions = [
        { x: cw / 2 - 20, y: 20 },
        { x: cw / 4 - 20, y: 110 },
        { x: (cw * 3) / 4 - 20, y: 110 },
        { x: cw / 6 - 20, y: 210 },
        { x: cw / 3 - 20, y: 210 },
        { x: (cw * 2) / 3 - 20, y: 210 },
        { x: (cw * 5) / 6 - 20, y: 210 },
      ];
      const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      edges.forEach(([a, b]) => {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(positions[a].x + 20)); l.setAttribute('y1', String(positions[a].y + 20));
        l.setAttribute('x2', String(positions[b].x + 20)); l.setAttribute('y2', String(positions[b].y + 20));
        l.setAttribute('stroke', '#2a3545'); l.setAttribute('stroke-width', '1.5');
        svg.appendChild(l);
      });
      canvas.appendChild(svg);

      const gnodes = positions.map((p, i) => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
        d.textContent = String(i);
        canvas.appendChild(d); return d;
      });

      const adjacency: number[][] = [[1, 2], [3, 4], [5, 6], [], [], [], []];
      const visited = new Array(7).fill(false) as boolean[];
      const stack: number[] = [0];
      visited[0] = true;
      gnodes[0].classList.replace('unvisited', 'visiting');

      const tick = (): void => {
        if (stack.length === 0) {
          log('ok', '[DFS] traversal complete — all reachable nodes visited');
          return;
        }
        const node = stack.pop()!;
        gnodes[node].classList.replace('visiting', 'visited');
        log('info', `[DFS] pop node:${node} stack:[${stack}]`);
        const neighbors = adjacency[node].slice().reverse();
        neighbors.forEach(n => {
          if (!visited[n]) {
            visited[n] = true;
            stack.push(n);
            gnodes[n].classList.replace('unvisited', 'visiting');
            log('info', `[DFS] push node:${n}`);
          }
        });
      };

      return { tick, interval: 900 };
    },
  },

  // 13: A* Pathfinding
  {
    title: 'A* Pathfinding',
    desc: 'Heuristic-guided shortest path on a grid — combines Dijkstra + greedy best-first',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const COLS = 16, ROWS = 10;
      const cw = canvas.offsetWidth - 40;
      const cellW = Math.floor(cw / COLS);
      const cellH = 26;

      const grid: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
      const cells: HTMLDivElement[][] = [];

      // Walls
      for (let i = 0; i < 30; i++) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if ((r !== 0 || c !== 0) && (r !== ROWS - 1 || c !== COLS - 1)) grid[r][c] = 1;
      }

      for (let r = 0; r < ROWS; r++) {
        cells[r] = [];
        for (let c = 0; c < COLS; c++) {
          const d = document.createElement('div');
          d.style.cssText = `position:absolute;left:${20 + c * cellW}px;top:${10 + r * cellH}px;width:${cellW - 1}px;height:${cellH - 1}px;border:1px solid var(--border);font-size:7px;display:flex;align-items:center;justify-content:center;transition:background .2s`;
          if (grid[r][c] === 1) {
            d.style.background = 'rgba(74,85,104,.4)';
            d.style.borderColor = 'rgba(74,85,104,.6)';
          }
          if (r === 0 && c === 0) { d.style.background = 'rgba(0,212,170,.2)'; d.style.borderColor = 'var(--accent)'; d.style.color = 'var(--accent)'; d.textContent = 'S'; }
          if (r === ROWS - 1 && c === COLS - 1) { d.style.background = 'rgba(255,107,53,.2)'; d.style.borderColor = 'var(--orange)'; d.style.color = 'var(--orange)'; d.textContent = 'G'; }
          canvas.appendChild(d);
          cells[r][c] = d;
        }
      }

      const heuristic = (r: number, c: number): number => Math.abs(r - (ROWS - 1)) + Math.abs(c - (COLS - 1));

      const gScore: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
      const fScore: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
      const cameFrom: [number, number][][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
      const closedSet = new Set<string>();
      const openSet: [number, number][] = [[0, 0]];
      gScore[0][0] = 0;
      fScore[0][0] = heuristic(0, 0);
      let found = false;
      let explored = 0;

      const tick = (): void => {
        if (found || openSet.length === 0) {
          if (!found) log('err', '[A*] no path found');
          return;
        }
        // Find lowest fScore in openSet
        let bestIdx = 0;
        for (let i = 1; i < openSet.length; i++) {
          if (fScore[openSet[i][0]][openSet[i][1]] < fScore[openSet[bestIdx][0]][openSet[bestIdx][1]]) bestIdx = i;
        }
        const [cr, cc] = openSet.splice(bestIdx, 1)[0];
        closedSet.add(`${cr},${cc}`);
        explored++;

        if (cr !== 0 || cc !== 0) {
          cells[cr][cc].style.background = 'rgba(79,195,247,.15)';
          cells[cr][cc].style.color = 'var(--dim)';
          cells[cr][cc].textContent = String(fScore[cr][cc]);
        }

        if (cr === ROWS - 1 && cc === COLS - 1) {
          found = true;
          // Trace path
          let pr = cr, pc = cc, pathLen = 0;
          while (cameFrom[pr][pc]) {
            const [fr, fc] = cameFrom[pr][pc];
            cells[fr][fc].style.background = 'rgba(0,212,170,.3)';
            cells[fr][fc].style.borderColor = 'var(--accent)';
            pr = fr; pc = fc; pathLen++;
          }
          log('ok', `[A*] path found! length:${pathLen} explored:${explored} nodes`);
          return;
        }

        const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (grid[nr][nc] === 1 || closedSet.has(`${nr},${nc}`)) continue;
          const tentG = gScore[cr][cc] + 1;
          if (tentG < gScore[nr][nc]) {
            cameFrom[nr][nc] = [cr, cc];
            gScore[nr][nc] = tentG;
            fScore[nr][nc] = tentG + heuristic(nr, nc);
            if (!openSet.some(([r, c]) => r === nr && c === nc)) {
              openSet.push([nr, nc]);
              cells[nr][nc].style.background = 'rgba(255,209,102,.1)';
            }
          }
        }
        log('info', `[A*] exploring (${cr},${cc}) f:${fScore[cr][cc]} open:${openSet.length}`);
      };

      return { tick, interval: 200 };
    },
  },

  // 14: Hash Table (Chaining)
  {
    title: 'Hash Table',
    desc: 'Hash function maps keys to buckets — collisions handled via chaining',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;
      const BUCKETS = 8;
      const bucketW = Math.floor((cw - 60) / BUCKETS) - 4;
      const buckets: string[][] = Array.from({ length: BUCKETS }, () => []);
      const bucketEls: HTMLDivElement[] = [];

      createLabel(canvas, 20, 5, '// hash table — 8 buckets, chaining collision resolution', 'font-size:9px;color:var(--dim);letter-spacing:.06em');

      for (let i = 0; i < BUCKETS; i++) {
        const b = document.createElement('div');
        b.style.cssText = `position:absolute;left:${20 + i * (bucketW + 4)}px;top:30px;width:${bucketW}px;min-height:50px;border:1px solid var(--border);padding:4px;font-size:8px;color:var(--dim);transition:all .3s`;
        b.innerHTML = `<div style="font-size:7px;color:var(--dim);margin-bottom:4px;text-align:center">[${i}]</div>`;
        canvas.appendChild(b);
        bucketEls.push(b);
      }

      const hash = (key: string): number => {
        let h = 0;
        for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) & 0x7fffffff;
        return h % BUCKETS;
      };

      const keys = ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy', 'karl', 'liam', 'mallory', 'nick'];
      let ops = 0;
      let collisions = 0;

      const renderBucket = (idx: number): void => {
        const items = buckets[idx];
        bucketEls[idx].innerHTML = `<div style="font-size:7px;color:var(--dim);margin-bottom:4px;text-align:center">[${idx}]</div>`;
        items.forEach(k => {
          const item = document.createElement('div');
          item.style.cssText = 'padding:2px 4px;margin:2px 0;background:rgba(0,212,170,.1);border:1px solid rgba(0,212,170,.3);color:var(--accent);font-size:7px;text-align:center';
          item.textContent = k;
          bucketEls[idx].appendChild(item);
        });
      };

      const tick = (): void => {
        ops++;
        bucketEls.forEach(b => { b.style.borderColor = 'var(--border)'; });

        if (Math.random() > 0.3 || ops <= 10) {
          // Insert
          const key = keys[Math.floor(Math.random() * keys.length)];
          const idx = hash(key);
          bucketEls[idx].style.borderColor = 'var(--accent)';
          if (buckets[idx].includes(key)) {
            log('warn', `[HashTable] PUT "${key}" hash:${idx} already exists`);
          } else {
            if (buckets[idx].length > 0) { collisions++; log('warn', `[HashTable] PUT "${key}" hash:${idx} COLLISION (chain:${buckets[idx].length + 1}) total:${collisions}`); }
            else { log('ok', `[HashTable] PUT "${key}" hash:${idx}`); }
            buckets[idx].push(key);
            renderBucket(idx);
          }
        } else {
          // Lookup
          const key = keys[Math.floor(Math.random() * keys.length)];
          const idx = hash(key);
          bucketEls[idx].style.borderColor = 'var(--yellow)';
          const found = buckets[idx].includes(key);
          if (found) log('ok', `[HashTable] GET "${key}" hash:${idx} FOUND (chain lookup:${buckets[idx].indexOf(key) + 1})`);
          else log('info', `[HashTable] GET "${key}" hash:${idx} NOT FOUND`);
        }
      };

      return { tick, interval: 700 };
    },
  },

  // 15: Binary Search Tree
  {
    title: 'Binary Search Tree',
    desc: 'Insert and search operations on a BST — left < root < right invariant',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;

      interface BSTNode { val: number; el: HTMLDivElement; left: BSTNode | null; right: BSTNode | null; x: number; y: number; }

      let root: BSTNode | null = null;
      const allNodes: BSTNode[] = [];
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      canvas.appendChild(svgEl);

      const createBSTNode = (val: number, x: number, y: number): BSTNode => {
        const d = document.createElement('div');
        d.className = 'gnode unvisited';
        d.style.cssText = `left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;font-size:10px`;
        d.textContent = String(val);
        canvas.appendChild(d);
        const node: BSTNode = { val, el: d, left: null, right: null, x, y };
        allNodes.push(node);
        return node;
      };

      const drawEdge = (p: BSTNode, c: BSTNode): void => {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(p.x)); l.setAttribute('y1', String(p.y));
        l.setAttribute('x2', String(c.x)); l.setAttribute('y2', String(c.y));
        l.setAttribute('stroke', '#2a3545'); l.setAttribute('stroke-width', '1.5');
        svgEl.appendChild(l);
      };

      const insert = (val: number): void => {
        if (!root) {
          root = createBSTNode(val, cw / 2, 40);
          root.el.classList.replace('unvisited', 'visited');
          log('ok', `[BST] insert root: ${val}`);
          return;
        }
        let cur = root;
        let depth = 1;
        const spread = cw / 4;
        while (true) {
          cur.el.classList.replace('unvisited', 'visiting');
          setTimeout(((n: BSTNode) => () => n.el.classList.replace('visiting', 'visited'))(cur), 300);
          if (val < cur.val) {
            if (!cur.left) {
              const x = cur.x - spread / depth;
              const y = cur.y + 60;
              cur.left = createBSTNode(val, x, y);
              drawEdge(cur, cur.left);
              cur.left.el.classList.replace('unvisited', 'visited');
              log('ok', `[BST] insert ${val} left of ${cur.val} (depth:${depth})`);
              return;
            }
            cur = cur.left;
          } else {
            if (!cur.right) {
              const x = cur.x + spread / depth;
              const y = cur.y + 60;
              cur.right = createBSTNode(val, x, y);
              drawEdge(cur, cur.right);
              cur.right.el.classList.replace('unvisited', 'visited');
              log('ok', `[BST] insert ${val} right of ${cur.val} (depth:${depth})`);
              return;
            }
            cur = cur.right;
          }
          depth++;
        }
      };

      const search = (val: number): void => {
        let cur = root;
        let path = '';
        while (cur) {
          cur.el.classList.replace('visited', 'visiting');
          setTimeout(((n: BSTNode) => () => n.el.classList.replace('visiting', 'visited'))(cur), 400);
          path += cur.val + ' ';
          if (val === cur.val) { log('ok', `[BST] search ${val} FOUND path: ${path.trim()}`); return; }
          cur = val < cur.val ? cur.left : cur.right;
        }
        log('err', `[BST] search ${val} NOT FOUND path: ${path.trim()}`);
      };

      const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 90];
      let idx = 0;
      const timeouts: ReturnType<typeof setTimeout>[] = [];

      const tick = (): void => {
        if (idx < 9) {
          insert(values[idx]);
        } else {
          const sv = values[Math.floor(Math.random() * Math.min(idx, values.length))];
          search(sv);
        }
        idx++;
        if (idx > 15) {
          // Reset
          allNodes.forEach(n => n.el.remove());
          allNodes.length = 0;
          svgEl.innerHTML = '';
          root = null;
          idx = 0;
          log('info', '[BST] reset — rebuilding tree');
        }
      };

      const cleanup = (): void => { timeouts.forEach(t => clearTimeout(t)); };
      return { tick, interval: 800, cleanup };
    },
  },

  // 16: Heap / Priority Queue
  {
    title: 'Min-Heap / Priority Queue',
    desc: 'Insert and extract-min on a binary min-heap — O(log n) operations',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;
      const heap: number[] = [];
      const heapEls: HTMLDivElement[] = [];
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      canvas.appendChild(svgEl);

      createLabel(canvas, 20, 5, '// min-heap — smallest element always at root', 'font-size:9px;color:var(--dim);letter-spacing:.06em');

      const posForIdx = (i: number): { x: number; y: number } => {
        const depth = Math.floor(Math.log2(i + 1));
        const posInLevel = i - (Math.pow(2, depth) - 1);
        const levelWidth = Math.pow(2, depth);
        const spacing = (cw - 40) / (levelWidth + 1);
        return { x: 20 + spacing * (posInLevel + 1), y: 35 + depth * 60 };
      };

      const renderHeap = (): void => {
        heapEls.forEach(e => e.remove());
        heapEls.length = 0;
        svgEl.innerHTML = '';
        heap.forEach((val, i) => {
          const pos = posForIdx(i);
          const d = document.createElement('div');
          d.className = 'gnode visited';
          d.style.cssText = `left:${pos.x - 18}px;top:${pos.y - 18}px;width:36px;height:36px;font-size:10px`;
          d.textContent = String(val);
          if (i === 0) { d.classList.remove('visited'); d.classList.add('visiting'); }
          canvas.appendChild(d);
          heapEls.push(d);
          // Draw edge to parent
          if (i > 0) {
            const parentPos = posForIdx(Math.floor((i - 1) / 2));
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', String(parentPos.x)); l.setAttribute('y1', String(parentPos.y));
            l.setAttribute('x2', String(pos.x)); l.setAttribute('y2', String(pos.y));
            l.setAttribute('stroke', '#2a3545'); l.setAttribute('stroke-width', '1.5');
            svgEl.appendChild(l);
          }
        });
      };

      const bubbleUp = (i: number): void => {
        while (i > 0) {
          const p = Math.floor((i - 1) / 2);
          if (heap[p] <= heap[i]) break;
          [heap[p], heap[i]] = [heap[i], heap[p]];
          i = p;
        }
      };

      const bubbleDown = (i: number): void => {
        while (true) {
          let smallest = i;
          const l = 2 * i + 1, r = 2 * i + 2;
          if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
          if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
          if (smallest === i) break;
          [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
          i = smallest;
        }
      };

      let ops = 0;
      const tick = (): void => {
        ops++;
        if (heap.length < 10 && (Math.random() > 0.3 || heap.length < 4)) {
          const val = Math.floor(Math.random() * 99) + 1;
          heap.push(val);
          bubbleUp(heap.length - 1);
          renderHeap();
          log('ok', `[Heap] insert ${val} size:${heap.length} min:${heap[0]}`);
        } else if (heap.length > 0) {
          const min = heap[0];
          heap[0] = heap[heap.length - 1];
          heap.pop();
          if (heap.length > 0) bubbleDown(0);
          renderHeap();
          log('info', `[Heap] extract-min: ${min} new-min:${heap[0] ?? 'empty'} size:${heap.length}`);
        }
        if (ops > 20) {
          heap.length = 0;
          heapEls.forEach(e => e.remove());
          heapEls.length = 0;
          svgEl.innerHTML = '';
          ops = 0;
          log('info', '[Heap] reset');
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 17: Stack & Queue
  {
    title: 'Stack & Queue',
    desc: 'LIFO stack (push/pop) vs FIFO queue (enqueue/dequeue) side by side',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;
      const half = Math.floor(cw / 2) - 30;

      // Divider
      const div = document.createElement('div');
      div.style.cssText = `position:absolute;left:${cw / 2}px;top:10px;width:1px;height:280px;background:var(--border)`;
      canvas.appendChild(div);

      createLabel(canvas, 20, 5, 'STACK (LIFO)', 'font-size:10px;color:var(--orange);font-weight:700;letter-spacing:.1em');
      createLabel(canvas, cw / 2 + 20, 5, 'QUEUE (FIFO)', 'font-size:10px;color:var(--blue);font-weight:700;letter-spacing:.1em');

      const stack: number[] = [];
      const queue: number[] = [];
      const stackContainer = document.createElement('div');
      stackContainer.style.cssText = `position:absolute;left:20px;top:30px;width:${half}px;height:250px`;
      canvas.appendChild(stackContainer);
      const queueContainer = document.createElement('div');
      queueContainer.style.cssText = `position:absolute;left:${cw / 2 + 20}px;top:30px;width:${half}px;height:250px`;
      canvas.appendChild(queueContainer);

      const renderStack = (): void => {
        stackContainer.innerHTML = '';
        stack.forEach((v, i) => {
          const d = document.createElement('div');
          const fromBottom = stack.length - 1 - i;
          d.style.cssText = `position:absolute;bottom:${fromBottom * 28}px;left:0;right:0;height:24px;background:rgba(255,107,53,.1);border:1px solid rgba(255,107,53,.3);color:var(--orange);font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:600`;
          d.textContent = String(v);
          if (i === 0) { d.style.background = 'rgba(255,107,53,.25)'; d.style.borderColor = 'var(--orange)'; }
          stackContainer.appendChild(d);
        });
        const topLabel = document.createElement('div');
        topLabel.style.cssText = `position:absolute;bottom:${stack.length * 28 + 4}px;left:0;font-size:7px;color:var(--dim);letter-spacing:.08em`;
        topLabel.textContent = stack.length > 0 ? 'TOP' : '';
        stackContainer.appendChild(topLabel);
      };

      const renderQueue = (): void => {
        queueContainer.innerHTML = '';
        queue.forEach((v, i) => {
          const d = document.createElement('div');
          d.style.cssText = `position:absolute;top:${i * 28}px;left:0;right:0;height:24px;background:rgba(79,195,247,.1);border:1px solid rgba(79,195,247,.3);color:var(--blue);font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:600`;
          d.textContent = String(v);
          if (i === 0) { d.style.background = 'rgba(79,195,247,.25)'; d.style.borderColor = 'var(--blue)'; }
          queueContainer.appendChild(d);
        });
        if (queue.length > 0) {
          const frontLabel = document.createElement('div');
          frontLabel.style.cssText = `position:absolute;top:-14px;left:0;font-size:7px;color:var(--dim);letter-spacing:.08em`;
          frontLabel.textContent = 'FRONT';
          queueContainer.appendChild(frontLabel);
          const backLabel = document.createElement('div');
          backLabel.style.cssText = `position:absolute;top:${queue.length * 28 + 2}px;left:0;font-size:7px;color:var(--dim);letter-spacing:.08em`;
          backLabel.textContent = 'BACK';
          queueContainer.appendChild(backLabel);
        }
      };

      let ops = 0;
      const tick = (): void => {
        ops++;
        const val = Math.floor(Math.random() * 99) + 1;

        if (stack.length < 7 && (Math.random() > 0.4 || stack.length < 2)) {
          stack.unshift(val);
          log('ok', `[Stack] PUSH ${val} size:${stack.length}`);
        } else if (stack.length > 0) {
          const popped = stack.shift()!;
          log('warn', `[Stack] POP ${popped} size:${stack.length}`);
        }

        if (queue.length < 7 && (Math.random() > 0.4 || queue.length < 2)) {
          queue.push(val);
          log('ok', `[Queue] ENQUEUE ${val} size:${queue.length}`);
        } else if (queue.length > 0) {
          const dequeued = queue.shift()!;
          log('warn', `[Queue] DEQUEUE ${dequeued} size:${queue.length}`);
        }

        renderStack();
        renderQueue();
      };

      return { tick, interval: 800 };
    },
  },

  // 18: Linked List Operations
  {
    title: 'Linked List',
    desc: 'Insert, delete, and traverse a singly linked list — pointer manipulation',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;

      interface LLNode { val: number; next: LLNode | null; }
      let head: LLNode | null = null;
      let size = 0;

      const renderList = (): void => {
        canvas.querySelectorAll('.ll-node,.ll-arrow,.ll-label').forEach(e => e.remove());
        let cur = head;
        let i = 0;
        const nodeW = 50;
        const gap = Math.min(80, (cw - 100) / 8);
        while (cur) {
          const d = document.createElement('div');
          d.className = 'll-node';
          d.style.cssText = `position:absolute;left:${20 + i * gap}px;top:100px;width:${nodeW}px;height:36px;border:1px solid rgba(0,212,170,.4);background:rgba(0,212,170,.08);color:var(--accent);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center`;
          d.textContent = String(cur.val);
          canvas.appendChild(d);

          if (cur.next) {
            const arrow = document.createElement('div');
            arrow.className = 'll-arrow';
            arrow.style.cssText = `position:absolute;left:${20 + i * gap + nodeW}px;top:114px;width:${gap - nodeW}px;height:1px;background:var(--dim)`;
            canvas.appendChild(arrow);
            const arrowHead = document.createElement('div');
            arrowHead.className = 'll-arrow';
            arrowHead.style.cssText = `position:absolute;left:${20 + (i + 1) * gap - 6}px;top:111px;font-size:10px;color:var(--dim)`;
            arrowHead.textContent = '>';
            canvas.appendChild(arrowHead);
          } else {
            const nullLabel = document.createElement('div');
            nullLabel.className = 'll-arrow';
            nullLabel.style.cssText = `position:absolute;left:${20 + i * gap + nodeW + 6}px;top:108px;font-size:8px;color:var(--red)`;
            nullLabel.textContent = 'NULL';
            canvas.appendChild(nullLabel);
          }
          cur = cur.next;
          i++;
        }
        if (!head) {
          const empty = document.createElement('div');
          empty.className = 'll-label';
          empty.style.cssText = 'position:absolute;left:20px;top:108px;font-size:10px;color:var(--dim)';
          empty.textContent = 'HEAD -> NULL (empty)';
          canvas.appendChild(empty);
        } else {
          const headLabel = document.createElement('div');
          headLabel.className = 'll-label';
          headLabel.style.cssText = 'position:absolute;left:20px;top:80px;font-size:8px;color:var(--dim);letter-spacing:.08em';
          headLabel.textContent = 'HEAD';
          canvas.appendChild(headLabel);
        }
      };
      renderList();

      let ops = 0;
      const tick = (): void => {
        ops++;
        const action = Math.random();

        if (size < 7 && (action > 0.35 || size < 3)) {
          const val = Math.floor(Math.random() * 99) + 1;
          if (Math.random() > 0.5 || !head) {
            // Insert at head
            const node: LLNode = { val, next: head };
            head = node;
            size++;
            log('ok', `[LL] insert HEAD ${val} size:${size}`);
          } else {
            // Insert at tail
            let cur = head;
            while (cur!.next) cur = cur!.next;
            cur!.next = { val, next: null };
            size++;
            log('ok', `[LL] insert TAIL ${val} size:${size}`);
          }
        } else if (head) {
          if (Math.random() > 0.5) {
            const removed = head.val;
            head = head.next;
            size--;
            log('warn', `[LL] delete HEAD ${removed} size:${size}`);
          } else {
            // Delete tail
            if (!head.next) {
              const removed = head.val;
              head = null; size--;
              log('warn', `[LL] delete TAIL ${removed} size:${size}`);
            } else {
              let cur = head;
              while (cur.next!.next) cur = cur.next!;
              const removed = cur.next!.val;
              cur.next = null; size--;
              log('warn', `[LL] delete TAIL ${removed} size:${size}`);
            }
          }
        }
        renderList();
      };

      return { tick, interval: 900 };
    },
  },

  // 19: Sliding Window
  {
    title: 'Sliding Window',
    desc: 'Find maximum sum subarray of size K — expand/contract window in O(n)',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const N = 14;
      const arr = Array.from({ length: N }, () => Math.floor(Math.random() * 20) + 1);
      const cw = canvas.offsetWidth - 60;
      const cellW = Math.floor(cw / N);
      const K = 4;

      createLabel(canvas, 20, 5, `// sliding window — find max sum of ${K} consecutive elements`, 'font-size:9px;color:var(--dim);letter-spacing:.06em');

      const cells: HTMLDivElement[] = [];
      arr.forEach((v, i) => {
        const d = document.createElement('div');
        d.style.cssText = `position:absolute;left:${20 + i * cellW}px;top:35px;width:${cellW - 2}px;height:40px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--dim);transition:all .3s`;
        d.textContent = String(v);
        canvas.appendChild(d);
        cells.push(d);
      });

      const windowEl = document.createElement('div');
      windowEl.style.cssText = `position:absolute;left:20px;top:32px;height:46px;border:2px solid var(--accent);background:rgba(0,212,170,.05);pointer-events:none;transition:all .4s ease`;
      canvas.appendChild(windowEl);

      const sumLabel = document.createElement('div');
      sumLabel.style.cssText = 'position:absolute;left:20px;top:90px;font-size:11px;color:var(--accent);font-weight:700';
      canvas.appendChild(sumLabel);

      const bestLabel = document.createElement('div');
      bestLabel.style.cssText = 'position:absolute;left:20px;top:110px;font-size:9px;color:var(--dim)';
      canvas.appendChild(bestLabel);

      let left = 0;
      let windowSum = 0;
      for (let i = 0; i < K; i++) windowSum += arr[i];
      let maxSum = windowSum;
      let maxLeft = 0;

      const render = (): void => {
        cells.forEach((c, i) => {
          if (i >= left && i < left + K) {
            c.style.color = 'var(--accent)';
            c.style.borderColor = 'rgba(0,212,170,.4)';
            c.style.background = 'rgba(0,212,170,.08)';
          } else {
            c.style.color = 'var(--dim)';
            c.style.borderColor = 'var(--border)';
            c.style.background = 'transparent';
          }
        });
        windowEl.style.left = (20 + left * cellW) + 'px';
        windowEl.style.width = (K * cellW) + 'px';
        sumLabel.textContent = `window sum: ${windowSum}`;
        bestLabel.textContent = `best: ${maxSum} at index [${maxLeft}..${maxLeft + K - 1}]`;
      };
      render();

      const tick = (): void => {
        if (left + K >= N) {
          log('ok', `[Window] complete! max sum:${maxSum} at [${maxLeft}..${maxLeft + K - 1}]`);
          left = 0;
          windowSum = 0;
          for (let i = 0; i < K; i++) windowSum += arr[i];
          maxSum = windowSum; maxLeft = 0;
          render();
          return;
        }
        windowSum -= arr[left];
        left++;
        windowSum += arr[left + K - 1];
        if (windowSum > maxSum) {
          maxSum = windowSum;
          maxLeft = left;
          log('ok', `[Window] [${left}..${left + K - 1}] sum:${windowSum} NEW MAX`);
        } else {
          log('info', `[Window] [${left}..${left + K - 1}] sum:${windowSum}`);
        }
        render();
      };

      return { tick, interval: 700 };
    },
  },

  // 20: Two Pointers
  {
    title: 'Two Pointers',
    desc: 'Find pair with target sum in sorted array — O(n) with left/right pointers',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const N = 12;
      const arr = Array.from({ length: N }, (_, i) => i * 3 + Math.floor(Math.random() * 3) + 1).sort((a, b) => a - b);
      const cw = canvas.offsetWidth - 60;
      const cellW = Math.floor(cw / N);

      let target = arr[2] + arr[N - 3];
      createLabel(canvas, 20, 5, `// two pointers — find pair summing to ${target}`, 'font-size:9px;color:var(--dim);letter-spacing:.06em');

      const cells: HTMLDivElement[] = [];
      arr.forEach((v, i) => {
        const d = document.createElement('div');
        d.style.cssText = `position:absolute;left:${20 + i * cellW}px;top:45px;width:${cellW - 2}px;height:40px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--dim);transition:all .3s`;
        d.textContent = String(v);
        canvas.appendChild(d);
        cells.push(d);
      });

      const leftLabel = document.createElement('div');
      leftLabel.style.cssText = 'position:absolute;top:90px;font-size:8px;color:var(--accent);font-weight:700;letter-spacing:.06em;transition:left .4s';
      leftLabel.textContent = 'L';
      canvas.appendChild(leftLabel);

      const rightLabel = document.createElement('div');
      rightLabel.style.cssText = 'position:absolute;top:90px;font-size:8px;color:var(--orange);font-weight:700;letter-spacing:.06em;transition:left .4s';
      rightLabel.textContent = 'R';
      canvas.appendChild(rightLabel);

      const sumEl = document.createElement('div');
      sumEl.style.cssText = 'position:absolute;left:20px;top:115px;font-size:10px;color:var(--dim)';
      canvas.appendChild(sumEl);

      let lo = 0, hi = N - 1;
      let found = false;
      let rounds = 0;

      const render = (): void => {
        cells.forEach((c, i) => {
          c.style.borderColor = 'var(--border)'; c.style.color = 'var(--dim)'; c.style.background = 'transparent';
        });
        cells[lo].style.borderColor = 'var(--accent)'; cells[lo].style.color = 'var(--accent)'; cells[lo].style.background = 'rgba(0,212,170,.08)';
        cells[hi].style.borderColor = 'var(--orange)'; cells[hi].style.color = 'var(--orange)'; cells[hi].style.background = 'rgba(255,107,53,.08)';
        leftLabel.style.left = (20 + lo * cellW + cellW / 2 - 4) + 'px';
        rightLabel.style.left = (20 + hi * cellW + cellW / 2 - 4) + 'px';
        sumEl.textContent = `arr[${lo}] + arr[${hi}] = ${arr[lo]} + ${arr[hi]} = ${arr[lo] + arr[hi]}  |  target: ${target}`;
      };
      render();

      const tick = (): void => {
        if (found || lo >= hi) {
          // Reset with new target
          lo = 0; hi = N - 1; found = false; rounds++;
          target = arr[Math.floor(Math.random() * 4) + 1] + arr[N - 1 - Math.floor(Math.random() * 4)];
          canvas.querySelectorAll('div').forEach(d => {
            if (d.style.cssText.includes('font-size:9px') && d.textContent?.includes('two pointers')) {
              d.textContent = `// two pointers — find pair summing to ${target}`;
            }
          });
          render();
          log('info', `[2Ptr] new round #${rounds} target:${target}`);
          return;
        }

        const sum = arr[lo] + arr[hi];
        render();

        if (sum === target) {
          found = true;
          cells[lo].style.background = 'rgba(0,212,170,.25)';
          cells[hi].style.background = 'rgba(0,212,170,.25)';
          log('ok', `[2Ptr] FOUND! arr[${lo}]+arr[${hi}] = ${arr[lo]}+${arr[hi]} = ${target}`);
        } else if (sum < target) {
          log('info', `[2Ptr] sum ${sum} < ${target}, move L right`);
          lo++;
        } else {
          log('info', `[2Ptr] sum ${sum} > ${target}, move R left`);
          hi--;
        }
      };

      return { tick, interval: 700 };
    },
  },

  // 21: Dynamic Programming (Fibonacci)
  {
    title: 'Dynamic Programming',
    desc: 'Fibonacci with memoization — top-down vs bottom-up, O(n) vs O(2^n)',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log } = ctx;
      const cw = canvas.offsetWidth;
      const N = 14;
      const dp = new Array(N).fill(-1);
      dp[0] = 0; dp[1] = 1;
      const cellW = Math.floor((cw - 60) / N) - 2;

      createLabel(canvas, 20, 5, '// dynamic programming — fibonacci with memoization table', 'font-size:9px;color:var(--dim);letter-spacing:.06em');
      createLabel(canvas, 20, 25, 'index:', 'font-size:8px;color:var(--dim)');
      createLabel(canvas, 20, 65, 'dp[i]:', 'font-size:8px;color:var(--dim)');

      const idxEls: HTMLDivElement[] = [];
      const valEls: HTMLDivElement[] = [];

      for (let i = 0; i < N; i++) {
        const idx = document.createElement('div');
        idx.style.cssText = `position:absolute;left:${60 + i * (cellW + 2)}px;top:22px;width:${cellW}px;height:24px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--dim)`;
        idx.textContent = String(i);
        canvas.appendChild(idx);
        idxEls.push(idx);

        const val = document.createElement('div');
        val.style.cssText = `position:absolute;left:${60 + i * (cellW + 2)}px;top:60px;width:${cellW}px;height:28px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--dim);transition:all .3s`;
        val.textContent = dp[i] >= 0 ? String(dp[i]) : '?';
        if (dp[i] >= 0) { val.style.background = 'rgba(0,212,170,.1)'; val.style.borderColor = 'rgba(0,212,170,.3)'; val.style.color = 'var(--accent)'; }
        canvas.appendChild(val);
        valEls.push(val);
      }

      // Recursive call tree visual
      const treeLabel = document.createElement('div');
      treeLabel.style.cssText = 'position:absolute;left:20px;top:110px;font-size:9px;color:var(--dim);letter-spacing:.06em';
      treeLabel.textContent = '// naive recursive calls (exponential) vs memoized (linear)';
      canvas.appendChild(treeLabel);

      const statsEl = document.createElement('div');
      statsEl.style.cssText = 'position:absolute;left:20px;top:135px;font-size:9px;line-height:2';
      canvas.appendChild(statsEl);

      let currentN = 2;
      let naiveCalls = 0;
      let memoCalls = 0;

      // Count naive recursive calls
      const countNaive = (n: number): number => {
        if (n <= 1) return 1;
        return 1 + countNaive(n - 1) + countNaive(n - 2);
      };

      const tick = (): void => {
        if (currentN >= N) {
          log('ok', `[DP] Fibonacci table complete! fib(${N - 1})=${dp[N - 1]}`);
          log('ok', `[DP] Memoized: ${memoCalls} calls vs Naive: ${naiveCalls} calls`);
          // Reset
          currentN = 2;
          for (let i = 2; i < N; i++) {
            dp[i] = -1;
            valEls[i].textContent = '?';
            valEls[i].style.background = 'transparent';
            valEls[i].style.borderColor = 'var(--border)';
            valEls[i].style.color = 'var(--dim)';
          }
          naiveCalls = 0; memoCalls = 0;
          return;
        }

        // Highlight dependencies
        valEls.forEach(v => v.style.borderColor = v.style.borderColor === 'rgba(0, 212, 170, 0.3)' ? 'rgba(0,212,170,.3)' : 'var(--border)');
        valEls[currentN - 1].style.borderColor = 'var(--yellow)';
        valEls[currentN - 2].style.borderColor = 'var(--yellow)';

        dp[currentN] = dp[currentN - 1] + dp[currentN - 2];
        memoCalls++;
        naiveCalls = countNaive(currentN);

        valEls[currentN].textContent = String(dp[currentN]);
        valEls[currentN].style.background = 'rgba(0,212,170,.1)';
        valEls[currentN].style.borderColor = 'rgba(0,212,170,.3)';
        valEls[currentN].style.color = 'var(--accent)';

        statsEl.innerHTML = `memoized calls: <span style="color:var(--accent)">${memoCalls}</span> | naive would need: <span style="color:var(--red)">${naiveCalls}</span>`;

        log('ok', `[DP] fib(${currentN}) = fib(${currentN - 1}) + fib(${currentN - 2}) = ${dp[currentN - 1]} + ${dp[currentN - 2]} = ${dp[currentN]}  memo:${memoCalls} vs naive:${naiveCalls}`);
        currentN++;
      };

      return { tick, interval: 800 };
    },
  },
];
