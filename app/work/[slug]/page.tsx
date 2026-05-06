import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { projects } from '@/lib/projects';
import CaseStudyHero from '@/components/CaseStudyHero';
import CaseStudyPhases from '@/components/CaseStudyPhases';
import Framing from '@/components/Framing';

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
  // Flatten context (either a plain string or a segment array) to a
  // single description string for SEO/social previews.
  const descriptionText =
    typeof project.context === 'string'
      ? project.context
      : project.context
          ?.map((seg) => (typeof seg === 'string' ? seg : seg.text))
          .join('');

  return {
    title: `${project.client} — ${project.title} · Nick O'Malley`,
    description: descriptionText?.slice(0, 160),
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

      {/* Hero. Image heroes can opt into edge-to-edge by setting
          `fullBleed: true` on the hero entry — no horizontal padding. */}
      {project.hero.kind === 'image' && project.hero.fullBleed ? (
        <CaseStudyHero
          hero={project.hero}
          title={`${project.client} ${project.title}`}
        />
      ) : (
        <section className="px-8 md:px-12">
          <CaseStudyHero
            hero={project.hero}
            title={`${project.client} ${project.title}`}
          />
        </section>
      )}

      {project.planHero ? (
        <PlanHeroBlock project={project} />
      ) : (
        /* Standard metadata block + context paragraph */
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
            <Framing framing={project.context} />
          </div>
        </section>
      )}

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

/**
 * Hero variant for projects whose intro copy is baked into a design
 * image. Renders the image full-width at its intrinsic aspect ratio,
 * with client/year/role overlaid in black on the top-left in a small
 * mono table. Replaces the standard meta + context section.
 */
function PlanHeroBlock({ project }: { project: Project }) {
  const ph = project.planHero!;
  return (
    <section className="px-8 md:px-12 pt-12">
      <div
        className="overflow-hidden relative shimmer"
        style={{ aspectRatio: `${ph.width} / ${ph.height}` }}
      >
        <Image
          src={ph.src}
          alt={ph.alt ?? `${project.client} ${project.title}`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div
          className="absolute mono grid"
          style={{
            top: 'clamp(16px, 3vw, 32px)',
            left: 'clamp(16px, 3vw, 32px)',
            color: '#000',
            fontSize: 'clamp(10px, 1.1vw, 12px)',
            lineHeight: 1.55,
            letterSpacing: '0.02em',
            gridTemplateColumns: 'auto 1fr',
            columnGap: '1rem',
            rowGap: '2px',
          }}
        >
          <span style={{ opacity: 0.55 }}>Client</span>
          <span>{project.client}</span>
          <span style={{ opacity: 0.55 }}>Year</span>
          <span>{project.year}</span>
          <span style={{ opacity: 0.55 }}>Role</span>
          <span>{project.role}</span>
        </div>
      </div>
    </section>
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
