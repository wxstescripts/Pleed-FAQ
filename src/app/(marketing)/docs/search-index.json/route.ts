import { buildDocsSearchIndex } from "@/content/docs/content";

// Built once at build time; the docs search island fetches it the first time
// search opens, so docs pages don't carry the index in their HTML.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildDocsSearchIndex());
}
