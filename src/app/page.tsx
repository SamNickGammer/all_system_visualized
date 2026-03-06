import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { getDiagramsByCategory } from '@/lib/diagrams';

export default function Home() {
  return (
    <>
      <header style={{ padding: '60px 60px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4, letterSpacing: '.12em', textTransform: 'uppercase' as const }}>
          // interactive flow diagrams
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--accent)' }}>
          All Systems Visualized
        </h1>
        <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 8, letterSpacing: '.08em' }}>
          75 animated flow diagrams across 9 categories — distributed systems, networking, data pipelines, web architecture, business processes, algorithms, DevOps, databases &amp; auth
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 1,
        background: 'var(--border)',
        margin: 1,
        padding: 0,
      }}>
        {CATEGORIES.map((cat) => {
          const diagrams = getDiagramsByCategory(cat.slug);
          const count = diagrams.length;

          return (
            <Link key={cat.slug} href={`/${cat.slug}`} className={`card ${cat.cardClass}`}>
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 11, color: 'var(--dim)', letterSpacing: '.06em' }}>
                {String(count).padStart(2, '0')} diagrams
              </div>
              <div style={{ fontSize: 24, marginBottom: 16 }}>&#11045;</div>
              <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
                {cat.title}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.8, marginBottom: 16 }}>
                {cat.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 9, padding: '3px 8px',
                    border: '1px solid var(--border)',
                    color: 'var(--dim)', letterSpacing: '.06em',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-arrow">&rarr;</div>
            </Link>
          );
        })}
      </div>

      <footer style={{ padding: '24px 60px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--dim)', letterSpacing: '.08em' }}>
        // 54 interactive animated flow diagrams &middot; open each category to explore
      </footer>
    </>
  );
}
