import type { Card, Collection, DeckSuggestion, DomainId } from '../types';
import {
  isBattlefield,
  isLegend,
  isMainDeckCard,
  isRune,
  matchesDomains,
  playableCopies,
  sumPlayableSlots,
} from './cards';

const MAIN_TARGET = 40;
const RUNE_TARGET = 12;
const BATTLEFIELD_TARGET = 3;

export function suggestDecks(cards: Card[], collection: Collection): DeckSuggestion[] {
  const legends = cards.filter((c) => isLegend(c) && playableCopies(collection, c.id, 1) >= 1);

  const suggestions = legends.map((legend) => buildSuggestion(legend, cards, collection));
  return suggestions.sort((a, b) => b.completeness - a.completeness);
}

function buildSuggestion(
  legend: Card,
  allCards: Card[],
  collection: Collection,
): DeckSuggestion {
  const domains = legend.domains as DomainId[];

  const playableMain = allCards.filter(
    (c) =>
      isMainDeckCard(c) &&
      matchesDomains(c, domains) &&
      playableCopies(collection, c.id) > 0,
  );

  const playableRunes = allCards.filter(
    (c) => isRune(c) && matchesDomains(c, domains) && playableCopies(collection, c.id) > 0,
  );

  const playableBattlefields = allCards.filter(
    (c) => isBattlefield(c) && playableCopies(collection, c.id) > 0,
  );

  const mainSlots = sumPlayableSlots(playableMain, collection);
  const runeSlots = sumPlayableSlots(playableRunes, collection);
  const battlefieldCount = new Set(playableBattlefields.map((c) => c.name)).size;

  const mainRatio = Math.min(1, mainSlots / MAIN_TARGET);
  const runeRatio = Math.min(1, runeSlots / RUNE_TARGET);
  const bfRatio = Math.min(1, battlefieldCount / BATTLEFIELD_TARGET);
  const completeness = Math.round(((mainRatio + runeRatio + bfRatio) / 3) * 100);

  return {
    legend,
    mainSlots,
    mainTarget: MAIN_TARGET,
    runeSlots,
    runeTarget: RUNE_TARGET,
    battlefieldCount,
    battlefieldTarget: BATTLEFIELD_TARGET,
    playableMain: sortByOwned(playableMain, collection),
    playableRunes: sortByOwned(playableRunes, collection),
    playableBattlefields: sortByOwned(playableBattlefields, collection),
    completeness,
    missingMain: Math.max(0, MAIN_TARGET - mainSlots),
    missingRunes: Math.max(0, RUNE_TARGET - runeSlots),
    missingBattlefields: Math.max(0, BATTLEFIELD_TARGET - battlefieldCount),
  };
}

function sortByOwned(cards: Card[], collection: Collection): Card[] {
  return [...cards].sort((a, b) => {
    const diff = playableCopies(collection, b.id) - playableCopies(collection, a.id);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

export function canBuildFullDeck(s: DeckSuggestion): boolean {
  return (
    s.missingMain === 0 &&
    s.missingRunes === 0 &&
    s.missingBattlefields === 0
  );
}
