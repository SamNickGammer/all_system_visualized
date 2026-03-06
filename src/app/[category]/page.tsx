import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import DiagramWorkspace from '@/components/DiagramWorkspace';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.title} — Flow Diagrams`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  return (
    <div
      className="grid-bg-category"
      style={{
        position: 'relative',
      }}
    >
      <style>{`
        .grid-bg {
          background-image:
            linear-gradient(rgba(${cat!.accent.rgb},.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${cat!.accent.rgb},.03) 1px, transparent 1px) !important;
        }
      `}</style>
      <Suspense>
        <DiagramWorkspace
          title={cat!.title}
          categorySlug={category}
          accent={cat!.accent}
          accentRgb={cat!.accent.rgb}
        />
      </Suspense>
    </div>
  );
}
