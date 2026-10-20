// Build-output checks: offline assets only, no leftover developer/fake features.
// Run after `npm run build`:  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test("dist exists", () => {
  assert.ok(existsSync(join(dist, "index.html")), "run npm run build first");
});

test("no remote URLs loaded by the app shell", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.doesNotMatch(html, /https?:\/\//);
  const text = walk(dist).filter((f) => /\.(js|css|html)$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");
  assert.doesNotMatch(text, /fonts\.googleapis|fonts\.gstatic|unpkg\.com|cdn\.jsdelivr/);
  // CSS must not import or url() anything remote
  for (const f of walk(dist).filter((f) => f.endsWith(".css"))) {
    assert.doesNotMatch(readFileSync(f, "utf8"), /url\(\s*["']?https?:/, f);
  }
});

test("fonts are bundled", () => {
  const fonts = walk(dist).filter((f) => /\.woff2?$/.test(f));
  assert.ok(fonts.length > 0, "expected bundled woff/woff2 fonts");
});

test("no developer notes, fake sign-in or fake voice memo in release bundle", () => {
  const js = walk(dist).filter((f) => f.endsWith(".js")).map((f) => readFileSync(f, "utf8")).join("\n");
  for (const s of ["in-memory", "visibly local", "local draft", "preview mode", "production perfect", "Performance audit", "Nastavi s Apple ID", "Apple ID", "12s memo", "No localStorage", "spring 0.32"]) {
    assert.ok(!js.includes(s), `found "${s}"`);
  }
});

test("artifact host scripts were dropped", () => {
  const js = walk(dist).filter((f) => f.endsWith(".js")).map((f) => readFileSync(f, "utf8")).join("\n");
  for (const s of ["ecto:artifact-focus-request", "data-clippy-inline-media-manifest", "data-product-id"]) {
    assert.ok(!js.includes(s), `found "${s}"`);
  }
});

test("capacitor config loads bundled assets only", () => {
  const cfg = JSON.parse(readFileSync(join(root, "capacitor.config.json"), "utf8"));
  assert.equal(cfg.appId, "ie.laganinii.atelje");
  assert.equal(cfg.webDir, "dist");
  assert.ok(!cfg.server || !cfg.server.url, "server.url must not be set");
});

test("extraction is reproducible", async () => {
  const before = readFileSync(join(root, "src/app/atelje-bundle.js"), "utf8");
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, [join(root, "scripts/extract-artifact.mjs")], { stdio: "pipe" });
  assert.equal(readFileSync(join(root, "src/app/atelje-bundle.js"), "utf8"), before);
});
