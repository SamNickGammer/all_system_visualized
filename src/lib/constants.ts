import type { CategoryMeta } from './types';

/** CSS color tokens matching the design system */
export const COLORS = {
  bg: '#0a0c10',
  panel: '#0f1318',
  border: '#1e2530',
  accent: '#00d4aa',
  purple: '#7c6af7',
  orange: '#ff6b35',
  yellow: '#ffd166',
  red: '#ff4466',
  blue: '#4fc3f7',
  pink: '#f06292',
  text: '#c8d8e8',
  dim: '#4a5568',
} as const;

/** All category definitions — order determines hub grid layout */
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'distributed-systems',
    title: 'Distributed Systems',
    description: 'Kafka, load balancers, CDN routing, Kubernetes scheduling, database replication, microservices, CI/CD, event sourcing, circuit breaker, and saga pattern.',
    tags: ['Kafka', 'Load Balancer', 'CDN', 'K8s', 'CI/CD', 'CQRS', 'Circuit Breaker', 'Saga'],
    accent: { color: COLORS.accent, rgb: '0,212,170', cssVar: 'var(--accent)' },
    cardClass: 'c0',
  },
  {
    slug: 'networking-security',
    title: 'Networking & Security',
    description: 'TCP handshake, DNS resolution, OAuth2 auth flow, firewall filtering, VPN tunnel, TLS 1.3 handshake, BGP routing, and mTLS.',
    tags: ['TCP', 'DNS', 'OAuth2', 'Firewall', 'VPN', 'TLS 1.3', 'BGP', 'mTLS'],
    accent: { color: COLORS.blue, rgb: '79,195,247', cssVar: 'var(--blue)' },
    cardClass: 'c1',
  },
  {
    slug: 'data-ml-pipelines',
    title: 'Data & ML Pipelines',
    description: 'ETL pipeline, Spark streaming, ML training loop, RAG pipeline, feature store, medallion architecture, vector DB search, and model serving.',
    tags: ['ETL', 'Spark', 'ML Training', 'RAG', 'Medallion', 'Vector DB', 'Model Serving'],
    accent: { color: COLORS.purple, rgb: '124,106,247', cssVar: 'var(--purple)' },
    cardClass: 'c2',
  },
  {
    slug: 'app-web-architecture',
    title: 'App & Web Architecture',
    description: 'HTTP request lifecycle, React rendering, GraphQL resolvers, cache hierarchy, WebSocket vs REST, SSR/CSR/SSG, service workers, and event loop.',
    tags: ['HTTP', 'React', 'GraphQL', 'Cache', 'SSR/CSR/SSG', 'Event Loop'],
    accent: { color: COLORS.pink, rgb: '240,98,146', cssVar: 'var(--pink)' },
    cardClass: 'c3',
  },
  {
    slug: 'business-processes',
    title: 'Business & Product',
    description: 'Order lifecycle, user onboarding funnel, Git branching flow, incident management, and A/B test traffic split.',
    tags: ['Order Flow', 'Onboarding', 'Git Flow', 'Incidents', 'A/B Test'],
    accent: { color: COLORS.yellow, rgb: '255,209,102', cssVar: 'var(--yellow)' },
    cardClass: 'c4',
  },
  {
    slug: 'algorithms-cs',
    title: 'Algorithms & CS',
    description: 'Sorting, BFS/DFS, consistent hashing, Raft consensus, rate limiter, binary search, Dijkstra, LRU cache, Bloom filter, and Merkle tree.',
    tags: ['Sorting', 'BFS/DFS', 'Hashing', 'Raft', 'Dijkstra', 'LRU', 'Bloom Filter', 'Merkle Tree'],
    accent: { color: COLORS.orange, rgb: '255,107,53', cssVar: 'var(--orange)' },
    cardClass: 'c5',
  },
  {
    slug: 'devops-cloud',
    title: 'DevOps & Cloud',
    description: 'Terraform plan/apply, Docker container lifecycle, Istio service mesh, serverless cold start, and blue/green deployments.',
    tags: ['Terraform', 'Docker', 'Istio', 'Serverless', 'Blue/Green'],
    accent: { color: COLORS.orange, rgb: '255,107,53', cssVar: 'var(--orange)' },
    cardClass: 'c6',
  },
  {
    slug: 'databases-storage',
    title: 'Databases & Storage',
    description: 'B-Tree index lookup, MVCC concurrency control, write-ahead log, sharding strategies, and connection pooling.',
    tags: ['B-Tree', 'MVCC', 'WAL', 'Sharding', 'Conn Pool'],
    accent: { color: COLORS.purple, rgb: '124,106,247', cssVar: 'var(--purple)' },
    cardClass: 'c7',
  },
  {
    slug: 'auth-identity',
    title: 'Auth & Identity',
    description: 'JWT token lifecycle, SAML SSO flow, RBAC access control, and certificate chain validation.',
    tags: ['JWT', 'SAML', 'RBAC', 'Cert Chain'],
    accent: { color: COLORS.red, rgb: '255,68,102', cssVar: 'var(--red)' },
    cardClass: 'c8',
  },
];

/** Max log entries before pruning */
export const MAX_LOG_ENTRIES = 40;

/** Default log panel height in px */
export const DEFAULT_LOG_HEIGHT = 90;

/** Minimum log panel height in px */
export const MIN_LOG_HEIGHT = 40;
