/**
 * Feed Testing Script
 * Tests all discover feeds to ensure they are accessible
 * Run with: npx tsx scripts/test-feeds.ts
 */

import { CURATED_FEEDS } from "../src/lib/discover/curatedFeeds";
import { RSSHUB_ROUTES, buildRSSHubUrl } from "../src/lib/discover/rsshub";

interface TestResult {
  name: string;
  url: string;
  status: number | string;
  ok: boolean;
  source: "curated" | "rsshub";
  category: string;
}

const USER_AGENT = "Mozilla/5.0 (compatible; RSSReader/1.0; +https://github.com/)";

async function testFeed(name: string, url: string, source: "curated" | "rsshub", category: string): Promise<TestResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return {
      name,
      url,
      status: response.status,
      ok: response.ok,
      source,
      category,
    };
  } catch (error) {
    return {
      name,
      url,
      status: error instanceof Error ? error.message : "Unknown error",
      ok: false,
      source,
      category,
    };
  }
}

async function main() {
  console.log("🧪 Testing all discover feeds...\n");

  const results: TestResult[] = [];

  // Test curated feeds
  console.log("📚 Testing curated feeds...");
  for (const [category, feeds] of Object.entries(CURATED_FEEDS)) {
    for (const feed of feeds) {
      process.stdout.write(`  Testing ${feed.name}... `);
      const result = await testFeed(feed.name, feed.feedUrl, "curated", category);
      results.push(result);
      console.log(result.ok ? `✅ ${result.status}` : `❌ ${result.status}`);
    }
  }

  // Test RSSHub routes
  console.log("\n📡 Testing RSSHub routes...");
  for (const [category, routes] of Object.entries(RSSHUB_ROUTES)) {
    for (const route of routes) {
      const url = buildRSSHubUrl(route);
      process.stdout.write(`  Testing ${route.name}... `);
      const result = await testFeed(route.name, url, "rsshub", category);
      results.push(result);
      console.log(result.ok ? `✅ ${result.status}` : `❌ ${result.status}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));

  const working = results.filter(r => r.ok);
  const broken = results.filter(r => !r.ok);

  console.log(`\n✅ Working: ${working.length}/${results.length}`);
  console.log(`❌ Broken: ${broken.length}/${results.length}`);

  if (broken.length > 0) {
    console.log("\n❌ BROKEN FEEDS:");
    console.log("-".repeat(60));

    // Group by source
    const brokenCurated = broken.filter(r => r.source === "curated");
    const brokenRsshub = broken.filter(r => r.source === "rsshub");

    if (brokenCurated.length > 0) {
      console.log("\n📚 Curated feeds to fix:");
      for (const r of brokenCurated) {
        console.log(`  [${r.category}] ${r.name}: ${r.status}`);
        console.log(`    URL: ${r.url}`);
      }
    }

    if (brokenRsshub.length > 0) {
      console.log("\n📡 RSSHub routes to remove/replace:");
      for (const r of brokenRsshub) {
        console.log(`  [${r.category}] ${r.name}: ${r.status}`);
        console.log(`    URL: ${r.url}`);
      }
    }
  }

  // Exit with error code if any feeds are broken
  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch(console.error);
