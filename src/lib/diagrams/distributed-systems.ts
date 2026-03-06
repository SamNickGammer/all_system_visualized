import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode, flyPkt, createSvgOverlay } from '@/lib/helpers';

export const distributedSystemsDiagrams: DiagramDef[] = [
  // 0: Load Balancer
  {
    title: 'Load Balancer',
    desc: 'Round-robin traffic distribution across a server pool',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const svg = createSvgOverlay(canvas);
      const lb = createNode(canvas, canvas.offsetWidth / 2 - 60, 20, 120, 'Load Balancer', 'nginx / HAProxy', 'node-green');
      const s0 = createNode(canvas, 80, 160, 110, 'Server 0', 'req: 0', 'node-blue');
      const s1 = createNode(canvas, canvas.offsetWidth / 2 - 55, 160, 110, 'Server 1', 'req: 0', 'node-blue');
      const s2 = createNode(canvas, canvas.offsetWidth - 190, 160, 110, 'Server 2', 'req: 0', 'node-blue');
      const clients = [
        createNode(canvas, 20, 280, 80, 'Client A', '', 'node-purple'),
        createNode(canvas, canvas.offsetWidth / 2 - 40, 280, 80, 'Client B', '', 'node-purple'),
        createNode(canvas, canvas.offsetWidth - 100, 280, 80, 'Client C', '', 'node-purple'),
      ];
      const servers = [s0, s1, s2];
      const counts = [0, 0, 0];
      let rr = 0;

      const tick = () => {
        const ci = Math.floor(Math.random() * 3);
        const si = rr % 3;
        rr++;
        flashNode(servers[si], 400);
        counts[si]++;
        const sub = servers[si].querySelector('.sub');
        if (sub) sub.textContent = `req: ${counts[si]}`;
        const lbr = lb.getBoundingClientRect();
        const cr = canvas.getBoundingClientRect();
        const sx = lbr.left - cr.left + 60;
        const sy = lbr.top - cr.top + 25;
        const sr = servers[si].getBoundingClientRect();
        const ex = sr.left - cr.left + 55;
        const ey = sr.top - cr.top;
        flyPkt(canvas, { sx, sy, ex, ey, color: '#4fc3f7', label: 'REQ', duration: 500 });
        log('ok', `[LB] Client\u2192Server${si} (round-robin #${rr}) total:${counts[si]}`);
      };

      return { tick, interval: 900 };
    },
  },

  // 1: CDN
  {
    title: 'CDN Request Routing',
    desc: 'User request routing through edge nodes to origin server',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      createNode(canvas, cx / 2 - 40, 10, 80, 'User', 'browser', 'node-purple');
      const edges = [
        createNode(canvas, 40, 120, 110, 'Edge \u2014 SG', 'Singapore PoP', 'node-blue'),
        createNode(canvas, cx / 2 - 55, 120, 110, 'Edge \u2014 US', 'New York PoP', 'node-blue'),
        createNode(canvas, cx - 150, 120, 110, 'Edge \u2014 EU', 'Frankfurt PoP', 'node-blue'),
      ];
      const origin = createNode(canvas, cx / 2 - 55, 240, 110, 'Origin Server', 'cloud infra', 'node-orange');
      let step = 0;
      const steps: Array<() => void> = [
        () => { flashNode(edges[0], 400); log('ok', '[CDN] User\u2192Edge-SG: cache MISS'); },
        () => { flashNode(origin, 400); log('warn', '[CDN] Edge-SG\u2192Origin: fetch content'); },
        () => { flashNode(edges[0], 400); log('ok', '[CDN] Origin\u2192Edge-SG: cached TTL=3600s'); },
        () => { log('info', '[CDN] Next req: Edge-SG cache HIT (0ms)'); },
        () => { flashNode(edges[1], 400); log('ok', '[CDN] User\u2192Edge-US: cache HIT'); },
        () => { flashNode(edges[2], 400); log('ok', '[CDN] User\u2192Edge-EU: cache HIT'); },
      ];

      const tick = () => {
        steps[step % steps.length]();
        step++;
      };

      return { tick, interval: 1100 };
    },
  },

  // 2: Kubernetes
  {
    title: 'Kubernetes Pod Scheduling',
    desc: 'Scheduler assigns pods to nodes based on available resources',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const nodesData = [
        { label: 'Node 0', cpu: 'CPU: 2/4', x: 20, y: 60 },
        { label: 'Node 1', cpu: 'CPU: 1/4', x: 220, y: 60 },
        { label: 'Node 2', cpu: 'CPU: 3/4', x: 420, y: 60 },
      ];
      createNode(canvas, canvas.offsetWidth / 2 - 60, 10, 120, 'kube-scheduler', 'control plane', 'node-yellow');
      const nodeEls = nodesData.map(n => createNode(canvas, n.x, n.y, 160, n.label, n.cpu, 'node-blue'));
      const podCounts = [0, 0, 0];
      const cpuUsage = [2, 1, 3];

      const tick = () => {
        const si = cpuUsage.indexOf(Math.min(...cpuUsage));
        cpuUsage[si]++;
        podCounts[si]++;
        flashNode(nodeEls[si], 400);
        const sub = nodeEls[si].querySelector('.sub');
        if (sub) sub.textContent = `CPU: ${cpuUsage[si]}/4 pods:${podCounts[si]}`;
        const apps = ['nginx', 'redis', 'api-svc', 'worker', 'postgres', 'metrics'];
        const app = apps[Math.floor(Math.random() * apps.length)];
        log('ok', `[Scheduler] pod/${app} \u2192 node-${si} (cpu:${cpuUsage[si]}/4)`);
        if (cpuUsage[si] >= 4) {
          cpuUsage[si] = 0;
          log('warn', `[Node-${si}] evicting old pod (CPU limit)`);
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 3: DB Replication
  {
    title: 'Database Replication',
    desc: 'Primary writes propagate to replicas with replication lag',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const primary = createNode(canvas, cx / 2 - 60, 20, 120, 'Primary DB', 'writes: 0', 'node-green');
      const replicas = [
        createNode(canvas, 60, 160, 130, 'Replica 0', 'lag: 0ms', 'node-blue'),
        createNode(canvas, cx / 2 - 65, 160, 130, 'Replica 1', 'lag: 0ms', 'node-blue'),
        createNode(canvas, cx - 190, 160, 130, 'Replica 2', 'lag: 0ms', 'node-blue'),
      ];
      let writes = 0;
      const lags = [0, 0, 0];

      const tick = () => {
        writes++;
        const primarySub = primary.querySelector('.sub');
        if (primarySub) primarySub.textContent = `writes: ${writes}`;
        flashNode(primary, 300);
        replicas.forEach((r, i) => {
          const delay = 50 + Math.floor(Math.random() * 200);
          lags[i] = delay;
          setTimeout(() => {
            flashNode(r, 300);
            const sub = r.querySelector('.sub');
            if (sub) sub.textContent = `lag: ${delay}ms`;
            log('ok', `[Replica-${i}] WAL applied offset:${writes} lag:${delay}ms`);
          }, delay);
        });
        log('info', `[Primary] COMMIT write #${writes}`);
      };

      return { tick, interval: 1100 };
    },
  },

  // 4: Microservices
  {
    title: 'Microservices / API Gateway',
    desc: 'API gateway fans out requests to downstream services',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      createNode(canvas, 40, 130, 100, 'Client', 'mobile/web', 'node-purple');
      const gw = createNode(canvas, 220, 130, 120, 'API Gateway', 'auth + route', 'node-green');
      const svcs = [
        createNode(canvas, cx - 200, 40, 130, 'Order Service', 'REST', 'node-blue'),
        createNode(canvas, cx - 200, 110, 130, 'Payment Svc', 'gRPC', 'node-orange'),
        createNode(canvas, cx - 200, 180, 130, 'Inventory Svc', 'REST', 'node-yellow'),
        createNode(canvas, cx - 200, 250, 130, 'Notify Svc', 'async', 'node-purple'),
      ];
      const svcNames = ['order-svc', 'payment-svc', 'inventory-svc', 'notify-svc'];

      const tick = () => {
        const i = Math.floor(Math.random() * 4);
        flashNode(gw, 300);
        flashNode(svcs[i], 400);
        const codes = ['200 OK', '200 OK', '200 OK', '201 CREATED', '400 ERR'];
        const code = codes[Math.floor(Math.random() * codes.length)];
        log(code.includes('ERR') ? 'err' : 'ok', `[Gateway] \u2192 ${svcNames[i]} \u2192 ${code}`);
      };

      return { tick, interval: 800 };
    },
  },

  // 5: CI/CD Pipeline
  {
    title: 'CI/CD Pipeline',
    desc: 'Code commit flows through build, test, and deploy stages',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const stages = [
        { l: 'Commit', s: 'git push', c: 'node-purple' },
        { l: 'Build', s: 'docker build', c: 'node-blue' },
        { l: 'Test', s: 'jest + e2e', c: 'node-yellow' },
        { l: 'Scan', s: 'snyk / sonar', c: 'node-orange' },
        { l: 'Deploy', s: 'k8s rollout', c: 'node-green' },
      ];
      const gap = Math.floor((canvas.offsetWidth - 40) / stages.length);
      const els = stages.map((s, i) => createNode(canvas, 20 + i * gap, 100, gap - 20, s.l, s.s, s.c));
      let cur = 0;

      const tick = () => {
        els.forEach(e => e.classList.remove('active'));
        els[cur].classList.add('active');
        const msgs = [
          '[Git] new commit on main branch',
          `[CI] building image sha:${Math.random().toString(16).slice(2, 10)}`,
          '[Test] 342 passed, 0 failed',
          '[Scan] no critical CVEs found',
          '[CD] rolling update \u2192 production \u2713',
        ];
        const types: Array<'info' | 'ok'> = ['info', 'ok', 'ok', 'ok', 'ok'];
        log(types[cur], msgs[cur]);
        cur = (cur + 1) % stages.length;
      };

      return { tick, interval: 1000 };
    },
  },

  // 6: Kafka
  {
    title: 'Kafka Topic Flow',
    desc: 'Producers, partitioned topic, consumer groups \u2014 see dedicated file',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const producers = [
        createNode(canvas, 30, 60, 110, 'order-svc', 'producer', 'node-green'),
        createNode(canvas, 30, 150, 110, 'payment-svc', 'producer', 'node-green'),
        createNode(canvas, 30, 240, 110, 'inventory-svc', 'producer', 'node-green'),
      ];
      const partitions = [
        createNode(canvas, cx / 2 - 70, 40, 140, 'Partition 0', 'offset:0', 'node-purple'),
        createNode(canvas, cx / 2 - 70, 130, 140, 'Partition 1', 'offset:0', 'node-purple'),
        createNode(canvas, cx / 2 - 70, 220, 140, 'Partition 2', 'offset:0', 'node-purple'),
      ];
      const consumers = [
        createNode(canvas, cx - 150, 60, 130, 'analytics', 'consumer', 'node-orange'),
        createNode(canvas, cx - 150, 150, 130, 'notify-svc', 'consumer', 'node-orange'),
        createNode(canvas, cx - 150, 240, 130, 'audit-svc', 'consumer', 'node-orange'),
      ];
      const offsets = [0, 0, 0];
      const msgs = ['ORD', 'PAY', 'STK'];

      const tick = () => {
        const pi = Math.floor(Math.random() * 3);
        const pro = Math.floor(Math.random() * 3);
        offsets[pi]++;
        flashNode(producers[pro], 300);
        flashNode(partitions[pi], 300);
        const sub = partitions[pi].querySelector('.sub');
        if (sub) sub.textContent = `offset:${offsets[pi]}`;
        if (Math.random() > 0.4) {
          flashNode(consumers[pi], 300);
        }
        log('ok', `[P${pro}\u2192Part${pi}] ${msgs[pro]} off:${offsets[pi]}`);
      };

      return { tick, interval: 700 };
    },
  },

  // 7: Event Sourcing / CQRS
  {
    title: 'Event Sourcing / CQRS',
    desc: 'Commands produce events \u2192 append to event store \u2192 project to read models',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const cmd = createNode(canvas, 30, 60, 110, 'Command', 'CreateOrder', 'node-purple');
      const handler = createNode(canvas, 180, 60, 120, 'Command Handler', 'validate+exec', 'node-blue');
      const store = createNode(canvas, cx / 2 - 60, 60, 130, 'Event Store', 'append-only log', 'node-orange');
      const bus = createNode(canvas, cx / 2 - 60, 170, 130, 'Event Bus', 'publish events', 'node-yellow');
      const readModel = createNode(canvas, cx - 170, 110, 140, 'Read Model', 'materialized view', 'node-green');
      const queryApi = createNode(canvas, cx - 170, 220, 140, 'Query API', 'GET /orders', 'node-green');
      let offset = 0;
      const events = ['OrderCreated', 'PaymentReceived', 'ItemShipped', 'OrderCancelled', 'RefundIssued'];
      let si = 0;

      const steps: Array<() => void> = [
        () => {
          flashNode(cmd, 400);
          flashNode(handler, 400);
          log('info', '[Command] CreateOrder cmd received, validating...');
        },
        () => {
          flashNode(store, 400);
          offset++;
          const evt = events[Math.floor(Math.random() * events.length)];
          log('info', `[EventStore] ${evt} appended offset:${offset}`);
        },
        () => {
          flashNode(bus, 400);
          log('info', '[EventBus] publishing event to subscribers');
        },
        () => {
          flashNode(readModel, 400);
          log('ok', '[ReadModel] projection updated \u2014 order count++');
        },
        () => {
          flashNode(queryApi, 400);
          log('ok', '[Query] GET /orders \u2192 200 OK (eventually consistent)');
        },
      ];

      const tick = () => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 8: Circuit Breaker
  {
    title: 'Circuit Breaker Pattern',
    desc: 'CLOSED \u2192 OPEN \u2192 HALF-OPEN state machine protecting against cascading failures',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const client = createNode(canvas, 30, 130, 100, 'Client', 'requests', 'node-purple');
      const breaker = createNode(canvas, cx / 2 - 70, 130, 140, 'Circuit Breaker', 'state: CLOSED', 'node-green');
      const service = createNode(canvas, cx - 160, 130, 120, 'Downstream Svc', 'external API', 'node-blue');
      const closed = createNode(canvas, cx / 4 - 40, 260, 80, 'CLOSED', 'normal', 'node-green');
      const open = createNode(canvas, cx / 2 - 40, 260, 80, 'OPEN', 'blocking', 'node-red');
      const half = createNode(canvas, cx * 3 / 4 - 40, 260, 80, 'HALF-OPEN', 'probing', 'node-yellow');
      let failures = 0;
      let successes = 0;
      let state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
      let reqCount = 0;
      const threshold = 4;

      const tick = () => {
        reqCount++;
        flashNode(client, 300);
        closed.classList.remove('active');
        open.classList.remove('active');
        half.classList.remove('active');

        if (state === 'CLOSED') {
          closed.classList.add('active');
          const fail = Math.random() > 0.6;
          if (fail) {
            failures++;
            flashNode(service, 300);
            log('err', `[CB] request #${reqCount} FAILED (${failures}/${threshold} failures)`);
            if (failures >= threshold) {
              state = 'OPEN';
              const sub = breaker.querySelector('.sub');
              if (sub) sub.textContent = 'state: OPEN';
              breaker.className = 'node node-red';
              log('err', '[CB] threshold reached \u2192 state: OPEN (blocking requests)');
            }
          } else {
            successes++;
            flashNode(service, 300);
            log('ok', `[CB] request #${reqCount} succeeded (failures:${failures})`);
          }
        } else if (state === 'OPEN') {
          open.classList.add('active');
          log('warn', `[CB] request #${reqCount} BLOCKED \u2014 circuit is OPEN`);
          if (Math.random() > 0.6) {
            state = 'HALF-OPEN';
            const sub = breaker.querySelector('.sub');
            if (sub) sub.textContent = 'state: HALF-OPEN';
            breaker.className = 'node node-yellow';
            log('warn', '[CB] timeout elapsed \u2192 state: HALF-OPEN (allowing probe)');
          }
        } else {
          half.classList.add('active');
          const probeOk = Math.random() > 0.4;
          if (probeOk) {
            state = 'CLOSED';
            failures = 0;
            const sub = breaker.querySelector('.sub');
            if (sub) sub.textContent = 'state: CLOSED';
            breaker.className = 'node node-green';
            flashNode(service, 300);
            log('ok', '[CB] probe succeeded \u2192 state: CLOSED \u2713');
          } else {
            state = 'OPEN';
            const sub = breaker.querySelector('.sub');
            if (sub) sub.textContent = 'state: OPEN';
            breaker.className = 'node node-red';
            log('err', '[CB] probe failed \u2192 state: OPEN again');
          }
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 9: Saga Pattern
  {
    title: 'Saga Pattern',
    desc: 'Orchestrator coordinates distributed transactions with compensation on failure',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const orch = createNode(canvas, cx / 2 - 60, 140, 120, 'Orchestrator', 'saga coordinator', 'node-yellow');
      const svcs = [
        createNode(canvas, cx / 2 - 60, 20, 120, 'Order Service', 'step 1', 'node-blue'),
        createNode(canvas, cx - 160, 80, 120, 'Payment Service', 'step 2', 'node-green'),
        createNode(canvas, cx - 160, 200, 120, 'Inventory Service', 'step 3', 'node-purple'),
        createNode(canvas, cx / 2 - 60, 270, 120, 'Shipping Service', 'step 4', 'node-orange'),
      ];
      const svcNames = ['Order', 'Payment', 'Inventory', 'Shipping'];
      let sagaId = 0;
      let step = 0;
      let compensating = false;
      let compStep = 0;

      const tick = () => {
        svcs.forEach(s => s.classList.remove('active'));
        orch.classList.remove('active');

        if (!compensating) {
          if (step === 0) {
            sagaId++;
            orch.classList.add('active');
            log('info', `[Saga #${sagaId}] starting new saga`);
          } else if (step <= 4) {
            const si = step - 1;
            orch.classList.add('active');
            svcs[si].classList.add('active');
            const fail = step === 3 && Math.random() > 0.65;
            if (fail) {
              log('err', `[${svcNames[si]}] FAILED \u2014 insufficient stock`);
              compensating = true;
              compStep = si - 1;
              log('warn', `[Saga #${sagaId}] initiating compensation rollback`);
            } else {
              log('ok', `[${svcNames[si]}] step ${step}/4 completed \u2713`);
            }
          } else {
            orch.classList.add('active');
            log('ok', `[Saga #${sagaId}] all steps completed \u2713 transaction committed`);
            step = -1;
          }
          step++;
        } else {
          if (compStep >= 0) {
            orch.classList.add('active');
            svcs[compStep].classList.add('active');
            log('warn', `[${svcNames[compStep]}] compensating \u2192 undo step ${compStep + 1}`);
            compStep--;
          } else {
            orch.classList.add('active');
            log('err', `[Saga #${sagaId}] fully rolled back \u2014 saga aborted`);
            compensating = false;
            step = 0;
          }
        }
      };

      return { tick, interval: 1000 };
    },
  },
];
