// Run after `next build`: node scripts/check-og-video.mjs
// Fails if og:video / twitter:player tags are missing or the MP4 exceeds 5 MB.
import { readFileSync, statSync, readdirSync } from "node:fs";

const html = readdirSync(".next/server/app").includes("index.html")
  ? readFileSync(".next/server/app/index.html", "utf8")
  : "";
const need = [
  'property="og:video"', 'property="og:video:secure_url"', 'property="og:video:type" content="video/mp4"',
  'property="og:video:width"', 'property="og:video:height"', 'property="og:image"',
  'name="twitter:card" content="player"', 'name="twitter:player"',
  'name="twitter:player:width"', 'name="twitter:player:height"',
];
const missing = need.filter((t) => !html.includes(t));
const size = statSync("public/og/preview.mp4").size;
if (!html || missing.length || size >= 5 * 1024 * 1024) {
  console.error({ htmlFound: !!html, missing, mp4Bytes: size });
  process.exit(1);
}
console.log(`og:video OK (${(size / 1048576).toFixed(2)} MB)`);
