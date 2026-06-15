import type { Card, Collection, DomainId } from '../types';

export const DOMAIN_COLORS: Record<DomainId, string> = {
  fury: '#c23b3b',
  calm: '#3b8f6e',
  mind: '#4a7fd4',
  body: '#c47a2d',
  chaos: '#8b4ad4',
  order: '#d4b84a',
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'showcase'] as const;

/** Showcase (and above epic) cards are always reverse — foil tracking is pointless. */
const FOIL_EXCLUDED_RARITIES = new Set<string>(['showcase']);

export const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  showcase: 'Showcase',
};

export const TYPE_LABELS: Record<string, string> = {
  legend: 'Légendes',
  unit: 'Unités',
  spell: 'Sorts',
  gear: 'Équipements',
  rune: 'Runes',
  battlefield: 'Champs de bataille',
};

export interface CardFilterState {
  search?: string;
  set?: string;
  domain?: DomainId | '';
  type?: string;
  rarityFilter?: string;
  energyFilter?: string;
  mightFilter?: string;
  sacrificeFilter?: string;
}

export interface FilterRelevance {
  domain: boolean;
  rarity: boolean;
  energy: boolean;
  might: boolean;
  sacrifice: boolean;
  foilToggle: boolean;
}

export function isFoilTrackable(card: Card): boolean {
  return !FOIL_EXCLUDED_RARITIES.has(card.rarity);
}

const PLAYABLE_DOMAINS = new Set<DomainId>(['fury', 'calm', 'mind', 'body', 'chaos', 'order']);

function poolHasMeaningfulDomains(pool: Card[]): boolean {
  const domains = new Set<DomainId>();
  for (const card of pool) {
    for (const d of card.domains) {
      if (PLAYABLE_DOMAINS.has(d)) domains.add(d);
    }
  }
  return domains.size > 1;
}

const TYPE_FILTER_OVERRIDES: Record<string, Partial<FilterRelevance>> = {
  battlefield: { domain: false, rarity: false, energy: false, might: false, sacrifice: false },
  rune: { energy: false, might: false, sacrifice: false },
  legend: { energy: false, might: false, sacrifice: false },
  spell: { might: false },
  gear: { might: false },
};

export function hasActiveCardFilters(filters: CardFilterState): boolean {
  return !!(
    filters.search?.trim() ||
    filters.set ||
    filters.domain ||
    filters.type ||
    filters.rarityFilter ||
    filters.energyFilter ||
    filters.mightFilter ||
    filters.sacrificeFilter
  );
}

export function describeActiveFilters(filters: CardFilterState): string {
  const parts: string[] = [];
  if (filters.type) parts.push(TYPE_LABELS[filters.type] ?? filters.type);
  if (filters.set) parts.push(filters.set);
  if (filters.domain) parts.push(filters.domain);
  if (filters.rarityFilter) parts.push(RARITY_LABELS[filters.rarityFilter] ?? filters.rarityFilter);
  if (filters.energyFilter) {
    parts.push(filters.energyFilter === 'none' ? 'sans coût' : `coût ${filters.energyFilter}`);
  }
  if (filters.mightFilter) {
    parts.push(filters.mightFilter === 'none' ? 'sans Might' : `Might ${filters.mightFilter}`);
  }
  if (filters.sacrificeFilter) {
    parts.push(
      filters.sacrificeFilter === 'none'
        ? 'sans runes sacrifiées'
        : `${filters.sacrificeFilter} rune(s) sacr.`,
    );
  }
  if (filters.search?.trim()) parts.push(`« ${filters.search.trim()} »`);
  return parts.join(' · ');
}

export function filterCompletion(
  cards: Card[],
  filters: CardFilterState,
  collection: Collection,
): { owned: number; total: number; pct: number } {
  const scope = filterCards(cards, { ...filters, ownedOnly: false });
  const total = scope.length;
  const owned = scope.filter((c) => ownedCount(collection, c.id) > 0).length;
  return { owned, total, pct: total > 0 ? (owned / total) * 100 : 0 };
}

export function scopedFilterPool(
  cards: Card[],
  setFilter = '',
  typeFilter = '',
): Card[] {
  let pool = cards;
  if (setFilter) pool = pool.filter((c) => c.set === setFilter);
  if (typeFilter) pool = pool.filter((c) => c.types.includes(typeFilter as Card['types'][number]));
  return pool;
}

export function isLegend(card: Card): boolean {
  return card.types.includes('legend');
}

export function isRune(card: Card): boolean {
  return card.types.includes('rune');
}

export function isBattlefield(card: Card): boolean {
  return card.types.includes('battlefield');
}

export function isLandscapeCard(card: Card): boolean {
  return card.orientation === 'landscape' || isBattlefield(card);
}

export function isMainDeckCard(card: Card): boolean {
  return (
    card.types.some((t) => t === 'unit' || t === 'spell' || t === 'gear') &&
    !isLegend(card) &&
    !isBattlefield(card)
  );
}

export function matchesDomains(card: Card, legendDomains: DomainId[]): boolean {
  if (card.domains.length === 0) return true;
  return card.domains.every((d) => legendDomains.includes(d));
}

export function ownedCount(collection: Collection, cardId: string): number {
  return collection[cardId] ?? 0;
}

