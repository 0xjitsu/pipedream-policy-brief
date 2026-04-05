import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://pipedream-policy-brief.vercel.app/sitemap.xml",
    // llms.txt for AI agent discoverability (https://llmstxt.org)
    // Served as static files from public/llms.txt and public/llms-full.txt
  };
}
