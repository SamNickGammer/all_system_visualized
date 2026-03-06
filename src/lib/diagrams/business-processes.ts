import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode } from '@/lib/helpers';

export const businessProcessesDiagrams: DiagramDef[] = [
  // 0: Order Lifecycle
  {
    title: 'Order Lifecycle',
    desc: 'Placed -> Payment -> Warehouse -> Shipped -> Delivered',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      canvas.innerHTML = '';

      const stages: { l: string; s: string; c: string }[] = [
        { l: 'Order Placed', s: 'cart checkout', c: 'np' },
        { l: 'Payment', s: 'stripe/paypal', c: 'ny' },
        { l: 'Warehouse', s: 'picking+pack', c: 'nb' },
        { l: 'Shipped', s: 'FedEx/UPS', c: 'no' },
        { l: 'Delivered', s: 'door delivery', c: 'ng' },
      ];

      const cx: number = canvas.offsetWidth;
      const gap: number = Math.floor((cx - 40) / stages.length);
      const els: HTMLDivElement[] = stages.map((s, i) =>
        createNode(canvas, 20 + i * gap, 100, gap - 20, s.l, s.s, s.c)
      );

      let orders: number = 0;
      let cur: number = 0;

      const msgs: ((id: number) => string)[] = [
        (id) => `[Order #${id}] placed $${(Math.random() * 200 + 10).toFixed(2)} cart:${Math.floor(Math.random() * 5 + 1)} items`,
        (id) => `[Payment #${id}] authorized card ending 4242`,
        (id) => `[Warehouse] order #${id} picked and packed`,
        (id) => `[Shipping] order #${id} dispatched tracking:1Z${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        (id) => `[Delivery] order #${id} delivered to customer`,
      ];

      const tick = (): void => {
        els.forEach((e) => e.classList.remove('active'));
        if (cur === 0) orders++;
        els[cur].classList.add('active');
        log(cur === 4 ? 'ok' : cur === 1 ? 'warn' : 'info', msgs[cur](orders));
        cur = (cur + 1) % stages.length;
      };

      return { tick, interval: 900 };
    },
  },

  // 1: User Onboarding Funnel
  {
    title: 'User Onboarding Funnel',
    desc: 'Signup -> verify -> activate -> retain -- with dropoff rates',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      canvas.innerHTML = '';

      const funnelStages: { label: string; pct: number; color: string }[] = [
        { label: 'Visited', pct: 100, color: '#4fc3f7' },
        { label: 'Signed Up', pct: 60, color: '#7c6af7' },
        { label: 'Verified Email', pct: 40, color: '#ffd166' },
        { label: 'Onboarded', pct: 25, color: '#ff6b35' },
        { label: 'Retained D7', pct: 12, color: '#00d4aa' },
      ];

      const cx: number = canvas.offsetWidth - 80;

      funnelStages.forEach((s, i) => {
        const w: number = Math.floor(cx * s.pct / 100);
        const bar: HTMLDivElement = document.createElement('div');
        bar.className = 'funnel-bar';
        bar.style.cssText = `left:40px;top:${20 + i * 54}px;width:${w}px;background:${s.color}18;border-color:${s.color}55;color:${s.color}`;
        bar.textContent = s.label;
        const pct: HTMLSpanElement = document.createElement('span');
        pct.style.cssText = 'margin-left:auto;font-size:8px;opacity:.7';
        pct.textContent = s.pct + '%';
        bar.appendChild(pct);
        canvas.appendChild(bar);
      });

      let users: number = 10000;

      const tick = (): void => {
        users += Math.floor(Math.random() * 500 + 100);
        const si: number = Math.floor(Math.random() * 5);
        log(
          si === 4 ? 'ok' : si === 3 ? 'warn' : 'info',
          `[Funnel] ${funnelStages[si].label}: ${Math.floor(users * funnelStages[si].pct / 100)} users`
        );
      };

      return { tick, interval: 1100 };
    },
  },

  // 2: Git Branching Flow
  {
    title: 'Git Branching Flow',
    desc: 'feature -> PR -> review -> merge -> release cycle',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      canvas.innerHTML = '';

      const cx: number = canvas.offsetWidth;
      const main: HTMLDivElement = createNode(canvas, cx / 2 - 60, 20, 120, 'main', 'production', 'ng');
      const develop: HTMLDivElement = createNode(canvas, cx / 2 - 60, 100, 120, 'develop', 'integration', 'nb');
      const feat1: HTMLDivElement = createNode(canvas, 40, 180, 130, 'feature/auth', 'in-progress', 'np');
      const feat2: HTMLDivElement = createNode(canvas, cx / 2 - 65, 180, 130, 'feature/ui', 'in-progress', 'np');
      const feat3: HTMLDivElement = createNode(canvas, cx - 170, 180, 130, 'hotfix/bug', 'urgent', 'nr');
      const pr: HTMLDivElement = createNode(canvas, cx / 2 - 60, 270, 130, 'Pull Request', 'open for review', 'ny');

      const events: (() => void)[] = [
        () => { flashNode(feat1, 400); log('info', '[Git] commit: feat/auth add JWT validation'); },
        () => { flashNode(feat2, 400); log('info', '[Git] commit: feat/ui redesign dashboard components'); },
        () => { flashNode(pr, 400); log('warn', '[PR #42] feat/auth -> develop opened for review'); },
        () => { flashNode(develop, 400); log('ok', '[Merge] feat/auth merged into develop'); },
        () => { flashNode(feat3, 400); log('err', '[Hotfix] critical bug in prod -> hotfix/v1.2.1'); },
        () => { flashNode(main, 400); log('ok', '[Release] v1.2.1 tagged and deployed to production'); },
      ];

      let si: number = 0;

      const tick = (): void => {
        events[si % events.length]();
        si++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 3: Incident Management
  {
    title: 'Incident Management',
    desc: 'Alert -> triage -> escalation -> resolution -> postmortem',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      canvas.innerHTML = '';

      const cx: number = canvas.offsetWidth;
      const alert: HTMLDivElement = createNode(canvas, 30, 130, 90, 'Alert', 'PagerDuty', 'nr');
      const triage: HTMLDivElement = createNode(canvas, cx / 5, 130, 90, 'Triage', 'on-call eng', 'ny');
      const escalate: HTMLDivElement = createNode(canvas, cx / 5 * 2, 130, 100, 'Escalate', 'eng lead', 'no');
      const mitigate: HTMLDivElement = createNode(canvas, cx / 5 * 3, 130, 100, 'Mitigate', 'rollback/fix', 'nb');
      const resolve: HTMLDivElement = createNode(canvas, cx / 5 * 4, 130, 100, 'Resolve', 'verify+close', 'ng');

      const severity: string[] = ['SEV1', 'SEV2', 'SEV3'];
      const colors: ('err' | 'warn' | 'info')[] = ['err', 'warn', 'info'];
      const stages: HTMLDivElement[] = [alert, triage, escalate, mitigate, resolve];

      let si: number = 0;
      let incId: number = 0;

      const tick = (): void => {
        stages.forEach((s) => s.classList.remove('active'));
        stages[si].classList.add('active');

        if (si === 0) {
          incId = Math.floor(Math.random() * 9000 + 1000);
          const sevIdx: number = Math.floor(Math.random() * 3);
          const sev: string = severity[sevIdx];
          log(colors[sevIdx], `[${sev}] INC-${incId} error_rate >5% latency_p99 >2s`);
        } else if (si === 1) {
          log('warn', `[INC-${incId}] on-call acknowledged, investigating`);
        } else if (si === 2) {
          log('warn', `[INC-${incId}] escalated to eng lead + stakeholders`);
        } else if (si === 3) {
          log('info', `[INC-${incId}] mitigation: reverted bad deploy`);
        } else {
          log('ok', `[INC-${incId}] resolved MTTR:${Math.floor(Math.random() * 40 + 5)}min`);
        }

        si = (si + 1) % stages.length;
      };

      return { tick, interval: 1000 };
    },
  },

  // 4: A/B Test Traffic Split
  {
    title: 'A/B Test Traffic Split',
    desc: 'Traffic split -> variant assignment -> conversion tracking',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      canvas.innerHTML = '';

      const cx: number = canvas.offsetWidth;
      const traffic: HTMLDivElement = createNode(canvas, cx / 2 - 60, 20, 120, 'Traffic', '100% users', 'nb');
      const split: HTMLDivElement = createNode(canvas, cx / 2 - 60, 100, 120, 'Splitter', '50/50 random', 'ny');
      const varA: HTMLDivElement = createNode(canvas, 80, 200, 130, 'Variant A', 'control (old)', 'np');
      const varB: HTMLDivElement = createNode(canvas, cx - 210, 200, 130, 'Variant B', 'treatment (new)', 'no');
      const results: HTMLDivElement = createNode(canvas, cx / 2 - 80, 290, 160, 'Analytics', 'conversion tracking', 'ng');

      let convA: number = 0;
      let convB: number = 0;
      let totalA: number = 0;
      let totalB: number = 0;

      const statEl: HTMLDivElement = document.createElement('div');
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statEl);

      const updateStats = (): void => {
        const ra: string = totalA ? ((convA / totalA) * 100).toFixed(1) : '0';
        const rb: string = totalB ? ((convB / totalB) * 100).toFixed(1) : '0';
        statEl.innerHTML = `A convert: <span style="color:var(--purple)">${ra}%</span>  B convert: <span style="color:var(--orange)">${rb}%</span>`;
      };

      const tick = (): void => {
        const isB: boolean = Math.random() > 0.5;
        flashNode(split, 200);
        flashNode(isB ? varB : varA, 300);

        const converted: boolean = Math.random() < (isB ? 0.12 : 0.08);

        if (isB) {
          totalB++;
          if (converted) {
            convB++;
            flashNode(results, 300);
          }
        } else {
          totalA++;
          if (converted) {
            convA++;
            flashNode(results, 300);
          }
        }

        if (converted) {
          log('ok', `[Variant ${isB ? 'B' : 'A'}] conversion event user:${Math.floor(Math.random() * 9999)}`);
        } else {
          log('info', `[Variant ${isB ? 'B' : 'A'}] visit, no conversion`);
        }

        updateStats();
      };

      return { tick, interval: 600 };
    },
  },
];
