import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATS_CACHE = join(__dirname, 'riftscribe-stats.json');
const REFRESH_STATS = process.argv.includes('--fetch-stats');

async function fetchStatsForCards(cardIds) {
  if (!REFRESH_STATS && existsSync(STATS_CACHE)) {
    const cached = JSON.parse(readFileSync(STATS_CACHE, 'utf8'));
    const missing = cardIds.filter((id) => cached[id] === undefined);
    if (missing.length === 0) {
      console.log(`Using cached Riftscribe stats (${cardIds.length} cards)`);
      return new Map(Object.entries(cached));
    }
    console.log(`Cache partial — fetching ${missing.length} missing cards`);
    cardIds = missing;
  }

  const map = new Map(
    existsSync(STATS_CACHE)
      ? Object.entries(JSON.parse(readFileSync(STATS_CACHE, 'utf8')))
      : [],
  );

  const chunkSize = 20;
  for (let i = 0; i < cardIds.length; i += chunkSize) {
    const chunk = cardIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const res = await fetch(`https://riftscribe.gg/api/cards/${id}`);
          if (!res.ok) return;
          const card = await res.json();
          if (card.stats) {
            map.set(id, {
              might: card.stats.might ?? null,
              power: card.stats.power ?? null,
            });
          }
        } catch {
          /* skip */
        }
      }),
    );
    if (i + chunkSize < cardIds.length) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  writeFileSync(STATS_CACHE, JSON.stringify(Object.fromEntries(map), null, 0));
  console.log(`Riftscribe stats for ${map.size} cards`);
  return map;
}

function parseAdditionalRuneCosts(html) {
  const plain = html.replace(/<[^>]+>/g, ' ');
  const costs = [];
  const seen = new Set();

  const blocks = plain.match(/[^.!?]*additional cost[^.!?]*/gi) ?? [];
  for (const block of blocks) {
    const energy = [...block.matchAll(/:rb_energy_(\d+):/g)].reduce(
      (sum, m) => sum + Number(m[1]),
      0,
    );
    const runes = [...block.matchAll(/:rb_rune_(\w+):/g)].map((m) => m[1]);
    if (energy === 0 && runes.length === 0) continue;

    const key = `${energy}|${runes.join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    costs.push({
      energy: energy > 0 ? energy : null,
      runes,
      optional: true,
    });
  }

  return costs.length > 0 ? costs : null;
}

const source = JSON.parse(readFileSync(join(__dirname, 'source-cards.json'), 'utf8'));
const ids = source.map((c) => c.id.toLowerCase());
const riftscribeStats = await fetchStatsForCards(ids);

const cards = source.map((c) => {
  const types = (c.cardType || []).map((t) => t.id);
  const domains = (c.domains || []).map((d) => d.id);
  const code = (c.publicCode || '').split('/')[0] || c.id;
  const extra = riftscribeStats.get(c.id.toLowerCase());
  const textHtml = c.text || '';

  return {
    id: c.id,
    code,
    name: c.name,
    set: c.set,
    setName: c.setName,
    collectorNumber: c.collectorNumber,
    domains,
    types,
    rarity: c.rarity?.id ?? 'common',
    orientation:
      c.orientation === 'landscape' || types.includes('battlefield') ? 'landscape' : 'portrait',
    image: c.cardImage?.url ?? '',
    energy: c.energy ?? null,
    might: extra?.might ?? c.might ?? null,
    power: extra?.power ?? c.power ?? null,
    additionalCosts: parseAdditionalRuneCosts(textHtml),
    text: textHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  };
});

const withMight = cards.filter((c) => c.might != null).length;
const withExtra = cards.filter((c) => c.additionalCosts?.length).length;
const outDir = join(__dirname, '..', 'public', 'data');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'cards.json'), JSON.stringify(cards));
console.log(
  `Wrote ${cards.length} cards (${withMight} with might, ${withExtra} with additional rune costs)`,
);
