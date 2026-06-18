import { useMemo, useState } from 'react';
import type { Card, Collection, PriceMap, ShoppingList } from '../types';
import { filterCards, ownedCount, type CardFilterState } from '../lib/cards';
import './ShoppingListPanel.css';

function formatPrice(amount: number, currency: string): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency });
}

interface ShoppingListPanelProps {
  cardMap: Map<string, Card>;
  shoppingList: ShoppingList;
  collection: Collection;
  prices: PriceMap;
  cardFilters: CardFilterState;
  ownedOnly: boolean;
  notOwnedOnly: boolean;
  sortBy: string;
  filteredNotOwnedCount: number;
  onToggleChecked: (cardId: string) => void;
  onQtyChange: (cardId: string, delta: number) => void;
  onRemove: (cardId: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onAddFilteredNotOwned: () => void;
}

export function ShoppingListPanel({
  cardMap,
  shoppingList,
  collection,
  prices,
  cardFilters,
  ownedOnly,
  notOwnedOnly,
  sortBy,
  filteredNotOwnedCount,
  onToggleChecked,
  onQtyChange,
  onRemove,
  onClearChecked,
  onClearAll,
  onAddFilteredNotOwned,
}: ShoppingListPanelProps) {
  const [hideChecked, setHideChecked] = useState(false);

  const entries = useMemo(() => {
    const listCards = Object.keys(shoppingList)
      .map((id) => cardMap.get(id))
      .filter((c): c is Card => !!c);

    const matchingIds = new Set(
      filterCards(listCards, {
        ...cardFilters,
        ownedOnly,
        notOwnedOnly,
        collection,
      }).map((c) => c.id),
    );

    const items = Object.entries(shoppingList)
      .map(([id, entry]) => {
        if (!matchingIds.has(id)) return null;
        const card = cardMap.get(id);
        if (!card) return null;
        const cardPrice = prices[card.code];
        const unitPrice = cardPrice?.lowest ?? null;
        const currency = cardPrice?.currency ?? 'EUR';
        const lineTotal = unitPrice != null ? unitPrice * entry.qty : null;
        return { card, entry, unitPrice, lineTotal, currency };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const cmpName = (a: typeof items[0], b: typeof items[0]) =>
      a.card.name.localeCompare(b.card.name, 'fr');

    items.sort((a, b) => {
      if (sortBy === 'price-asc') {
        const pa = a.unitPrice ?? Infinity;
        const pb = b.unitPrice ?? Infinity;
        return pa - pb || cmpName(a, b);
      }
      if (sortBy === 'price-desc') {
        const pa = a.unitPrice ?? -Infinity;
        const pb = b.unitPrice ?? -Infinity;
        return pb - pa || cmpName(a, b);
      }
      if (a.entry.checked !== b.entry.checked) return a.entry.checked ? 1 : -1;
      return cmpName(a, b);
    });

    return hideChecked ? items.filter((x) => !x.entry.checked) : items;
  }, [shoppingList, cardMap, prices, hideChecked, sortBy, cardFilters, ownedOnly, notOwnedOnly, collection]);

  const visibleTotal = useMemo(
    () => entries.reduce((sum, { lineTotal, entry }) => sum + (entry.checked ? 0 : lineTotal ?? 0), 0),
    [entries],
  );

  const stats = useMemo(() => {
    let lines = 0;
    let copies = 0;
    let checked = 0;
    let estValue = 0;
    for (const [id, entry] of Object.entries(shoppingList)) {
      lines += 1;
      copies += entry.qty;
      if (entry.checked) checked += 1;
      else {
        const card = cardMap.get(id);
        const price = card ? prices[card.code]?.lowest ?? 0 : 0;
        estValue += entry.qty * price;
      }
    }
    return { lines, copies, checked, remaining: lines - checked, estValue };
  }, [shoppingList, cardMap, prices]);

  const matchingCount = useMemo(() => {
    const listCards = Object.keys(shoppingList)
      .map((id) => cardMap.get(id))
      .filter((c): c is Card => !!c);
    return filterCards(listCards, {
      ...cardFilters,
      ownedOnly,
      notOwnedOnly,
      collection,
    }).length;
  }, [shoppingList, cardMap, cardFilters, ownedOnly, notOwnedOnly, collection]);

  const hiddenByFilters = stats.lines - matchingCount;

  return (
    <div className="shopping-panel">
      <header className="shopping-panel__header">
        <div>
          <h2 className="shopping-panel__title">Liste d&apos;achats</h2>
          <p className="shopping-panel__subtitle">
            {stats.lines === 0 ? (
              'Aucune carte — parcours la galerie ci-dessous pour en ajouter'
            ) : (
              <>
                {stats.copies} exemplaire{stats.copies !== 1 ? 's' : ''}
                {stats.remaining < stats.lines && ` · ${stats.remaining} ligne${stats.remaining !== 1 ? 's' : ''} restante${stats.remaining !== 1 ? 's' : ''}`}
                {stats.estValue > 0 && <> · ~{formatPrice(stats.estValue, 'EUR')}</>}
              </>
            )}
          </p>
        </div>
        {stats.lines > 0 && (
          <div className="shopping-panel__progress">
            <div className="shopping-panel__progress-track">
              <div
                className="shopping-panel__progress-fill"
                style={{ width: `${stats.lines > 0 ? (stats.checked / stats.lines) * 100 : 0}%` }}
              />
            </div>
            <span className="shopping-panel__progress-label">
              {stats.checked}/{stats.lines}
            </span>
          </div>
        )}
      </header>

      <div className="shopping-panel__toolbar">
        <label className="shopping-panel__toggle">
          <input
            type="checkbox"
            checked={hideChecked}
            onChange={(e) => setHideChecked(e.target.checked)}
          />
          Masquer les cochées
        </label>
        <div className="shopping-panel__toolbar-actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onAddFilteredNotOwned}>
            + Filtre non possédées ({filteredNotOwnedCount})
          </button>
          {stats.checked > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClearChecked}>
              Retirer les cochées
            </button>
          )}
          {stats.lines > 0 && (
            <button type="button" className="btn btn--danger btn--sm" onClick={onClearAll}>
              Vider la liste
            </button>
          )}
        </div>
      </div>

      {stats.lines === 0 ? (
        <p className="shopping-panel__empty-hint">
          Utilise les filtres ci-dessus puis clique sur une carte ou le panier pour l&apos;ajouter.
          Cocher une carte ne l&apos;ajoute pas à ta collection.
        </p>
      ) : entries.length === 0 ? (
        <p className="shopping-panel__empty-hint">
          Aucune carte de la liste ne correspond aux filtres actifs.
        </p>
      ) : (
        <>
          {hiddenByFilters > 0 && (
            <p className="shopping-panel__filter-note">
              {matchingCount} carte{matchingCount !== 1 ? 's' : ''} de la liste correspondent aux filtres ({hiddenByFilters} masquée{hiddenByFilters !== 1 ? 's' : ''})
            </p>
          )}

          <div className="shopping-list-header" aria-hidden>
            <span className="shopping-list-header__card">Carte</span>
            <span className="shopping-list-header__qty">Ex.</span>
            <span className="shopping-list-header__price">Prix</span>
          </div>

          <ul className="shopping-list">
            {entries.map(({ card, entry, lineTotal, currency }) => (
              <li
                key={card.id}
                className={`shopping-item ${entry.checked ? 'shopping-item--checked' : ''}`}
              >
                <label className="shopping-item__check">
                  <input
                    type="checkbox"
                    checked={entry.checked}
                    onChange={() => onToggleChecked(card.id)}
                  />
                  <span className="shopping-item__checkmark" />
                </label>
                {card.image && (
                  <img className="shopping-item__thumb" src={card.image} alt="" loading="lazy" />
                )}
                <div className="shopping-item__info">
                  <span className="shopping-item__name">{card.name}</span>
                  <span className="shopping-item__meta">
                    {card.code}
                    <span className="shopping-item__set">{card.setName}</span>
                  </span>
                </div>
                <div className="shopping-item__qty-controls">
                  <button
                    type="button"
                    className="shopping-item__qty-btn"
                    onClick={() => onQtyChange(card.id, -1)}
                    aria-label={`Retirer un exemplaire de ${card.name}`}
                  >
                    −
                  </button>
                  <span className="shopping-item__qty-value">{entry.qty}</span>
                  <button
                    type="button"
                    className="shopping-item__qty-btn"
                    onClick={() => onQtyChange(card.id, 1)}
                    aria-label={`Ajouter un exemplaire de ${card.name}`}
                  >
                    +
                  </button>
                </div>
                <span className="shopping-item__price">
                  {lineTotal != null ? formatPrice(lineTotal, currency) : '—'}
                </span>
                <button
                  type="button"
                  className="shopping-item__remove"
                  onClick={() => onRemove(card.id)}
                  title="Retirer de la liste"
                  aria-label={`Retirer ${card.name} de la liste`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {visibleTotal > 0 && (
            <footer className="shopping-panel__footer">
              <span>Total affiché (non cochées)</span>
              <strong>{formatPrice(visibleTotal, 'EUR')}</strong>
            </footer>
          )}

          {hideChecked && stats.checked === stats.lines && (
            <p className="shopping-panel__all-done">Tout est coché ! Retire les cartes achetées ou décoche pour continuer.</p>
          )}
        </>
      )}
    </div>
  );
}
