import { signOut } from "@/app/admin/actions";

import { AdminNav } from "./admin-nav";

/**
 * The frame of every signed in admin page: a header with the way out, the
 * section nav, then the page. Server rendered; each page checks the admin
 * session itself before it renders this.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <header className="mb-5 flex items-baseline justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <div>
          <p className="text-[11px] font-medium tracking-[0.09em] uppercase text-[color:var(--color-muted)]">Coere</p>
          <h1 className="mt-1 text-[19px] font-semibold text-[color:var(--color-ink)]">Admin</h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-[color:var(--color-canvas-soft)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="mb-8">
        <AdminNav />
      </div>
      <main>{children}</main>
    </div>
  );
}
