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
        <h2>Aucune légende dans votre collection</h2>
        <p>Ajoutez au moins une carte Légende dans l&apos;onglet Collection pour voir les possibilités de deck.</p>
      </section>
    );
  }

  return (
    <section className="deck-panel">
      <header className="deck-panel__header">
        <div>
          <h2>Possibilités de deck</h2>
          <p className="deck-panel__subtitle">
            Basé sur votre collection · 40 cartes main · 12 runes · 3 champs de bataille
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
              <span className="legend-chip__pct">{s.completeness}% prêt</span>
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <DeckMeters suggestion={selected} />

          <div className="deck-sections">
            <DeckCardList
              title="Légende"
              cards={[selected.legend]}
              collection={collection}
              onChange={onCollectionChange}
              cap={1}
            />
            <DeckCardList
              title={`Deck principal (${Math.min(selected.mainSlots, selected.mainTarget)}/${selected.mainTarget})`}
              cards={selected.playableMain.slice(0, 48)}
              collection={collection}
              onChange={onCollectionChange}
              hint={mainDeckHint(selected)}
            />
            <DeckCardList
              title={`Runes (${Math.min(selected.runeSlots, selected.runeTarget)}/${selected.runeTarget})`}
              cards={selected.playableRunes}
              collection={collection}
              onChange={onCollectionChange}
              hint={runeHint(selected)}
              compact
            />
            <DeckCardList
              title={`Champs de bataille (${Math.min(selected.battlefieldCount, selected.battlefieldTarget)}/${selected.battlefieldTarget})`}
              cards={selected.playableBattlefields}
              collection={collection}
              onChange={onCollectionChange}
              hint={battlefieldHint(selected)}
              compact
            />
          </div>
        </>
      )}
    </section>
  );
}

function filledCount(current: number, target: number): number {
  return Math.min(current, target);
}

function mainDeckHint(s: DeckSuggestion): string | undefined {
  if (s.missingMain > 0) {
    return `Il manque ${s.missingMain} copie${s.missingMain > 1 ? 's' : ''} pour compléter le deck principal`;
  }
  if (s.mainSlots > s.mainTarget) {
    return `${s.mainSlots} copies utilisables dans votre collection (objectif : ${s.mainTarget})`;
  }
  return 'Assez de cartes pour le deck principal';
}

function runeHint(s: DeckSuggestion): string | undefined {
  if (s.missingRunes > 0) {
    return `Il manque ${s.missingRunes} rune${s.missingRunes > 1 ? 's' : ''} pour compléter le deck`;
  }
  if (s.runeSlots > s.runeTarget) {
    return `${s.runeSlots} runes utilisables dans votre collection (objectif : ${s.runeTarget})`;
  }
  return 'Assez de runes pour le deck';
}

function battlefieldHint(s: DeckSuggestion): string | undefined {
  if (s.missingBattlefields > 0) {
    return `Il manque ${s.missingBattlefields} champ${s.missingBattlefields > 1 ? 's' : ''} de bataille différent${s.missingBattlefields > 1 ? 's' : ''}`;
  }
  if (s.battlefieldCount > s.battlefieldTarget) {
    return `${s.battlefieldCount} champs de bataille différents dans votre collection (objectif : ${s.battlefieldTarget})`;
  }
  return 'Assez de champs de bataille pour le deck';
}

function DeckMeters({ suggestion: s }: { suggestion: DeckSuggestion }) {
  const rows = [
    { label: 'Deck principal', current: s.mainSlots, target: s.mainTarget },
    { label: 'Runes', current: s.runeSlots, target: s.runeTarget },
    { label: 'Champs de bataille', current: s.battlefieldCount, target: s.battlefieldTarget },
  ];

  return (
    <div className="deck-meters">
      {rows.map((row) => {
        const filled = filledCount(row.current, row.target);
        const pct = Math.min(100, Math.round((filled / row.target) * 100));
        const overTarget = row.current > row.target;
        return (
          <div key={row.label} className="meter">
            <div className="meter__label">
              <span>{row.label}</span>
              <span>
                {filled} / {row.target}
              </span>
            </div>
            <div className="meter__track">
              <div className="meter__fill" style={{ width: `${pct}%` }} />
            </div>
            {overTarget && (
              <p className="meter__pool">
                {row.current} disponible{row.current > 1 ? 's' : ''} dans votre collection
              </p>
            )}
          </div>
        );
      })}
      {canBuildFullDeck(s) && (
        <p className="deck-ready-banner">Vous pouvez construire un deck complet avec cette légende.</p>
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
