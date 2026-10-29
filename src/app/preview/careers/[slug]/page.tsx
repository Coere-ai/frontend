import type { Metadata } from "next";
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

export async function generateMetadata({ params }: PageProps<"/preview/careers/[slug]">): Promise<Metadata> {
  const role = roleBySlug((await params).slug);
  return role ? { title: role.title, description: role.summary } : {};
}

export default async function RolePage({ params }: PageProps<"/preview/careers/[slug]">) {
  const role = roleBySlug((await params).slug);
  if (!role) notFound();
  return (
    <section className="pt-16 pb-28 md:pt-24">
      <Container>
        <Link href="/careers" className="text-[14px] text-neutral-500 hover:text-neutral-950">
          Careers
        </Link>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-6xl md:leading-[1.04]">{role.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-500">{role.summary}</p>
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
