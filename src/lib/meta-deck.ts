import type { Card, Collection, MetaDeck, MetaDeckSlot } from '../types';
import { ownedCount } from './cards';

export interface SlotResult {
  card: Card | null;
  needed: number;
  owned: number;
  missing: number;
}

export interface MetaDeckResult {
  deck: MetaDeck;
  legend: Card | null;
  legendOwned: number;
  completeness: number;
  mainOwned: number;
  mainTotal: number;
  runesOwned: number;
  runesTotal: number;
  battlefieldsOwned: number;
  battlefieldsTotal: number;
  mainSlots: SlotResult[];
  runeSlots: SlotResult[];
  battlefieldSlots: SlotResult[];
}

function ownedVariants(cardId: string, variantMap: Map<string, string[]>, collection: Collection): number {
  const ids = variantMap.get(cardId) ?? [cardId];
  return ids.reduce((sum, id) => sum + ownedCount(collection, id), 0);
}

function resolveSlot(
  slot: MetaDeckSlot,
  cardMap: Map<string, Card>,
  collection: Collection,
  variantMap: Map<string, string[]>,
): SlotResult {
  const card = cardMap.get(slot.cardId) ?? null;
  const owned = Math.min(ownedVariants(slot.cardId, variantMap, collection), slot.count);
  return { card, needed: slot.count, owned, missing: slot.count - owned };
}

function sumSlots(slots: SlotResult[]): [number, number] {
  let owned = 0, total = 0;
  for (const s of slots) { owned += s.owned; total += s.needed; }
  return [owned, total];
}

export function calcMetaDeckResult(
  deck: MetaDeck,
  cardMap: Map<string, Card>,
  collection: Collection,
  variantMap: Map<string, string[]>,
): MetaDeckResult {
  const legendCard = cardMap.get(deck.legendId) ?? null;
  const legendOwned = Math.min(ownedVariants(deck.legendId, variantMap, collection), 1);

  const mainSlots = deck.main.map((s) => resolveSlot(s, cardMap, collection, variantMap));
  const runeSlots = deck.runes.map((s) => resolveSlot(s, cardMap, collection, variantMap));
  const battlefieldSlots = deck.battlefields.map((s) => resolveSlot(s, cardMap, collection, variantMap));

  const [mainOwned, mainTotal] = sumSlots(mainSlots);
  const [runesOwned, runesTotal] = sumSlots(runeSlots);
  const [battlefieldsOwned, battlefieldsTotal] = sumSlots(battlefieldSlots);

  const totalOwned = legendOwned + mainOwned + runesOwned + battlefieldsOwned;
  const totalNeeded = 1 + mainTotal + runesTotal + battlefieldsTotal;
  const completeness = Math.round((totalOwned / totalNeeded) * 100);

  return {
    deck,
    legend: legendCard,
    legendOwned,
    completeness,
    mainOwned,
    mainTotal,
    runesOwned,
    runesTotal,
    battlefieldsOwned,
    battlefieldsTotal,
    mainSlots,
    runeSlots,
    battlefieldSlots,
  };
}

export function buildCardMap(cards: Card[]): Map<string, Card> {
  return new Map(cards.map((c) => [c.id, c]));
}
