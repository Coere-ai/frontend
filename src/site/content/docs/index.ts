/**
 * The developer docs, one Markdown file per page in this folder. The files
 * were built from the coere-v2 source, and each fact keeps a comment naming
 * the file and line it came from, so it can be checked again when the API
 * changes. The comments are stripped when a page is drawn.
 */
export type DocPage = { slug: string; title: string; summary: string };

export const docPages: DocPage[] = [
  { slug: "overview", title: "Introduction", summary: "What the API does, and the shortest path to a first answer." },
  { slug: "conventions", title: "Conventions", summary: "Base URL, who may call, request encoding, answers, ids, paging and versions." },
  { slug: "authentication", title: "Authentication", summary: "App tokens, the six scopes, and the three ways to get a token." },
  { slug: "endpoints", title: "Endpoints", summary: "Every route an app may call, with its parameters, answers and errors." },
  { slug: "schemas", title: "Schemas", summary: "The shapes of memory records and answers." },
  { slug: "sdks", title: "SDKs", summary: "The TypeScript client and the Python SDK, method by method." },
  { slug: "mcp", title: "MCP", summary: "Connecting an agent, and every tool and resource." },
  { slug: "limits", title: "Limits", summary: "Rate limits, sizes and windows." },
  { slug: "errors", title: "Errors", summary: "Problem details and every error code." },
  { slug: "examples", title: "Examples", summary: "Working code for the common tasks." },
];

export function docPage(slug: string): DocPage | undefined {
  return docPages.find((page) => page.slug === slug);
}
