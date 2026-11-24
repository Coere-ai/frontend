import { proxyAnthropic } from "@/lib/v1/anthropic/proxy";

// /api/v1/anthropic/v1/... (docs/accounts.md 8.4)
//
// The extension's Claude calls, with Coere's key added on the server. Only
// the paths the memory runtime uses pass; see src/lib/v1/anthropic/proxy.ts.
// A long answer can take minutes. 300 seconds is the most Vercel's Hobby
// plan allows and Pro's default with Fluid compute, so it deploys on every
// plan. A rare answer that takes longer is cut off, billed by Anthropic and
// never metered, and its spend hold runs out HOLD_SECONDS (360) after it
// started (src/lib/v1/hold-rules.ts). The v4 extension waits 330 seconds for
// a call, so it gives up just after the cut. A Pro team may raise this to
// 800, Vercel's ceiling there: then HOLD_SECONDS goes to 860 and the
// extension's timeout to 830.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Ctx = RouteContext<"/api/v1/anthropic/[...path]">;

async function handle(req: Request, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  return proxyAnthropic(req, path);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
