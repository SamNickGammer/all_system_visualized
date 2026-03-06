import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';

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
];
