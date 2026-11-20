import type { Metadata } from "next";
import { hiddenPage } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/site/careers/application-form";
import { RoleDetails } from "@/site/careers/role-details";
import { roleBySlug, roles } from "@/site/content/roles";
import { UNDER_NAV } from "@/site/nav/nav-space";
import { Container } from "@/site/ui/container";
import { DarkPage } from "@/site/ui/page-theme";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

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
    <DarkPage>
      <section className={`relative isolate pt-[136px] pb-28 md:pt-[168px] ${UNDER_NAV}`}>
        <Container>
          <Link href="/careers" className="group inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-white/60 dark:hover:text-white">
            <ArrowRightIcon size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Careers
          </Link>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-neutral-950 text-balance dark:text-white md:text-6xl md:leading-[1.02]">{role.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-white/65">{role.summary}</p>
          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
            <RoleDetails role={role} />
            <div id="apply" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
              <ApplicationForm role={role} />
            </div>
          </div>
        </Container>
      </section>
    </DarkPage>
  );
}
