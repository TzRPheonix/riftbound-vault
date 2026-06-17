export type DomainId =
  | 'fury'
  | 'calm'
  | 'mind'
  | 'body'
  | 'chaos'
  | 'order';

export type CardOrientation = 'portrait' | 'landscape';

export type CardTypeId =
  | 'unit'
  | 'spell'
  | 'gear'
  | 'rune'
  | 'battlefield'
  | 'legend'
  | 'token';

/** Extra runes paid on top of base cost (often consumed, e.g. Accelerate). */
export interface AdditionalRuneCost {
  energy: number | null;
  runes: string[];
  optional: boolean;
}

export interface Card {
  id: string;
  code: string;
  name: string;
  set: string;
  setName: string;
  collectorNumber: number;
  domains: DomainId[];
  types: CardTypeId[];
  rarity: string;
  orientation: CardOrientation;
  image: string;
  /** Base rune cost (top-left on the card). */
  energy: number | null;
  /** Might (top-right on the card). */
  might: number | null;
  /** Runes sacrificed to activate (Recycle / [Add], etc.). */
  power: number | null;
  additionalCosts: AdditionalRuneCost[] | null;
  text: string;
}

export type Collection = Record<string, number>;

/** Shopping list entry — checked = bought/found (does not affect collection). */
export interface ShoppingListEntry {
  checked: boolean;
  qty: number;
}

export type ShoppingList = Record<string, ShoppingListEntry>;

export interface CardPrice {
  lowest: number | null;
  avg30d: number | null;
  currency: string;
}
export type PriceMap = Record<string, CardPrice>;

export interface MetaDeckSlot {
  cardId: string;
  count: number;
}

export interface MetaDeck {
  id: string;
  name: string;
  champion: string;
  tier: 'S' | 'A' | 'B' | 'C';
  legendId: string;
  main: MetaDeckSlot[];
  runes: MetaDeckSlot[];
  battlefields: MetaDeckSlot[];
}

export interface CollectionExport {
  version: 1;
  exportedAt: string;
  collection: Collection;
}

export interface DeckSlot {
  card: Card;
  count: number;
}

export interface DeckSuggestion {
  legend: Card;
  mainSlots: number;
  mainTarget: number;
  runeSlots: number;
  runeTarget: number;
  battlefieldCount: number;
  battlefieldTarget: number;
  playableMain: Card[];
  playableRunes: Card[];
  playableBattlefields: Card[];
  completeness: number;
  missingMain: number;
  missingRunes: number;
  missingBattlefields: number;
}
