<p align="center">
  <img src="https://img.shields.io/badge/diagrams-63-00d4aa?style=flat-square&labelColor=0a0c10" />
  <img src="https://img.shields.io/badge/categories-9-7c6af7?style=flat-square&labelColor=0a0c10" />
  <img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
</p>

<h1 align="center">All Systems Visualized</h1>

<p align="center">
  <strong>63 interactive, animated flow diagrams</strong> covering the systems, protocols, and algorithms that power modern software — from Kafka topics to Merkle trees, TCP handshakes to Raft consensus.
</p>

<p align="center">
  <em>No libraries. No D3. No canvas API. Pure DOM animation.</em>
</p>

---

## Preview

```
 ┌──────────────────────────────────────────────────────┐
 │  <- hub    DISTRIBUTED SYSTEMS    // 10 diagrams     │
 ├──────────────────────────────────────────────────────┤
 │ LOAD BALANCER | CDN | K8S | DB REPL | MICROSERVICES │
 ├──────────────────────────────────────────────────────┤
 │  Load Balancer                                       │
 │  Round-robin traffic distribution across a pool      │
 │  [ > Start ]  [ || Pause ]  [ ~ Reset ]             │
 ├──────────────────────────────────────────────────────┤
 │                                                      │
 │            ┌──────────────┐                          │
 │            │ Load Balancer│                          │
 │            └──────┬───────┘                          │
 │          ┌────────┼────────┐                         │
 │     [Server 0] [Server 1] [Server 2]                 │
 │                   ▲  REQ                             │
 │              [Client B]                              │
 │                                                      │
 ├──────────────────────────────────────────────────────┤
 │ 14:32:01  [LB] Client->Server1 (round-robin #4)     │
 │ 14:32:02  [LB] Client->Server2 (round-robin #5)     │
 └──────────────────────────────────────────────────────┘
```

## Categories

| # | Category | Diagrams | Topics |
|---|----------|:--------:|--------|
| 1 | **Distributed Systems** | 10 | Kafka, Load Balancer, CDN, K8s, DB Replication, Microservices, CI/CD, Event Sourcing, Circuit Breaker, Saga |
| 2 | **Networking & Security** | 8 | TCP Handshake, DNS, OAuth2, Firewall, VPN, TLS 1.3, BGP, mTLS |
| 3 | **Data & ML Pipelines** | 8 | ETL, Spark Streaming, ML Training, RAG, Feature Store, Medallion, Vector DB, Model Serving |
| 4 | **App & Web Architecture** | 8 | HTTP Lifecycle, React Rendering, GraphQL, Cache Hierarchy, WebSocket vs REST, SSR/CSR/SSG, Service Worker, Event Loop |
| 5 | **Business & Product** | 5 | Order Lifecycle, Onboarding Funnel, Git Flow, Incident Management, A/B Testing |
| 6 | **Algorithms & CS** | 10 | Bubble Sort, BFS, Consistent Hashing, Raft Consensus, Token Bucket, Binary Search, Dijkstra, LRU Cache, Bloom Filter, Merkle Tree |
| 7 | **DevOps & Cloud** | 5 | Terraform, Docker Lifecycle, Istio Mesh, Serverless Cold Start, Blue/Green Deploy |
| 8 | **Databases & Storage** | 5 | B-Tree Index, MVCC, Write-Ahead Log, Sharding, Connection Pooling |
| 9 | **Auth & Identity** | 4 | JWT Lifecycle, SAML SSO, RBAC, Certificate Chain |

## Tech Stack

```
Next.js 16          App Router, static generation, dynamic routes
React 19            useRef + useEffect for DOM animation lifecycle
TypeScript 5        Strict types for all diagrams, contexts, and instances
Tailwind CSS 4      Design system tokens + custom CSS
JetBrains Mono      Monospace font across the entire UI
```

## Architecture

```
src/
├── app/
│   ├── globals.css              # Design system — nodes, packets, bars, gnodes
│   ├── layout.tsx               # Root layout — font, grid background
│   ├── page.tsx                 # Hub — 9 category cards with diagram counts
│   └── [category]/
│       └── page.tsx             # SSG category page — accent tint, workspace
│
├── components/
│   ├── DiagramWorkspace.tsx     # Tabs, controls, canvas, animation lifecycle
│   └── ResizableLog.tsx         # Draggable log panel (mouse + touch)
│
└── lib/
    ├── types.ts                 # DiagramDef, DiagramContext, DiagramInstance, etc.
    ├── constants.ts             # Categories, colors, config
    ├── helpers.ts               # DOM helpers — createNode, flyPkt, flashNode, etc.
    └── diagrams/
        ├── index.ts             # Registry — slug -> DiagramDef[]
        ├── distributed-systems.ts
        ├── networking-security.ts
        ├── data-ml-pipelines.ts
        ├── app-web-architecture.ts
        ├── business-processes.ts
        ├── algorithms-cs.ts
        ├── devops-cloud.ts
        ├── databases-storage.ts
        └── auth-identity.ts
```

### How Diagrams Work

Every diagram follows the same pattern:

```typescript
{
  title: 'Load Balancer',
  desc: 'Round-robin traffic distribution across a server pool',
  init(ctx: DiagramContext): DiagramInstance {
    const { canvas, log } = ctx;

    // Build DOM nodes on the canvas
    const lb = createNode(canvas, x, y, w, 'Load Balancer', 'nginx', 'node-green');

    // Return a tick function called on each interval
    const tick = () => {
      flashNode(server, 400);
      flyPkt(canvas, { sx, sy, ex, ey, color: '#4fc3f7', label: 'REQ', duration: 500 });
      log('ok', '[LB] request routed');
    };

    return { tick, interval: 900 };
  },
}
```

- **`init()`** builds the visual layout on a canvas div — no SVG libraries, no chart frameworks
- **`tick()`** advances the animation one step — called on a `setInterval`
- **`flyPkt()`** animates a packet between two points using `requestAnimationFrame`
- **`flashNode()`** briefly glows a node to indicate activity
- **`log()`** pushes timestamped events to the resizable terminal panel

## Getting Started

```bash
# Clone
git clone https://github.com/SamNickGammer/All-System-Visualized.git
cd All-System-Visualized

# Install
npm install

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — click any category card to explore its diagrams.

## Design

The UI follows a **terminal-inspired dark theme** with a strict design language:

- **`#0a0c10`** background with a subtle 40px grid overlay
- **Color-coded nodes** — green for primary, blue for replicas, purple for clients, orange for external, yellow for warnings, red for errors
- **Flying packets** — small labeled elements that animate between nodes using eased `requestAnimationFrame`
- **Resizable log panel** — drag the handle to expand/collapse the terminal output
- **Per-category accent colors** — each category tints the grid background and controls

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build with static export |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/SamNickGammer"><strong>SamNickGammer</strong></a>
</p>
