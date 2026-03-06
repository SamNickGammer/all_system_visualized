import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode, createZone, createLabel } from '@/lib/helpers';

export const databasesStorageDiagrams: DiagramDef[] = [
  // 0: B-Tree Index Lookup
  {
    title: 'B-Tree Index Lookup',
    desc: 'Query traverses index tree from root \u2192 internal \u2192 leaf \u2192 data row',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const root = createNode(canvas, cx / 2 - 60, 20, 120, 'Root Node', '[30 | 60]', 'node-purple');
      const int0 = createNode(canvas, cx / 4 - 60, 110, 120, 'Internal', '[10 | 20]', 'node-blue');
      const int1 = createNode(canvas, cx / 2 - 60, 110, 120, 'Internal', '[40 | 50]', 'node-blue');
      const int2 = createNode(canvas, cx * 3 / 4 - 60, 110, 120, 'Internal', '[70 | 80]', 'node-blue');
      const leaf0 = createNode(canvas, 40, 200, 90, 'Leaf', '[8,9,10]', 'node-yellow');
      const leaf1 = createNode(canvas, cx / 4, 200, 90, 'Leaf', '[20,25]', 'node-yellow');
      const leaf2 = createNode(canvas, cx / 2 - 45, 200, 90, 'Leaf', '[42,45]', 'node-yellow');
      const leaf3 = createNode(canvas, cx * 3 / 4 - 45, 200, 90, 'Leaf', '[72,78]', 'node-yellow');
      const dataRow = createNode(canvas, cx / 2 - 50, 290, 100, 'Data Row', 'rowid found', 'node-green');

      const levels: HTMLDivElement[][] = [
        [root],
        [int0, int1, int2],
        [leaf0, leaf1, leaf2, leaf3],
        [dataRow],
      ];
      const keys: number[] = [42, 10, 78, 25, 45, 72, 8, 20, 50, 80];
      let searchIdx = 0;
      let step = 0;
      let targetKey = 0;

      const tick = (): void => {
        levels.flat().forEach((n) => n.classList.remove('active'));

        if (step === 0) {
          targetKey = keys[searchIdx % keys.length];
          searchIdx++;
          log('info', `[Query] SELECT * WHERE key = ${targetKey}`);
          step++;
        } else if (step <= 4) {
          const level = Math.min(step - 1, 3);
          const node = levels[level][Math.floor(Math.random() * levels[level].length)];
          node.classList.add('active');

          if (level === 0) log('info', `[Root] key=${targetKey} \u2192 scanning root node`);
          else if (level === 1) log('info', '[Internal] navigating to child pointer');
          else if (level === 2) log('info', `[Leaf] scanning leaf page for key=${targetKey}`);
          else log('ok', `[Found] key=${targetKey} \u2192 rowid:${Math.floor(Math.random() * 9000 + 1000)} \u2713`);

          step++;
          if (step > 4) step = 0;
        }
      };

      return { tick, interval: 800 };
    },
  },

  // 1: MVCC
  {
    title: 'MVCC',
    desc: 'Multi-Version Concurrency Control \u2014 snapshot isolation for concurrent transactions',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const txA = createNode(canvas, 40, 50, 120, 'Transaction A', 'READ (snapshot)', 'node-blue');
      const txB = createNode(canvas, cx - 170, 50, 130, 'Transaction B', 'WRITE', 'node-orange');
      const table = createNode(canvas, cx / 2 - 70, 140, 140, 'Table: orders', 'row_id=1', 'node-purple');
      const v1 = createNode(canvas, 40, 240, 110, 'Version 1', 'val="old" xmin=100', 'node-yellow');
      const v2 = createNode(canvas, cx / 2 - 55, 240, 110, 'Version 2', 'val="mid" xmin=105', 'node-yellow');
      const v3 = createNode(canvas, cx - 160, 240, 110, 'Version 3', 'val="new" xmin=110', 'node-green');

      let step = 0;

      const steps: (() => void)[] = [
        () => { flashNode(txA); log('info', '[Tx A] BEGIN \u2014 snapshot at xid=105'); },
        () => { flashNode(txB); log('info', '[Tx B] BEGIN \u2014 xid=110'); },
        () => { flashNode(txB); flashNode(table); log('warn', '[Tx B] UPDATE orders SET val="new" WHERE id=1'); },
        () => { flashNode(v3); log('info', '[MVCC] new version created xmin=110, old version retained'); },
        () => { flashNode(txA); flashNode(v2); log('ok', '[Tx A] SELECT \u2192 reads Version 2 (snapshot sees xmin<=105)'); },
        () => { flashNode(txB); log('ok', '[Tx B] COMMIT \u2014 version 3 now visible to new transactions'); },
        () => { flashNode(txA); flashNode(v2); log('info', '[Tx A] still reads Version 2 (consistent snapshot)'); },
        () => { log('ok', '[Tx A] COMMIT \u2014 snapshot released, old versions eligible for vacuum'); },
      ];

      const tick = (): void => {
        steps[step % steps.length]();
        step++;
      };

      return { tick, interval: 1200 };
    },
  },

  // 2: Write-Ahead Log (WAL)
  {
    title: 'Write-Ahead Log (WAL)',
    desc: 'Write path: query \u2192 WAL buffer \u2192 WAL file \u2192 memtable \u2192 SSTable flush',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const gap = Math.floor((cx - 40) / 5);

      const query = createNode(canvas, 20, 100, gap - 10, 'Client Query', 'INSERT/UPDATE', 'node-blue');
      const walBuf = createNode(canvas, 20 + gap, 100, gap - 10, 'WAL Buffer', 'in-memory', 'node-yellow');
      const walFile = createNode(canvas, 20 + gap * 2, 100, gap - 10, 'WAL File', 'disk (append)', 'node-orange');
      const mem = createNode(canvas, 20 + gap * 3, 100, gap - 10, 'Memtable', 'sorted tree', 'node-purple');
      const sst = createNode(canvas, 20 + gap * 4, 100, gap - 10, 'SSTable', 'immutable file', 'node-green');
      const stages: HTMLDivElement[] = [query, walBuf, walFile, mem, sst];

      let si = 0;
      let writes = 0;
      let flushes = 0;

      const statEl = document.createElement('div');
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statEl);

      const updateStats = (): void => {
        statEl.innerHTML = `wal_writes: <span style="color:var(--orange)">${writes}</span>  memtable_size: <span style="color:var(--purple)">${writes % 50}MB</span>  flushes: <span style="color:var(--accent)">${flushes}</span>`;
      };
      updateStats();

      const tick = (): void => {
        stages.forEach((s) => s.classList.remove('active'));
        stages[si].classList.add('active');

        if (si === 0) {
          writes++;
          log('info', `[Query] INSERT INTO events VALUES(${Math.floor(Math.random() * 9999)})`);
        } else if (si === 1) {
          log('info', '[WAL Buffer] buffering write in memory');
        } else if (si === 2) {
          log('info', `[WAL] fsync to disk \u2014 offset:${writes * 64}B durable \u2713`);
        } else if (si === 3) {
          log('info', `[Memtable] inserted into sorted tree (${writes % 50}MB/64MB)`);
        } else {
          if (writes % 50 < 5) {
            flushes++;
            log('ok', `[Flush] memtable \u2192 SSTable #${flushes} (compaction eligible)`);
          } else {
            log('info', '[SSTable] awaiting memtable threshold for flush');
          }
        }

        updateStats();
        si = (si + 1) % stages.length;
      };

      return { tick, interval: 800 };
    },
  },

  // 3: Sharding Strategies
  {
    title: 'Sharding Strategies',
    desc: 'Hash-based routing of queries across database shards',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const router = createNode(canvas, cx / 2 - 60, 20, 120, 'Query Router', 'hash(key)%3', 'node-yellow');
      const shards: HTMLDivElement[] = [
        createNode(canvas, 60, 160, 130, 'Shard 0', 'keys: hash%3=0', 'node-blue'),
        createNode(canvas, cx / 2 - 65, 160, 130, 'Shard 1', 'keys: hash%3=1', 'node-purple'),
        createNode(canvas, cx - 190, 160, 130, 'Shard 2', 'keys: hash%3=2', 'node-green'),
      ];

      const counts: number[] = [0, 0, 0];
      const keys: string[] = ['user_42', 'order_999', 'product_7', 'session_abc', 'cart_123', 'txn_456', 'user_88', 'log_321'];
      let qi = 0;

      const tick = (): void => {
        const key = keys[qi % keys.length];
        qi++;

        let hash = 0;
        for (let i = 0; i < key.length; i++) {
          hash = ((hash << 5) - hash) + key.charCodeAt(i);
        }
        const shardIdx = Math.abs(hash) % 3;
        counts[shardIdx]++;

        flashNode(router, 400);
        flashNode(shards[shardIdx], 400);

        const sub = shards[shardIdx].querySelector('.sub') as HTMLDivElement | null;
        if (sub) sub.textContent = `rows: ${counts[shardIdx]}`;

        log('ok', `[Router] key="${key}" \u2192 hash:${Math.abs(hash) % 1000} \u2192 Shard ${shardIdx} (total:${counts[shardIdx]})`);
      };

      return { tick, interval: 800 };
    },
  },

  // 4: Connection Pooling
  {
    title: 'Connection Pooling',
    desc: 'App threads share a pool of database connections \u2014 acquire, use, release',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const threads: HTMLDivElement[] = [
        createNode(canvas, 20, 40, 100, 'Thread 1', 'app worker', 'node-blue'),
        createNode(canvas, 20, 110, 100, 'Thread 2', 'app worker', 'node-blue'),
        createNode(canvas, 20, 180, 100, 'Thread 3', 'app worker', 'node-blue'),
        createNode(canvas, 20, 250, 100, 'Thread 4', 'app worker', 'node-blue'),
      ];

      // Pool zone
      createZone(
        canvas,
        cx / 2 - 80, 30, 160, 240,
        'rgba(124,106,247,.3)',
        'rgba(124,106,247,.03)'
      );

      // Pool label
      createLabel(
        canvas,
        cx / 2 - 75, 15,
        '// connection pool (max:4)',
        'font-size:8px;color:var(--purple);letter-spacing:.08em'
      );

      const slots: HTMLDivElement[] = [];
      for (let i = 0; i < 4; i++) {
        const s = createNode(canvas, cx / 2 - 65, 45 + i * 58, 130, `Conn ${i}`, 'idle', 'node-green');
        slots.push(s);
      }

      const db = createNode(canvas, cx - 140, 120, 110, 'PostgreSQL', 'port 5432', 'node-orange');

      const pool = { active: 0, idle: 4, waiting: 0 };

      // Stat display
      const statEl = document.createElement('div');
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statEl);

      const updateStats = (): void => {
        statEl.innerHTML = `active: <span style="color:var(--orange)">${pool.active}</span>  idle: <span style="color:var(--accent)">${pool.idle}</span>  waiting: <span style="color:var(--red)">${pool.waiting}</span>`;
      };
      updateStats();

      const tick = (): void => {
        const action = Math.random();

        if (action < 0.5) {
          // acquire
          const idle = slots.findIndex((s) => {
            const sub = s.querySelector('.sub') as HTMLDivElement | null;
            return sub?.textContent === 'idle';
          });
          const ti = Math.floor(Math.random() * 4);
          flashNode(threads[ti], 300);

          if (idle >= 0) {
            const sub = slots[idle].querySelector('.sub') as HTMLDivElement | null;
            if (sub) sub.textContent = 'active';
            slots[idle].className = 'node node-orange';
            pool.active++;
            pool.idle--;
            log('ok', `[Pool] Thread ${ti + 1} acquired Conn ${idle} (${pool.active}/4 active)`);
          } else {
            pool.waiting++;
            log('warn', `[Pool] Thread ${ti + 1} waiting \u2014 no idle connections (queue:${pool.waiting})`);
          }
        } else {
          // release
          const active = slots.findIndex((s) => {
            const sub = s.querySelector('.sub') as HTMLDivElement | null;
            return sub?.textContent === 'active';
          });

          if (active >= 0) {
            const sub = slots[active].querySelector('.sub') as HTMLDivElement | null;

            if (pool.waiting > 0) {
              pool.waiting--;
              log('info', `[Pool] Conn ${active} released \u2192 immediately given to waiting thread`);
            } else {
              if (sub) sub.textContent = 'idle';
              slots[active].className = 'node node-green';
              pool.active--;
              pool.idle++;
              log('info', `[Pool] Conn ${active} released back to pool (${pool.idle}/4 idle)`);
            }

            flashNode(db, 200);
          }
        }

        updateStats();
      };

      return { tick, interval: 700 };
    },
  },
];
