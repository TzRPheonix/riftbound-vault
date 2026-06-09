import type { CSSProperties } from 'react';
import type { Card } from '../types';
import { DOMAIN_COLORS, isLandscapeCard } from '../lib/cards';
import './CardTile.css';

interface CardTileProps {
  card: Card;
  owned: number;
  foil?: number;
  onChange: (delta: number) => void;
  onFoilChange?: (delta: number) => void;
  compact?: boolean;
  selected?: boolean;
  quickAdd?: boolean;
  onOpen?: () => void;
}

export function CardTile({
  card,
  owned,
  foil = 0,
  onChange,
  onFoilChange,
  compact = false,
  selected = false,
  quickAdd = false,
  onOpen,
}: CardTileProps) {
  const primaryDomain = card.domains[0];
  const accent = primaryDomain ? DOMAIN_COLORS[primaryDomain] : '#c9a227';
  const landscape = isLandscapeCard(card);
  const layout = landscape ? 'landscape' : 'portrait';

  const handleTileClick = () => {
    if (quickAdd) onChange(1);
    else onOpen?.();
  };

  return (
    <article
      className={`card-tile ${landscape ? 'card-tile--landscape' : ''} ${compact ? 'card-tile--compact' : ''} ${selected ? 'card-tile--selected' : ''} ${owned > 0 ? 'card-tile--owned' : ''} ${foil > 0 ? 'card-tile--foil' : ''} ${quickAdd ? 'card-tile--quick-add' : 'card-tile--zoomable'}`}
      data-layout={layout}
      style={{ '--card-accent': accent } as CSSProperties}
      onClick={handleTileClick}
    >
      <div className={`card-tile__frame card-tile__frame--${layout}`}>
        {card.image ? (
          <img
            className="card-tile__image"
            src={card.image}
            alt={card.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="card-tile__placeholder">{card.name}</div>
        )}
        <div className="card-tile__shine" aria-hidden />
        {foil > 0 && <div className="card-tile__holo" aria-hidden />}
        {(owned > 0 || foil > 0) && (
          <div className="card-tile__badges">
            {foil > 0 && <span className="card-tile__foil-badge">✦ {foil}</span>}
            <span className="card-tile__badge">{owned + foil}</span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="card-tile__meta">
          <h3 className="card-tile__name" title={card.name}>
            {card.name}
          </h3>
          <p className="card-tile__code">{card.code}</p>
        </div>
      )}

      <div className="card-tile__controls" onClick={(e) => e.stopPropagation()}>
        <div className="qty-row">
          <button type="button" className="qty-btn" onClick={() => onChange(-1)} disabled={owned <= 0}>−</button>
          <span className="qty-value">{owned}</span>
          <button type="button" className="qty-btn" onClick={() => onChange(1)}>+</button>
        </div>
        {onFoilChange && (
          <div className="qty-row qty-row--foil">
            <button type="button" className="qty-btn qty-btn--foil" onClick={() => onFoilChange(-1)} disabled={foil <= 0}>−</button>
            <span className="qty-value qty-value--foil">✦{foil}</span>
            <button type="button" className="qty-btn qty-btn--foil" onClick={() => onFoilChange(1)}>+</button>
          </div>
        )}
      </div>
    </article>
  );
}
