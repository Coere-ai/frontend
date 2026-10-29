/** The sign in fields. A plain POST, so it works before any script loads. */
export function AccessForm({ error }: { error?: string }) {
  const field =
    "mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[15px] text-neutral-950 outline-none transition-colors focus:border-neutral-950";

  return (
    <form action="/access/verify" method="post" className="mt-8 space-y-4">
      <label className="block text-sm font-medium text-neutral-700">
        User
        <input name="user" autoComplete="username" required className={field} />
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button className="h-11 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
        Enter
      </button>
    </form>
  );
}
