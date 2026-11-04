import { proxyAnthropic } from "@/lib/v1/anthropic/proxy";

// /api/v1/anthropic/v1/... (docs/accounts.md 8.4)
//
// The extension's Claude calls, with Coere's key added on the server. Only
// the paths the memory runtime uses pass; see src/lib/v1/anthropic/proxy.ts.
// A long answer can take minutes: the extension waits up to 600 seconds for
// a non streaming call of 16,000 tokens, so the function must outlast that
// or a cut off answer is billed by Anthropic and never metered. 800 seconds
// is Vercel's ceiling with Fluid compute, on Pro or Enterprise.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

type Ctx = RouteContext<"/api/v1/anthropic/[...path]">;

async function handle(req: Request, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  return proxyAnthropic(req, path);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
