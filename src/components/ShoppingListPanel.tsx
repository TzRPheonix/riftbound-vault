import { useMemo, useState } from 'react';
import type { Card, PriceMap, ShoppingList } from '../types';
import { ownedCount } from '../lib/cards';
import { FilterChecklist, type FilterChecklistOption } from './FilterChecklist';
import './ShoppingListPanel.css';

const SORT_OPTIONS: FilterChecklistOption[] = [
  { value: 'price-asc', label: 'Prix ↑' },
  { value: 'price-desc', label: 'Prix ↓' },
];

function formatPrice(amount: number, currency: string): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency });
}

interface ShoppingListPanelProps {
  cards: Card[];
  cardMap: Map<string, Card>;
  shoppingList: ShoppingList;
  collection: Record<string, number>;
  prices: PriceMap;
  onToggleChecked: (cardId: string) => void;
  onQtyChange: (cardId: string, delta: number) => void;
  onRemove: (cardId: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onAddNotOwned: () => void;
}

export function ShoppingListPanel({
  cards,
  cardMap,
  shoppingList,
  collection,
  prices,
  onToggleChecked,
  onQtyChange,
  onRemove,
  onClearChecked,
  onClearAll,
  onAddNotOwned,
}: ShoppingListPanelProps) {
  const [hideChecked, setHideChecked] = useState(false);
  const [sortBy, setSortBy] = useState('');

  const notOwnedCount = useMemo(
    () => cards.filter((c) => ownedCount(collection, c.id) === 0).length,
    [cards, collection],
  );

  const entries = useMemo(() => {
    const items = Object.entries(shoppingList)
      .map(([id, entry]) => {
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
  }, [shoppingList, cardMap, prices, hideChecked, sortBy]);

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

  if (stats.lines === 0) {
    return (
      <div className="shopping-panel shopping-panel--empty">
        <div className="shopping-panel__empty-icon" aria-hidden>🛒</div>
        <h2 className="shopping-panel__empty-title">Liste d&apos;achats vide</h2>
        <p className="shopping-panel__empty-text">
          Ajoute des cartes manquantes pour préparer tes achats sur Cardmarket, eBay, etc.
          Cocher une carte ne l&apos;ajoute pas à ta collection — pense à mettre à jour tes quantités après achat.
        </p>
        <div className="shopping-panel__empty-actions">
          <button type="button" className="btn btn--ghost" onClick={onAddNotOwned}>
            Ajouter toutes les cartes non possédées ({notOwnedCount})
          </button>
        </div>
        <p className="shopping-panel__hint">
          Tu peux aussi ajouter des cartes depuis l&apos;onglet Collection (icône panier) ou Meta Decks (bouton « manquantes »).
        </p>
      </div>
    );
  }

  return (
    <div className="shopping-panel">
      <header className="shopping-panel__header">
        <div>
          <h2 className="shopping-panel__title">Liste d&apos;achats</h2>
          <p className="shopping-panel__subtitle">
            {stats.copies} exemplaire{stats.copies !== 1 ? 's' : ''}
            {stats.remaining < stats.lines && ` · ${stats.remaining} ligne${stats.remaining !== 1 ? 's' : ''} restante${stats.remaining !== 1 ? 's' : ''}`}
            {stats.estValue > 0 && (
              <> · ~{formatPrice(stats.estValue, 'EUR')}</>
            )}
          </p>
        </div>
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
      </header>

      <div className="shopping-panel__toolbar">
        <div className="shopping-panel__toolbar-filters">
          <FilterChecklist
            label="Trier par"
            values={sortBy ? [sortBy] : []}
            options={SORT_OPTIONS}
            onChange={(v) => setSortBy(v[0] ?? '')}
            emptyLabel="Par défaut"
            mode="single"
            className="shopping-panel__sort"
          />
          <label className="shopping-panel__toggle">
            <input
              type="checkbox"
              checked={hideChecked}
              onChange={(e) => setHideChecked(e.target.checked)}
            />
            Masquer les cochées
          </label>
        </div>
        <div className="shopping-panel__toolbar-actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onAddNotOwned}>
            + Non possédées ({notOwnedCount})
          </button>
          {stats.checked > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClearChecked}>
              Retirer les cochées
            </button>
          )}
          <button type="button" className="btn btn--danger btn--sm" onClick={onClearAll}>
            Vider la liste
          </button>
        </div>
      </div>

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

      {entries.length > 0 && visibleTotal > 0 && (
        <footer className="shopping-panel__footer">
          <span>Total affiché (non cochées)</span>
          <strong>{formatPrice(visibleTotal, 'EUR')}</strong>
        </footer>
      )}

      {entries.length === 0 && hideChecked && stats.checked === stats.lines && (
        <p className="shopping-panel__all-done">Tout est coché ! Retire les cartes achetées ou décoche pour continuer.</p>
      )}
    </div>
  );
}
