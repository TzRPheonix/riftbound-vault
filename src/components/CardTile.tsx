import type { CSSProperties } from 'react';
import type { Card, CardPrice } from '../types';
import { DOMAIN_COLORS, isLandscapeCard } from '../lib/cards';
import './CardTile.css';

interface CardTileProps {
  card: Card;
  owned: number;
  foil?: number;
  price?: CardPrice;
  onChange: (delta: number) => void;
  onFoilChange?: (delta: number) => void;
  compact?: boolean;
  selected?: boolean;
  quickAdd?: boolean;
  onOpen?: () => void;
  inShoppingList?: boolean;
  onToggleShopping?: () => void;
  listMode?: 'collection' | 'shopping';
  shoppingQty?: number;
}

export function CardTile({
  card,
  owned,
  foil = 0,
  price,
  onChange,
  onFoilChange,
  compact = false,
  selected = false,
  quickAdd = false,
  onOpen,
  inShoppingList = false,
  onToggleShopping,
  listMode = 'collection',
  shoppingQty = 0,
}: CardTileProps) {
  const primaryDomain = card.domains[0];
  const accent = primaryDomain ? DOMAIN_COLORS[primaryDomain] : '#c9a227';
  const landscape = isLandscapeCard(card);
  const layout = landscape ? 'landscape' : 'portrait';
  const isShopping = listMode === 'shopping';
  const listQty = isShopping ? shoppingQty : owned;
  const showListBadge = isShopping ? shoppingQty > 0 : owned > 0 || foil > 0;

  const handleTileClick = () => {
    if (quickAdd) onChange(1);
    else onOpen?.();
  };

  return (
    <article
      className={`card-tile ${landscape ? 'card-tile--landscape' : ''} ${compact ? 'card-tile--compact' : ''} ${selected ? 'card-tile--selected' : ''} ${!isShopping && owned > 0 ? 'card-tile--owned' : ''} ${isShopping && shoppingQty > 0 ? 'card-tile--in-list' : ''} ${foil > 0 ? 'card-tile--foil' : ''} ${quickAdd ? 'card-tile--quick-add' : 'card-tile--zoomable'}`}
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
        {showListBadge && (
          <div className="card-tile__badges">
            {!isShopping && foil > 0 && <span className="card-tile__foil-badge">✦ {foil}</span>}
            <span className={`card-tile__badge ${isShopping ? 'card-tile__badge--list' : ''}`}>
              {isShopping ? shoppingQty : owned + foil}
            </span>
          </div>
        )}
        {!isShopping && onToggleShopping && (
          <button
            type="button"
            className={`card-tile__cart ${inShoppingList ? 'card-tile__cart--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleShopping();
            }}
            title={inShoppingList ? 'Retirer de la liste d\'achats' : 'Ajouter à la liste d\'achats'}
            aria-label={inShoppingList ? 'Retirer de la liste d\'achats' : 'Ajouter à la liste d\'achats'}
          >
            🛒
          </button>
        )}
      </div>

      {!compact && (
        <div className="card-tile__meta">
          <h3 className="card-tile__name" title={card.name}>
            {card.name}
          </h3>
          <p className="card-tile__code">
            {card.code}
            {price?.lowest != null && (
              <span className="card-tile__price">
                {price.lowest.toLocaleString('fr-FR', { style: 'currency', currency: price.currency })}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="card-tile__controls" onClick={(e) => e.stopPropagation()}>
        <div className="qty-row">
          <button type="button" className="qty-btn" onClick={() => onChange(-1)} disabled={listQty <= 0}>−</button>
          <span className={`qty-value ${isShopping ? 'qty-value--list' : ''}`}>{listQty}</span>
          <button type="button" className="qty-btn" onClick={() => onChange(1)}>+</button>
        </div>
        {!isShopping && onFoilChange && (
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
