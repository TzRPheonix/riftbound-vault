/**
 * Fetches card prices from the RapidAPI Riftbound Prices API and writes
 * public/data/prices.json. Designed to run at build time (GitHub Actions).
 *
 * Rate limits: 95 req/day hard cap, 2.2s delay between pages (~27 req/min < 30 limit).
 * Cache: if prices.json is less than 23h old the script exits immediately (0 API calls).
 *
 * Required env: RAPIDAPI_KEY
 * If key is absent the script is a no-op (skips fetch, leaves existing file intact).
 *
 * NOTE: verify the endpoint path below from the RapidAPI playground Code Snippet.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR  = join(__dirname, '../public/data');
const OUT_PATH = join(OUT_DIR, 'prices.json');

const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'riftbound-prices-api.p.rapidapi.com';

// Episode IDs in the tcggo API (episode.id in the JSON response)
const EPISODES = [
  411, // Origins Main Set (OGN)
  409, // Origins Proving Grounds (OGS)
];

const MAX_REQUESTS  = 95;   // hard daily budget
const DELAY_MS      = 2200; // ~27 req/min, safely under the 30/min rate limit
const CACHE_TTL_MS  = 23 * 60 * 60 * 1000; // skip if file is fresher than 23h

// ── Cache check ──────────────────────────────────────────────────────────────
if (existsSync(OUT_PATH)) {
  const existing = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
  const age = Date.now() - new Date(existing._fetchedAt ?? 0).getTime();
  if (age < CACHE_TTL_MS) {
    console.log(`Prices cache is fresh (${Math.round(age / 3_600_000)}h old) — skipping API calls`);
    process.exit(0);
  }
}

// ── No key → keep existing file, don't fail the build ───────────────────────
if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not set — skipping price fetch (existing prices kept)');
  if (!existsSync(OUT_PATH)) {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify({ _fetchedAt: new Date(0).toISOString() }, null, 2));
  }
  process.exit(0);
}

// ── Fetch ────────────────────────────────────────────────────────────────────
let requestCount = 0;
const prices = {};

async function fetchPage(episodeId, page) {
  if (requestCount >= MAX_REQUESTS) {
    console.warn(`Reached ${MAX_REQUESTS}-request daily cap — stopping early`);
    return null;
  }
  requestCount++;
  const url = `https://${RAPIDAPI_HOST}/cards?episode_id=${episodeId}&page=${page}&per_page=20`;
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status} for episode ${episodeId} page ${page}`);
    return null;
  }
  return res.json();
}

for (const episodeId of EPISODES) {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && requestCount < MAX_REQUESTS) {
    const data = await fetchPage(episodeId, page);
    if (!data) break;

    totalPages = data.paging?.total ?? 1;

    for (const card of data.data ?? []) {
      // "OGN-301/298" → "OGN-301" (matches card.code in cards.json)
      const raw  = card.card_code_number ?? card.card_number ?? '';
      const code = raw.split('/')[0].trim();
      if (!code) continue;
      const cm = card.prices?.cardmarket;
      if (!cm) continue;
      prices[code] = {
        lowest:   cm.lowest_near_mint_FR_EU_only ?? cm.lowest_near_mint_FR ?? cm.lowest_near_mint_EU_only ?? cm.lowest_near_mint ?? null,
        avg30d:   cm['30d_average'] ?? null,
        currency: cm.currency      ?? 'EUR',
      };
    }

    console.log(
      `Episode ${episodeId} page ${page}/${totalPages}: ` +
      `${data.data?.length ?? 0} cards  (${requestCount}/${MAX_REQUESTS} requests used)`
    );

    page++;
    if (page <= totalPages && requestCount < MAX_REQUESTS) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  OUT_PATH,
  JSON.stringify(
    { _fetchedAt: new Date().toISOString(), _requestsUsed: requestCount, ...prices },
    null,
    2
  )
);
console.log(`Done: ${Object.keys(prices).length} prices written, ${requestCount} API requests used`);
