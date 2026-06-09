import type { Card, Collection, DeckSuggestion } from '../types';
import { canBuildFullDeck } from '../lib/deck';
import { playableCopies } from '../lib/cards';
import { CardTile } from './CardTile';
import './DeckPanel.css';

interface DeckPanelProps {
  suggestions: DeckSuggestion[];
  collection: Collection;
  selectedLegendId: string | null;
  onSelectLegend: (id: string) => void;
  onCollectionChange: (cardId: string, delta: number) => void;
}

export function DeckPanel({
  suggestions,
  collection,
  selectedLegendId,
  onSelectLegend,
  onCollectionChange,
}: DeckPanelProps) {
  const selected =
    suggestions.find((s) => s.legend.id === selectedLegendId) ?? suggestions[0] ?? null;

  if (suggestions.length === 0) {
    return (
      <section className="deck-panel deck-panel--empty">
        <h2>No legends in your collection yet</h2>
        <p>Add at least one Legend card in the Collection tab to see deck possibilities.</p>
      </section>
    );
  }

  return (
    <section className="deck-panel">
      <header className="deck-panel__header">
        <div>
          <h2>Deck possibilities</h2>
          <p className="deck-panel__subtitle">
            Based on cards you own · 40 main · 12 runes · 3 battlefields
          </p>
        </div>
      </header>

      <div className="legend-picker">
        {suggestions.map((s) => (
          <button
            key={s.legend.id}
            type="button"
            className={`legend-chip ${selected?.legend.id === s.legend.id ? 'legend-chip--active' : ''} ${canBuildFullDeck(s) ? 'legend-chip--ready' : ''}`}
            onClick={() => onSelectLegend(s.legend.id)}
          >
            <img src={s.legend.image} alt="" className="legend-chip__thumb" />
            <span className="legend-chip__info">
              <span className="legend-chip__name">{s.legend.name}</span>
              <span className="legend-chip__pct">{s.completeness}% ready</span>
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <DeckMeters suggestion={selected} />

          <div className="deck-sections">
            <DeckCardList
              title="Legend"
              cards={[selected.legend]}
              collection={collection}
              onChange={onCollectionChange}
              cap={1}
            />
            <DeckCardList
              title={`Main deck pool (${selected.mainSlots}/${selected.mainTarget} slots)`}
              cards={selected.playableMain.slice(0, 48)}
              collection={collection}
              onChange={onCollectionChange}
              hint={
                selected.missingMain > 0
                  ? `Need ${selected.missingMain} more main-deck slots from your collection`
                  : 'Enough main-deck cards in collection'
              }
            />
            <DeckCardList
              title={`Runes (${selected.runeSlots}/${selected.runeTarget})`}
              cards={selected.playableRunes}
              collection={collection}
              onChange={onCollectionChange}
              compact
            />
            <DeckCardList
              title={`Battlefields (${selected.battlefieldCount}/${selected.battlefieldTarget} unique)`}
              cards={selected.playableBattlefields}
              collection={collection}
              onChange={onCollectionChange}
              compact
            />
          </div>
        </>
      )}
    </section>
  );
}

function DeckMeters({ suggestion: s }: { suggestion: DeckSuggestion }) {
  const rows = [
    { label: 'Main deck', current: s.mainSlots, target: s.mainTarget },
    { label: 'Runes', current: s.runeSlots, target: s.runeTarget },
    { label: 'Battlefields', current: s.battlefieldCount, target: s.battlefieldTarget },
  ];

  return (
    <div className="deck-meters">
      {rows.map((row) => {
        const pct = Math.min(100, Math.round((row.current / row.target) * 100));
        return (
          <div key={row.label} className="meter">
            <div className="meter__label">
              <span>{row.label}</span>
              <span>
                {row.current} / {row.target}
              </span>
            </div>
            <div className="meter__track">
              <div className="meter__fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {canBuildFullDeck(s) && (
        <p className="deck-ready-banner">You can build a complete deck with this legend.</p>
      )}
    </div>
  );
}

function DeckCardList({
  title,
  cards,
  collection,
  onChange,
  hint,
  compact = false,
  cap = 3,
}: {
  title: string;
  cards: Card[];
  collection: Collection;
  onChange: (id: string, delta: number) => void;
  hint?: string;
  compact?: boolean;
  cap?: number;
}) {
  if (cards.length === 0) return null;

  return (
    <div className="deck-card-list">
      <h3>{title}</h3>
      {hint && <p className="deck-card-list__hint">{hint}</p>}
      <div className={`deck-card-list__grid ${compact ? 'deck-card-list__grid--compact' : ''}`}>
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            owned={playableCopies(collection, card.id, cap)}
            onChange={(d) => onChange(card.id, d)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