export function playableCopies(collection: Collection, cardId: string, cap = 3): number {
  return Math.min(ownedCount(collection, cardId), cap);
}

export function totalOwnedCopies(cards: Card[], collection: Collection): number {
  return cards.reduce((sum, c) => sum + ownedCount(collection, c.id), 0);
}

export function sumPlayableSlots(cards: Card[], collection: Collection, cap = 3): number {
  return cards.reduce((sum, c) => sum + playableCopies(collection, c.id, cap), 0);
}

/** Strip separators so "ogn042" matches "OGN-042" and "ogn 042". */
export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[\s\-_/.,]+/g, '');
}

function cardMatchesSearch(card: Card, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const hay = `${card.name} ${card.code} ${card.id} ${card.set} ${card.setName}`.toLowerCase();
  if (hay.includes(q)) return true;

  const qNorm = normalizeSearchText(q);
  if (!qNorm) return true;

  const hayNorm = normalizeSearchText(hay);
  return hayNorm.includes(qNorm);
}

export type StatFilterKey = 'energy' | 'might';

/** Runes sacrificed to activate (Riftscribe `power`, e.g. Seal of Discord). */
export function cardSacrificeCount(card: Card): number | null {
  if (card.power == null || card.power <= 0) return null;
  return card.power;
}

export function uniqueSacrificeValues(cards: Card[]): number[] {
  const values = new Set<number>();
  for (const card of cards) {
    const n = cardSacrificeCount(card);
    if (n != null) values.add(n);
  }
  return [...values].sort((a, b) => a - b);
}

export function uniqueStatValues(cards: Card[], key: StatFilterKey): number[] {
  const values = new Set<number>();
  for (const card of cards) {
    const value = card[key];
    if (value != null) values.add(value);
  }
  return [...values].sort((a, b) => a - b);
}

function poolHasVariedStat(pool: Card[], key: StatFilterKey): boolean {
  const values = new Set<number | null>(pool.map((c) => c[key]));
  if (values.size > 1) return true;
  return values.has(null) && [...values].some((v) => v != null);
}

function poolHasVariedSacrifice(pool: Card[]): boolean {
  const values = new Set<number | null>(pool.map((c) => cardSacrificeCount(c)));
  return values.size > 1;
}

export function computeFilterRelevance(pool: Card[], typeFilter = ''): FilterRelevance {
  const overrides = typeFilter ? TYPE_FILTER_OVERRIDES[typeFilter] : undefined;
  return {
    domain: overrides?.domain ?? poolHasMeaningfulDomains(pool),
    rarity: overrides?.rarity ?? uniqueRarities(pool).length > 1,
    energy: overrides?.energy ?? poolHasVariedStat(pool, 'energy'),
    might: overrides?.might ?? poolHasVariedStat(pool, 'might'),
    sacrifice: overrides?.sacrifice ?? poolHasVariedSacrifice(pool),
    foilToggle: pool.some(isFoilTrackable),
  };
}

export function matchesStatFilter(value: number | null, filter: string): boolean {
  if (!filter) return true;
  if (filter === 'none') return value === null;
  const target = Number(filter);
  if (Number.isNaN(target)) return true;
  return value === target;
}

export function filterCards(
  cards: Card[],
  opts: {
    search?: string;
    set?: string;
    domain?: DomainId | '';
    type?: string;
    rarityFilter?: string;
    energyFilter?: string;
    mightFilter?: string;
    sacrificeFilter?: string;
    ownedOnly?: boolean;
    collection?: Collection;
  },
): Card[] {
  const q = opts.search?.trim().toLowerCase() ?? '';
  return cards.filter((card) => {
    if (opts.set && card.set !== opts.set) return false;
    if (opts.domain && !card.domains.includes(opts.domain)) return false;
    if (opts.type && !card.types.includes(opts.type as Card['types'][number])) {
      return false;
    }
    if (opts.rarityFilter && card.rarity !== opts.rarityFilter) return false;
    if (!matchesStatFilter(card.energy, opts.energyFilter ?? '')) return false;
    if (!matchesStatFilter(card.might, opts.mightFilter ?? '')) return false;
    if (!matchesStatFilter(card.power, opts.sacrificeFilter ?? '')) return false;
    if (opts.ownedOnly && opts.collection) {
      if (ownedCount(opts.collection, card.id) < 1) return false;
    }
    if (q && !cardMatchesSearch(card, q)) return false;
    return true;
  });
}

/** Maps each card ID to all IDs of the same card (name+set) across variants/alt-arts. */
export function buildVariantMap(cards: Card[]): Map<string, string[]> {
  const byName = new Map<string, string[]>();
  for (const card of cards) {
    const key = `${card.set}::${card.name}`;
    const group = byName.get(key) ?? [];
    group.push(card.id);
    byName.set(key, group);
  }
  const result = new Map<string, string[]>();
  for (const ids of byName.values()) {
    for (const id of ids) result.set(id, ids);
  }
  return result;
}

export function uniqueSets(cards: Card[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const c of cards) map.set(c.set, c.setName);
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function uniqueRarities(cards: Card[]): string[] {
  const present = new Set(cards.map((c) => c.rarity));
  return RARITY_ORDER.filter((r) => present.has(r));
}
