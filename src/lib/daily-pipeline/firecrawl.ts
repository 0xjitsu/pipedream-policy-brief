import FirecrawlApp from "@mendable/firecrawl-js";

let app: FirecrawlApp | null = null;

function getApp(): FirecrawlApp | null {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;
  if (!app) app = new FirecrawlApp({ apiKey });
  return app;
}

/**
 * Scrapes a JS-rendered URL via firecrawl. Returns markdown body or null
 * on any error. Markdown is easier to regex than raw HTML for value extraction.
 */
export async function firecrawlMarkdown(url: string): Promise<string | null> {
  const client = getApp();
  if (!client) return null;
  try {
    const result = await client.v1.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30_000,
    });
    if (!result || !("success" in result) || !result.success) return null;
    return ("markdown" in result ? result.markdown : null) ?? null;
  } catch {
    return null;
  }
}
