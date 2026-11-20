import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/site/careers/application-form";
import { RoleDetails } from "@/site/careers/role-details";
import { roleBySlug, roles } from "@/site/content/roles";
import { Container } from "@/site/ui/container";

export const dynamicParams = false;

export function generateStaticParams() {
  return roles.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const role = roleBySlug((await params).slug);
  return role ? { title: role.title, description: role.summary, ...hiddenPage } : hiddenPage;
}

export default async function RolePage({ params }: PageProps<"/careers/[slug]">) {
  const role = roleBySlug((await params).slug);
  if (!role) notFound();
  return (
    <section className="relative isolate pt-16 pb-28 md:pt-24">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(55%_80%_at_12%_0%,#e3e8ff_0%,rgba(238,241,255,0.55)_45%,rgba(255,255,255,0)_75%)]" />
      <Container>
        <Link href="/careers" className="inline-flex rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
          Careers
        </Link>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-neutral-950 text-balance md:text-6xl md:leading-[1.02]">{role.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{role.summary}</p>
        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <RoleDetails role={role} />
          <div id="apply" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
            <ApplicationForm role={role} />
          </div>
        </div>
      </Container>
    </section>
  );
}
