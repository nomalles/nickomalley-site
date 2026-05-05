import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/projects';
import CaseStudyHero from '@/components/CaseStudyHero';
import CaseStudyPhases from '@/components/CaseStudyPhases';

/**
 * /work/[slug] — case study page.
 *
 * Statically generates a route per project that has a `hero` field
 * (i.e., a real built-out case study). Slugs without a hero are treated
 * as 404 since we have nothing meaningful to render.
 *
 * Layout order:
 *   1. "← Index" back link
 *   2. Ultrawide (21:9) Mux hero, autoplay muted loop
 *   3. Swiss-style metadata block + 2–3 sentence context paragraph
 *   4. Phases block (blurred behind a password gate when passwordHash is set)
 *   5. Small mono credits footer
 */

export async function generateStaticParams() {
  return projects.filter((p) => p.hero).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: `${project.client} — ${project.title} · Nick O'Malley`,
    description: project.context?.slice(0, 160),
  };
}

export default function WorkPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project || !project.hero) notFound();

  return (
    <main className="min-h-screen pb-24">
      {/* Top-left back link. Keeps the case study self-contained for now;
          when we hoist Header / Scene3D into a shared layout this can go. */}
      <header className="px-8 md:px-12 pt-8 pb-6">
        <Link
          href="/"
          className="mono text-[12px] text-fg-55 hover-accent uppercase tracking-[0.18em]"
        >
          ← Index
        </Link>
      </header>

      {/* Hero */}
      <section className="px-8 md:px-12">
        <CaseStudyHero
          hero={project.hero}
          title={`${project.client} ${project.title}`}
        />
      </section>

      {/* Metadata + context (Swiss block on the left, paragraph on the right) */}
      <section className="px-8 md:px-12 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 mono">
          <MetaRow label="Client" value={project.client} />
          <MetaRow label="Year" value={project.year} />
          <MetaRow label="Role" value={project.role} />
          {project.studio && <MetaRow label="Studio" value={project.studio} />}
          {project.scope && (
            <MetaRow label="Scope" value={project.scope.join(' · ')} />
          )}
        </div>
        <div
          className="md:col-span-7 text-fg-90"
          style={{ fontSize: 18, lineHeight: 1.5 }}
        >
          {project.context}
        </div>
      </section>

      {/* Phases (gated when passwordHash is set) */}
      {project.phases && project.phases.length > 0 && (
        <CaseStudyPhases
          phases={project.phases}
          passwordHash={project.passwordHash}
        />
      )}

      {/* Credits footer */}
      {project.credits && (
        <section className="px-8 md:px-12 pt-24 pb-12 mono">
          <div className="text-[10px] tracking-[0.18em] text-fg-30 uppercase mb-4">
            Credits
          </div>
          {project.credits.team && (
            <ul className="text-[12px] text-fg-70 space-y-1">
              {project.credits.team.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
          {project.credits.notes && (
            <p
              className="text-[11px] text-fg-45 mt-6"
              style={{ maxWidth: '36rem', lineHeight: 1.6 }}
            >
              {project.credits.notes}
            </p>
          )}
        </section>
      )}
    </main>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="grid grid-cols-[7rem_1fr] gap-4 py-3"
      style={{ borderTop: '1px solid rgba(244,242,238,0.12)' }}
    >
      <span
        className="text-fg-45 uppercase tracking-[0.18em]"
        style={{ fontSize: 10 }}
      >
        {label}
      </span>
      <span className="text-fg-90" style={{ fontSize: 13 }}>
        {value}
      </span>
    </div>
  );
}
