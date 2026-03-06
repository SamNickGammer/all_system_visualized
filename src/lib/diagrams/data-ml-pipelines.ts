import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode } from '@/lib/helpers';

export const dataMlPipelinesDiagrams: DiagramDef[] = [
  // 0: ETL Pipeline
  {
    title: 'ETL Pipeline',
    desc: 'Extract → Transform → Load with row counters and error handling',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const gap = Math.floor((cx - 40) / 5);

      const sources = createNode(canvas, 20, 80, gap - 10, 'Sources', 'postgres/s3/api', 'node-blue');
      const extract = createNode(canvas, 20 + gap, 80, gap - 10, 'Extract', 'read raw', 'node-purple');
      const transform = createNode(canvas, 20 + gap * 2, 80, gap - 10, 'Transform', 'clean+join', 'node-yellow');
      const validate = createNode(canvas, 20 + gap * 3, 80, gap - 10, 'Validate', 'schema check', 'node-orange');
      const load = createNode(canvas, 20 + gap * 4, 80, gap - 10, 'Load', 'data warehouse', 'node-green');

      const stats = { rows: 0, errs: 0, loaded: 0 };
      const statEl = document.createElement('div');
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;color:var(--dim);line-height:2';
      canvas.appendChild(statEl);

      const updateStats = (): void => {
        statEl.innerHTML = `rows_extracted: <span style="color:var(--blue)">${stats.rows}</span><br>errors: <span style="color:var(--red)">${stats.errs}</span><br>rows_loaded: <span style="color:var(--accent)">${stats.loaded}</span>`;
      };
      updateStats();

      const stages = [sources, extract, transform, validate, load];
      let si = 0;

      const tick = (): void => {
        stages.forEach(s => s.classList.remove('active'));
        stages[si].classList.add('active');
        const batch = Math.floor(Math.random() * 500 + 200);
        if (si === 0) {
          stats.rows += batch;
          log('info', `[Extract] reading batch ${batch} rows from sources`);
        } else if (si === 1) {
          log('info', '[Transform] normalize, dedupe, join lookups');
        } else if (si === 2) {
          const e = Math.floor(Math.random() * 5);
          stats.errs += e;
          log(e > 2 ? 'warn' : 'info', `[Validate] schema check: ${batch - e} ok, ${e} rejected`);
        } else if (si === 3) {
          log('info', '[Validate] type coercion, null checks passed');
        } else {
          stats.loaded += batch;
          log('ok', `[Load] ${batch} rows committed to warehouse`);
        }
        updateStats();
        si = (si + 1) % stages.length;
      };

      return { tick, interval: 900 };
    },
  },

  // 1: Spark Streaming
  {
    title: 'Spark Data Stream',
    desc: 'Partitioned RDD transformations across worker nodes',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      createNode(canvas, cx / 2 - 60, 10, 120, 'Kafka Source', 'input stream', 'node-orange');
      createNode(canvas, cx / 2 - 60, 80, 120, 'Spark Master', 'coordinator', 'node-yellow');
      const workers = [
        createNode(canvas, 40, 170, 120, 'Worker 0', 'partition 0-3', 'node-blue'),
        createNode(canvas, cx / 2 - 60, 170, 120, 'Worker 1', 'partition 4-7', 'node-blue'),
        createNode(canvas, cx - 160, 170, 120, 'Worker 2', 'partition 8-11', 'node-blue'),
      ];
      createNode(canvas, cx / 2 - 60, 270, 120, 'Output Sink', 'iceberg/delta', 'node-green');

      let total = 0;

      const tick = (): void => {
        const wi = Math.floor(Math.random() * 3);
        flashNode(workers[wi], 300);
        const rows = Math.floor(Math.random() * 1000 + 500);
        total += rows;
        const ops = ['filter', 'map', 'reduceByKey', 'join', 'flatMap'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        log('info', `[Worker-${wi}] ${op}(RDD) → ${rows} rows processed total:${total}`);
        if (Math.random() > 0.7) log('ok', `[Sink] micro-batch committed ${rows} rows`);
      };

      return { tick, interval: 800 };
    },
  },

  // 2: ML Training Loop
  {
    title: 'ML Training Loop',
    desc: 'Forward pass → loss → backprop → weight update cycle',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const dataNode = createNode(canvas, 30, 130, 110, 'Data Loader', 'batch_size=32', 'node-blue');
      const model = createNode(canvas, cx / 2 - 70, 60, 140, 'Model (Forward)', 'inference pass', 'node-purple');
      const lossNode = createNode(canvas, cx / 2 - 70, 180, 140, 'Loss Function', 'cross-entropy', 'node-orange');
      const backprop = createNode(canvas, cx - 170, 130, 140, 'Backprop', 'grad compute', 'node-yellow');
      const optim = createNode(canvas, cx / 2 - 70, 270, 140, 'Optimizer', 'Adam lr=3e-4', 'node-green');

      let epoch = 0;
      let step = 0;
      let loss = 2.4;
      const lossHistory: number[] = [];

      // Mini loss chart
      const chartDiv = document.createElement('div');
      chartDiv.style.cssText = 'position:absolute;top:10px;right:10px;width:140px;height:60px;border:1px solid var(--border)';
      const chartCanvas = document.createElement('canvas') as HTMLCanvasElement;
      chartCanvas.width = 140;
      chartCanvas.height = 60;
      chartDiv.appendChild(chartCanvas);
      canvas.appendChild(chartDiv);

      const drawLoss = (): void => {
        const chartCtx = chartCanvas.getContext('2d');
        if (!chartCtx) return;
        chartCtx.clearRect(0, 0, 140, 60);
        chartCtx.fillStyle = 'rgba(124,106,247,.03)';
        chartCtx.fillRect(0, 0, 140, 60);
        if (lossHistory.length < 2) return;
        chartCtx.beginPath();
        chartCtx.strokeStyle = '#7c6af7';
        chartCtx.lineWidth = 1.5;
        const mn = Math.min(...lossHistory);
        const mx = Math.max(...lossHistory);
        const range = mx - mn || 1;
        const slice = lossHistory.slice(-40);
        slice.forEach((v: number, i: number) => {
          const x = i / (slice.length - 1) * 138 + 1;
          const y = 60 - (v - mn) / range * 54 - 3;
          if (i === 0) chartCtx.moveTo(x, y);
          else chartCtx.lineTo(x, y);
        });
        chartCtx.stroke();
      };

      const stages = [model, lossNode, backprop, optim];
      let si = 0;

      const tick = (): void => {
        stages.forEach(s => s.classList.remove('active'));
        stages[si].classList.add('active');
        step++;
        if (si === 0) {
          flashNode(dataNode, 300);
          log('info', `[Forward] epoch:${epoch} step:${step} batch→model`);
        } else if (si === 1) {
          loss = Math.max(0.05, loss - Math.random() * 0.08 + 0.01);
          lossHistory.push(loss);
          drawLoss();
          log('info', `[Loss] value=${loss.toFixed(4)}`);
        } else if (si === 2) {
          log('info', '[Backprop] computing gradients through layers');
        } else {
          if (step % 20 === 0) epoch++;
          log('ok', `[Optim] weights updated step:${step} loss:${loss.toFixed(4)}`);
        }
        si = (si + 1) % stages.length;
      };

      return { tick, interval: 800 };
    },
  },

  // 3: RAG Pipeline (bug fixed: original had broken _tick assignment)
  {
    title: 'RAG Pipeline',
    desc: 'Retrieval Augmented Generation — query → embed → retrieve → generate',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const user = createNode(canvas, 30, 120, 90, 'User Query', 'natural lang', 'node-purple');
      const embed = createNode(canvas, 180, 120, 120, 'Embedder', 'text→vector', 'node-blue');
      const vdb = createNode(canvas, cx / 2 - 60, 60, 130, 'Vector DB', 'FAISS/Pinecone', 'node-yellow');
      const context = createNode(canvas, cx / 2 - 60, 180, 130, 'Context', 'top-k chunks', 'node-orange');
      const llm = createNode(canvas, cx - 170, 120, 140, 'LLM (Claude)', 'generate answer', 'node-green');
      const out = createNode(canvas, cx - 170, 230, 140, 'Response', 'to user', 'node-green');

      const stages = [
        () => { flashNode(user, 300); flashNode(embed, 300); log('info', '[Query] "What is the refund policy?" → embedding'); },
        () => { flashNode(vdb, 300); const sim = (0.7 + Math.random() * 0.25).toFixed(3); log('info', `[VDB] ANN search top-5 chunks sim=${sim}`); },
        () => { flashNode(context, 300); log('info', '[Context] assembled 2.1k tokens from retrieved chunks'); },
        () => { flashNode(llm, 400); log('info', '[LLM] generating with context window (4k tokens)'); },
        () => { flashNode(out, 300); log('ok', '[Response] grounded answer returned to user'); },
      ];

      let si = 0;

      const tick = (): void => {
        stages[si % stages.length]();
        si++;
      };

      return { tick, interval: 1100 };
    },
  },

  // 4: Feature Store
  {
    title: 'Feature Store',
    desc: 'Offline ingestion → feature computation → online serving',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      createNode(canvas, 30, 130, 110, 'Data Sources', 'events/logs/db', 'node-blue');
      const offline = createNode(canvas, cx / 4, 60, 130, 'Offline Store', 'Spark jobs', 'node-purple');
      createNode(canvas, cx / 4, 200, 130, 'Feature Engine', 'transformations', 'node-yellow');
      const online = createNode(canvas, cx / 2 + 20, 130, 130, 'Online Store', 'Redis cache', 'node-green');
      const serving = createNode(canvas, cx - 170, 130, 140, 'Feature Serving', 'low-latency API', 'node-orange');
      const modelNode = createNode(canvas, cx - 170, 250, 140, 'ML Model', 'inference', 'node-purple');

      const features = ['user_age_days', 'purchase_count_7d', 'avg_order_value', 'category_affinity', 'churn_score', 'click_rate_24h'];

      const tick = (): void => {
        const f = features[Math.floor(Math.random() * features.length)];
        const which = Math.random();
        if (which < 0.4) {
          flashNode(offline, 300);
          log('info', `[Offline] computed ${f} for 1.2M users`);
        } else if (which < 0.7) {
          flashNode(online, 300);
          log('info', `[Online] materialized ${f} → Redis TTL:3600`);
        } else {
          flashNode(serving, 400);
          flashNode(modelNode, 400);
          const lat = Math.floor(Math.random() * 3 + 1);
          log('ok', `[Serving] user_id:${Math.floor(Math.random() * 9999)} fetched ${Math.floor(Math.random() * 8 + 4)} features in ${lat}ms`);
        }
      };

      return { tick, interval: 850 };
    },
  },

  // 5: Medallion Architecture
  {
    title: 'Medallion Architecture',
    desc: 'Bronze (raw) → Silver (cleaned) → Gold (aggregated) data lake tiers',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const gap = Math.floor((cx - 40) / 4);

      const sources = createNode(canvas, 20, 100, gap - 10, 'Raw Sources', 'kafka/s3/api', 'node-blue');
      const bronze = createNode(canvas, 20 + gap, 100, gap - 10, 'Bronze', 'raw ingestion', 'node-orange');
      const silver = createNode(canvas, 20 + gap * 2, 100, gap - 10, 'Silver', 'cleaned/validated', 'node-yellow');
      const gold = createNode(canvas, 20 + gap * 3, 100, gap - 10, 'Gold', 'business-ready', 'node-green');

      const stages = [sources, bronze, silver, gold];
      let si = 0;
      const counts = { bronze: 0, silver: 0, gold: 0 };

      const statEl = document.createElement('div');
      statEl.style.cssText = 'position:absolute;bottom:20px;left:20px;font-size:9px;line-height:2';
      canvas.appendChild(statEl);

      const upd = (): void => {
        statEl.innerHTML = `bronze: <span style="color:var(--orange)">${counts.bronze}k</span>  silver: <span style="color:var(--yellow)">${counts.silver}k</span>  gold: <span style="color:var(--accent)">${counts.gold}k</span>`;
      };
      upd();

      const tick = (): void => {
        stages.forEach(s => s.classList.remove('active'));
        stages[si].classList.add('active');
        const batch = Math.floor(Math.random() * 50 + 10);
        if (si === 0) {
          log('info', `[Sources] ${batch}k events from kafka + S3 logs`);
        } else if (si === 1) {
          counts.bronze += batch;
          log('info', `[Bronze] ingested ${batch}k raw events (schema-on-read)`);
        } else if (si === 2) {
          const reject = Math.floor(Math.random() * 3);
          counts.silver += batch - reject;
          log('info', `[Silver] deduplicated + validated → ${batch - reject}k rows (${reject}k rejected)`);
        } else {
          counts.gold += Math.floor(batch / 3);
          log('ok', '[Gold] aggregated metrics materialized for dashboards');
        }
        upd();
        si = (si + 1) % stages.length;
      };

      return { tick, interval: 900 };
    },
  },

  // 6: Vector DB Similarity Search
  {
    title: 'Vector DB Search',
    desc: 'Query → embed → ANN search → re-rank → results',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const query = createNode(canvas, 20, 120, 90, 'Query Text', 'natural lang', 'node-purple');
      const embed = createNode(canvas, 140, 120, 110, 'Embedder', 'text→vec', 'node-blue');
      const vdb = createNode(canvas, cx / 2 - 50, 60, 110, 'Vector DB', '1M vectors', 'node-yellow');
      const topk = createNode(canvas, cx / 2 - 50, 190, 110, 'Top-K', 'candidates', 'node-orange');
      const rerank = createNode(canvas, cx - 250, 120, 120, 'Re-ranker', 'cross-encoder', 'node-purple');
      const results = createNode(canvas, cx - 120, 120, 100, 'Results', 'top 3', 'node-green');

      const steps = [
        () => { flashNode(query, 400); flashNode(embed, 400); log('info', '[Embed] "How to reset password?" → vector dim:1536'); },
        () => { flashNode(vdb, 400); const scanned = Math.floor(Math.random() * 500 + 500); log('info', `[ANN] HNSW search scanned ${scanned} candidates from 1M vectors`); },
        () => { flashNode(topk, 400); const sim = (0.7 + Math.random() * 0.25).toFixed(3); log('info', `[Top-K] 10 candidates, best similarity: ${sim}`); },
        () => { flashNode(rerank, 400); log('info', '[Rerank] cross-encoder scoring 10 candidates'); },
        () => { flashNode(results, 400); const lat = Math.floor(Math.random() * 20 + 5); log('ok', `[Results] top 3 returned in ${lat}ms`); },
      ];

      let si = 0;

      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 7: Model Serving (Batch vs Real-time)
  {
    title: 'Model Serving',
    desc: 'Side-by-side: batch inference (Spark) vs real-time inference (API)',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;
      const half = cx / 2 - 20;

      // Labels
      const lbl1 = document.createElement('div');
      lbl1.style.cssText = 'position:absolute;left:20px;top:5px;font-size:9px;color:var(--blue);letter-spacing:.12em;text-transform:uppercase';
      lbl1.textContent = 'Batch Inference';
      canvas.appendChild(lbl1);

      const lbl2 = document.createElement('div');
      lbl2.style.cssText = `position:absolute;left:${half + 30}px;top:5px;font-size:9px;color:var(--accent);letter-spacing:.12em;text-transform:uppercase`;
      lbl2.textContent = 'Real-time Inference';
      canvas.appendChild(lbl2);

      // Divider
      const divider = document.createElement('div');
      divider.style.cssText = `position:absolute;left:${half + 10}px;top:0;bottom:0;width:1px;background:var(--border)`;
      canvas.appendChild(divider);

      // Batch side
      const batchSrc = createNode(canvas, 20, 60, half / 2 - 10, 'Data Lake', '100k records', 'node-blue');
      const batchJob = createNode(canvas, 20 + half / 2, 60, half / 2 - 10, 'Spark Job', 'batch predict', 'node-yellow');
      const batchOut = createNode(canvas, 20, 150, half - 10, 'Predictions Table', 'dashboard ready', 'node-green');

      // Real-time side
      const rtReq = createNode(canvas, half + 20, 60, half / 2 - 10, 'API Request', 'POST /predict', 'node-purple');
      const rtModel = createNode(canvas, half + 20 + half / 2, 60, half / 2 - 10, 'Model Server', 'TF Serving', 'node-orange');
      const rtResp = createNode(canvas, half + 20, 150, half - 10, 'Response', '{score: 0.87}', 'node-green');

      let tickCount = 0;

      const tick = (): void => {
        tickCount++;
        // Batch side
        if (tickCount % 2 === 0) {
          flashNode(batchSrc, 300);
          flashNode(batchJob, 300);
          const rows = Math.floor(Math.random() * 50 + 20);
          log('info', `[Batch] processing ${rows}k records ETA:${Math.floor(Math.random() * 5 + 2)}min`);
          if (tickCount % 4 === 0) {
            flashNode(batchOut, 300);
            log('ok', '[Batch] predictions written to table');
          }
        }
        // Real-time side
        flashNode(rtReq, 200);
        flashNode(rtModel, 200);
        const lat = Math.floor(Math.random() * 15 + 5);
        const score = (Math.random() * 0.5 + 0.5).toFixed(2);
        flashNode(rtResp, 200);
        log('ok', `[Realtime] inference lat:${lat}ms → {score: ${score}}`);
      };

      return { tick, interval: 900 };
    },
  },
];
