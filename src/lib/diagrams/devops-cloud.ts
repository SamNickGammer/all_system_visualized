import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode, createZone, createLabel } from '@/lib/helpers';

export const devopsCloudDiagrams: DiagramDef[] = [
  // 0: Terraform Plan → Apply
  {
    title: 'Terraform Plan → Apply',
    desc: 'Infrastructure as Code lifecycle — plan, diff, apply, state management',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const gap = Math.floor((cx - 40) / 5);

      const stateFile = createNode(canvas, 20, 100, gap - 10, 'State File', '.tfstate', 'node-blue');
      const plan = createNode(canvas, 20 + gap, 100, gap - 10, 'terraform plan', 'diff compute', 'node-yellow');
      const diff = createNode(canvas, 20 + gap * 2, 100, gap - 10, 'Diff Output', '+3 ~1 -0', 'node-orange');
      const apply = createNode(canvas, 20 + gap * 3, 100, gap - 10, 'terraform apply', 'execute', 'node-purple');
      const cloud = createNode(canvas, 20 + gap * 4, 100, gap - 10, 'Cloud Resources', 'AWS/GCP', 'node-green');

      const resources: string[] = ['aws_ec2_instance.web', 'aws_s3_bucket.data', 'aws_rds.db', 'aws_lambda.func', 'aws_vpc.main'];
      const stages: HTMLDivElement[] = [stateFile, plan, diff, apply, cloud];
      let si = 0;
      let applied = 0;

      const tick = (): void => {
        stages.forEach(s => s.classList.remove('active'));
        stages[si].classList.add('active');
        if (si === 0) {
          log('info', '[Terraform] reading state file, refreshing resources');
        } else if (si === 1) {
          const r = resources[Math.floor(Math.random() * resources.length)];
          log('info', `[Plan] + ${r} will be created`);
        } else if (si === 2) {
          const add = Math.floor(Math.random() * 3 + 1);
          const chg = Math.floor(Math.random() * 2);
          log('warn', `[Diff] Plan: ${add} to add, ${chg} to change, 0 to destroy`);
        } else if (si === 3) {
          applied++;
          log('info', `[Apply] applying changes... (${applied} resources modified)`);
        } else {
          log('ok', `[Apply] apply complete — ${applied} resources in state`);
        }
        si = (si + 1) % stages.length;
      };

      return { tick, interval: 1000 };
    },
  },

  // 1: Docker Container Lifecycle
  {
    title: 'Docker Container Lifecycle',
    desc: 'Build image layers, run containers, stop, restart — full lifecycle',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const stageDefs: { l: string; s: string; c: string }[] = [
        { l: 'Dockerfile', s: 'FROM node:18', c: 'node-blue' },
        { l: 'docker build', s: 'layer caching', c: 'node-yellow' },
        { l: 'Image', s: 'sha256:a3f2...', c: 'node-purple' },
        { l: 'docker run', s: '-p 3000:3000', c: 'node-orange' },
        { l: 'Running', s: 'container up', c: 'node-green' },
        { l: 'docker stop', s: 'SIGTERM', c: 'node-red' },
      ];

      const gap = Math.floor((cx - 40) / stageDefs.length);
      const els: HTMLDivElement[] = stageDefs.map((s, i) =>
        createNode(canvas, 20 + i * gap, 100, gap - 15, s.l, s.s, s.c)
      );

      let si = 0;
      let containers = 0;
      const layers: string[] = ['COPY package*.json', 'RUN npm install', 'COPY . .', 'RUN npm build', 'EXPOSE 3000'];

      const tick = (): void => {
        els.forEach(e => e.classList.remove('active'));
        els[si].classList.add('active');
        if (si === 0) {
          log('info', '[Docker] parsing Dockerfile — 5 instructions');
        } else if (si === 1) {
          const l = layers[Math.floor(Math.random() * layers.length)];
          const cached = Math.random() > 0.5;
          log(cached ? 'ok' : 'info', `[Build] ${l} ${cached ? '→ CACHED' : '→ running'}`);
        } else if (si === 2) {
          log('info', `[Image] built sha:${Math.random().toString(16).slice(2, 10)} size:142MB`);
        } else if (si === 3) {
          containers++;
          log('info', `[Run] container #${containers} starting on port 3000`);
        } else if (si === 4) {
          log('ok', `[Container] healthy PID:${Math.floor(Math.random() * 9000 + 1000)} uptime:${Math.floor(Math.random() * 300)}s`);
        } else {
          log('warn', '[Stop] SIGTERM sent → graceful shutdown 10s');
        }
        si = (si + 1) % els.length;
      };

      return { tick, interval: 900 };
    },
  },

  // 2: Service Mesh (Istio/Envoy)
  {
    title: 'Service Mesh (Istio)',
    desc: 'Sidecar proxy pattern with mTLS, traffic routing, and observability',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const istiod = createNode(canvas, cx / 2 - 60, 10, 120, 'Istiod', 'control plane', 'node-purple');
      const svcA = createNode(canvas, 40, 130, 110, 'Service A', 'order-svc', 'node-blue');
      const envoyA = createNode(canvas, 40, 210, 110, 'Envoy Proxy', 'sidecar A', 'node-yellow');
      const envoyB = createNode(canvas, cx - 160, 210, 110, 'Envoy Proxy', 'sidecar B', 'node-yellow');
      const svcB = createNode(canvas, cx - 160, 130, 110, 'Service B', 'payment-svc', 'node-green');

      // mTLS tunnel indicator
      createZone(canvas, 160, 205, cx - 330, 30, 'rgba(0,212,170,.3)', 'rgba(0,212,170,.03)');
      createLabel(canvas, 165, 192, '// mTLS encrypted', 'font-size:8px;color:rgba(0,212,170,.5);letter-spacing:.08em');

      const steps: (() => void)[] = [
        () => { flashNode(istiod, 400); log('info', '[Istiod] pushing config + certs to sidecars'); },
        () => { flashNode(svcA, 400); log('info', '[Service A] outbound request to payment-svc'); },
        () => { flashNode(envoyA, 400); log('info', '[Envoy A] intercepted → mTLS encrypt → route to sidecar B'); },
        () => { flashNode(envoyB, 400); log('info', '[Envoy B] mTLS decrypt → verify cert → forward to Service B'); },
        () => { flashNode(svcB, 400); log('ok', '[Service B] processed request → 200 OK'); },
        () => { flashNode(envoyB, 400); log('info', '[Envoy B] response → mTLS encrypt → return'); },
        () => { flashNode(envoyA, 400); const lat = Math.floor(Math.random() * 15 + 3); log('ok', `[Envoy A] response delivered to Service A lat:${lat}ms`); },
        () => { flashNode(istiod, 400); log('info', '[Istiod] telemetry: request_count++ latency_p99=12ms'); },
      ];

      let si = 0;

      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 3: Serverless Cold Start
  {
    title: 'Serverless Cold Start',
    desc: 'Lambda lifecycle — cold init, warm execution, scale to zero',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const stageDefs: { l: string; s: string; c: string }[] = [
        { l: 'API Request', s: 'GET /process', c: 'node-blue' },
        { l: 'Lambda Runtime', s: 'provision env', c: 'node-purple' },
        { l: 'Init (Cold)', s: 'load deps', c: 'node-red' },
        { l: 'Execute', s: 'handler()', c: 'node-green' },
        { l: 'Response', s: '200 OK', c: 'node-green' },
        { l: 'Scale to Zero', s: 'idle timeout', c: 'node-yellow' },
      ];

      const gap = Math.floor((cx - 40) / stageDefs.length);
      const els: HTMLDivElement[] = stageDefs.map((s, i) =>
        createNode(canvas, 20 + i * gap, 100, gap - 15, s.l, s.s, s.c)
      );

      let si = 0;
      let invocations = 0;
      let coldStarts = 0;

      // Stat display at bottom
      const statEl: HTMLDivElement = document.createElement('div') as HTMLDivElement;
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statEl);

      const updateStats = (): void => {
        statEl.innerHTML = `invocations: <span style="color:var(--accent)">${invocations}</span>  cold_starts: <span style="color:var(--red)">${coldStarts}</span>  warm: <span style="color:var(--accent)">${invocations - coldStarts}</span>`;
      };
      updateStats();

      const tick = (): void => {
        els.forEach(e => e.classList.remove('active'));
        els[si].classList.add('active');
        if (si === 0) {
          invocations++;
          log('info', `[API] incoming request #${invocations}`);
        } else if (si === 1) {
          log('info', '[Lambda] provisioning execution environment');
        } else if (si === 2) {
          const cold = Math.random() > 0.6;
          if (cold) {
            coldStarts++;
            log('err', `[Cold Start] initializing runtime +${Math.floor(Math.random() * 800 + 200)}ms`);
          } else {
            log('ok', '[Warm] reusing existing container');
          }
        } else if (si === 3) {
          const dur = Math.floor(Math.random() * 100 + 10);
          log('info', `[Execute] handler completed in ${dur}ms`);
        } else if (si === 4) {
          log('ok', '[Response] 200 OK returned to client');
        } else {
          log('warn', '[Idle] no requests for 5min → scaling to zero');
        }
        updateStats();
        si = (si + 1) % els.length;
      };

      return { tick, interval: 900 };
    },
  },

  // 4: Blue/Green Deployment
  {
    title: 'Blue/Green Deployment',
    desc: 'Zero-downtime deployment by switching traffic between environments',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const lb = createNode(canvas, cx / 2 - 60, 20, 120, 'Load Balancer', 'traffic router', 'node-yellow');
      const blue = createNode(canvas, 80, 150, 150, 'Blue (v1.0)', 'ACTIVE — 3 pods', 'node-blue');
      const green = createNode(canvas, cx - 230, 150, 150, 'Green (v1.1)', 'STANDBY — 3 pods', 'node-green');
      const users = createNode(canvas, cx / 2 - 50, 270, 100, 'Users', '100% traffic', 'node-purple');

      let phase = 0;
      const phases: string[] = ['active-blue', 'deploy-green', 'test-green', 'switch', 'active-green', 'cleanup'];

      const tick = (): void => {
        const p = phases[phase % phases.length];
        blue.classList.remove('active');
        green.classList.remove('active');
        lb.classList.remove('active');

        if (p === 'active-blue') {
          blue.classList.add('active');
          log('info', '[Blue] serving 100% traffic — v1.0 stable');
        } else if (p === 'deploy-green') {
          green.classList.add('active');
          log('info', '[Green] deploying v1.1 to standby environment');
        } else if (p === 'test-green') {
          green.classList.add('active');
          log('warn', '[Green] running smoke tests + health checks');
        } else if (p === 'switch') {
          lb.classList.add('active');
          green.classList.add('active');
          const greenSub = green.querySelector('.sub') as HTMLDivElement | null;
          if (greenSub) greenSub.textContent = 'ACTIVE — 3 pods';
          const blueSub = blue.querySelector('.sub') as HTMLDivElement | null;
          if (blueSub) blueSub.textContent = 'STANDBY — 3 pods';
          log('ok', '[LB] switching traffic: Blue→Green 100%');
        } else if (p === 'active-green') {
          green.classList.add('active');
          log('ok', '[Green] serving 100% traffic — v1.1 live');
        } else {
          blue.classList.add('active');
          const blueSub = blue.querySelector('.sub') as HTMLDivElement | null;
          if (blueSub) blueSub.textContent = 'ACTIVE — 3 pods';
          const greenSub = green.querySelector('.sub') as HTMLDivElement | null;
          if (greenSub) greenSub.textContent = 'STANDBY — 3 pods';
          log('info', '[Cleanup] previous blue env ready for next deploy');
        }
        phase++;
      };

      // suppress unused variable — users node is placed visually
      void users;

      return { tick, interval: 1200 };
    },
  },
];
