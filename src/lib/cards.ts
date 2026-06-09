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

export const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  showcase: 'Showcase',
};

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
