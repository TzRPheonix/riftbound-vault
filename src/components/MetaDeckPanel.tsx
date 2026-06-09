import { useState } from 'react';
import type { Card, Collection } from '../types';
import type { MetaDeckResult, SlotResult } from '../lib/meta-deck';
import { TIER_ORDER } from '../data/meta-decks';
import './MetaDeckPanel.css';

interface MetaDeckPanelProps {
  results: MetaDeckResult[];
  collection: Collection;
  onCollectionChange: (cardId: string, delta: number) => void;
}

const TIER_LABELS: Record<string, string> = { S: 'S', A: 'A', B: 'B', C: 'C' };

export function MetaDeckPanel({ results, onCollectionChange }: MetaDeckPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    results.length > 0 ? results[0].deck.id : null,
  );

  const sorted = [...results].sort(
    (a, b) =>
      TIER_ORDER[a.deck.tier] - TIER_ORDER[b.deck.tier] ||
      b.completeness - a.completeness,
  );

  const selected = sorted.find((r) => r.deck.id === selectedId) ?? sorted[0] ?? null;

  const byTier = sorted.reduce<Record<string, MetaDeckResult[]>>((acc, r) => {
    (acc[r.deck.tier] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="meta-panel">
      <aside className="meta-panel__sidebar">
        {(['S', 'A', 'B', 'C'] as const).map((tier) =>
          byTier[tier] ? (
            <div key={tier} className="meta-tier-group">
              <div className={`meta-tier-label meta-tier-label--${tier.toLowerCase()}`}>
                Tier {TIER_LABELS[tier]}
              </div>
              {byTier[tier].map((r) => (
                <button
                  key={r.deck.id}
                  type="button"
                  className={`meta-deck-chip ${selectedId === r.deck.id ? 'meta-deck-chip--active' : ''}`}
                  onClick={() => setSelectedId(r.deck.id)}
                >
                  <span className="meta-deck-chip__name">
                    {r.deck.champion}
                    <span className="meta-deck-chip__style"> · {r.deck.name}</span>
                  </span>
                  <span
                    className={`meta-deck-chip__pct ${r.completeness >= 100 ? 'meta-deck-chip__pct--complete' : ''}`}
                  >
                    {r.completeness}%
                  </span>
                </button>
              ))}
            </div>
          ) : null,
        )}
      </aside>

      <main className="meta-panel__detail">
        {selected ? <DeckDetail result={selected} onChange={onCollectionChange} /> : null}
      </main>
    </div>
  );
}

function DeckDetail({
  result: r,
  onChange,
}: {
  result: MetaDeckResult;
  onChange: (id: string, delta: number) => void;
}) {
  return (
    <div className="deck-detail">
      <header className="deck-detail__header">
        <div>
          <h2 className="deck-detail__title">
            {r.deck.champion}
            <span className={`tier-badge tier-badge--${r.deck.tier.toLowerCase()}`}>
              {r.deck.tier}
            </span>
          </h2>
          <p className="deck-detail__subtitle">{r.deck.name} · OGN uniquement</p>
        </div>
        <div className="deck-detail__pct">
          <span className="deck-detail__pct-value">{r.completeness}%</span>
          <span className="deck-detail__pct-label">complété</span>
        </div>
      </header>

      <div className="deck-detail__meters">
        {[
          { label: 'Deck principal', owned: r.mainOwned, total: r.mainTotal },
          { label: 'Runes', owned: r.runesOwned, total: r.runesTotal },
          { label: 'Champs de bataille', owned: r.battlefieldsOwned, total: r.battlefieldsTotal },
        ].map((m) => (
          <div key={m.label} className="detail-meter">
            <div className="detail-meter__label">
              <span>{m.label}</span>
              <span>{m.owned} / {m.total}</span>
            </div>
            <div className="detail-meter__track">
              <div
                className="detail-meter__fill"
                style={{ width: `${Math.min(100, Math.round((m.owned / m.total) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="deck-detail__sections">
        {r.legend && (
          <SlotSection
            title="Légende"
            slots={[{ card: r.legend, needed: 1, owned: 0, missing: 1 }]}
            legendId={r.deck.legendId}
            onChange={onChange}
          />
        )}
        <SlotSection title={`Deck principal (${r.mainOwned}/${r.mainTotal})`} slots={r.mainSlots} onChange={onChange} />
        <SlotSection title={`Runes (${r.runesOwned}/${r.runesTotal})`} slots={r.runeSlots} onChange={onChange} compact />
        <SlotSection
          title={`Champs de bataille (${r.battlefieldsOwned}/${r.battlefieldsTotal})`}
          slots={r.battlefieldSlots}
          onChange={onChange}
          compact
        />
      </div>
    </div>
  );
}

function SlotSection({
  title,
  slots,
  onChange,
  compact = false,
  legendId,
}: {
  title: string;
  slots: SlotResult[];
  onChange: (id: string, delta: number) => void;
  compact?: boolean;
  legendId?: string;
}) {
  if (slots.length === 0) return null;
  return (
    <section className="slot-section">
      <h3 className="slot-section__title">{title}</h3>
      <div className={`slot-list ${compact ? 'slot-list--compact' : ''}`}>
        {slots.map((s, i) => (
          <SlotRow
            key={s.card?.id ?? i}
            slot={s}
            isLegend={!!legendId}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function SlotRow({
  slot,
  isLegend,
  onChange,
}: {
  slot: SlotResult;
  isLegend: boolean;
  onChange: (id: string, delta: number) => void;
}) {
  const { card, needed, owned, missing } = slot;
  const complete = missing === 0;

  return (
    <div className={`slot-row ${complete ? 'slot-row--complete' : missing === needed ? 'slot-row--missing' : 'slot-row--partial'}`}>
      {card?.image && (
        <img className="slot-row__thumb" src={card.image} alt="" loading="lazy" />
      )}
      <span className="slot-row__name">{card?.name ?? slot.card?.id ?? '?'}</span>
      <span className="slot-row__count">×{needed}</span>
      <div className="slot-row__owned">
        {!isLegend && (
          <button
            type="button"
            className="slot-row__btn"
            onClick={() => card && onChange(card.id, -1)}
            disabled={!card || owned === 0}
          >
            −
          </button>
        )}
        <span className={`slot-row__qty ${complete ? 'slot-row__qty--ok' : missing > 0 ? 'slot-row__qty--missing' : ''}`}>
          {owned}/{needed}
        </span>
        {!isLegend && (
          <button
            type="button"
            className="slot-row__btn"
            onClick={() => card && onChange(card.id, 1)}
            disabled={!card}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
