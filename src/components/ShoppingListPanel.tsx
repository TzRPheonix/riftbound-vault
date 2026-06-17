import { useMemo, useState } from 'react';
import type { Card, PriceMap, ShoppingList } from '../types';
import { ownedCount } from '../lib/cards';
import './ShoppingListPanel.css';

interface ShoppingListPanelProps {
  cards: Card[];
  cardMap: Map<string, Card>;
  shoppingList: ShoppingList;
  collection: Record<string, number>;
  prices: PriceMap;
  onToggleChecked: (cardId: string) => void;
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
  onRemove,
  onClearChecked,
  onClearAll,
  onAddNotOwned,
}: ShoppingListPanelProps) {
  const [hideChecked, setHideChecked] = useState(false);

  const notOwnedCount = useMemo(
    () => cards.filter((c) => ownedCount(collection, c.id) === 0).length,
    [cards, collection],
  );

  const entries = useMemo(() => {
    const items = Object.entries(shoppingList)
      .map(([id, entry]) => {
        const card = cardMap.get(id);
        if (!card) return null;
        const price = prices[card.code]?.lowest ?? null;
        return { card, entry, price };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    items.sort((a, b) => {
      if (a.entry.checked !== b.entry.checked) return a.entry.checked ? 1 : -1;
      return a.card.name.localeCompare(b.card.name, 'fr');
    });

    return hideChecked ? items.filter((x) => !x.entry.checked) : items;
  }, [shoppingList, cardMap, prices, hideChecked]);

  const stats = useMemo(() => {
    let total = 0;
    let checked = 0;
    let estValue = 0;
    for (const [id, entry] of Object.entries(shoppingList)) {
      total += 1;
      if (entry.checked) checked += 1;
      else {
        const card = cardMap.get(id);
        const price = card ? prices[card.code]?.lowest ?? 0 : 0;
        estValue += entry.qty * price;
      }
    }
    return { total, checked, remaining: total - checked, estValue };
  }, [shoppingList, cardMap, prices]);

  if (stats.total === 0) {
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
            {stats.remaining} restante{stats.remaining !== 1 ? 's' : ''}
            {stats.checked > 0 && ` · ${stats.checked} cochée${stats.checked !== 1 ? 's' : ''}`}
            {stats.estValue > 0 && (
              <> · ~{stats.estValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} estimé</>
            )}
          </p>
        </div>
        <div className="shopping-panel__progress">
          <div className="shopping-panel__progress-track">
            <div
              className="shopping-panel__progress-fill"
              style={{ width: `${stats.total > 0 ? (stats.checked / stats.total) * 100 : 0}%` }}
            />
          </div>
          <span className="shopping-panel__progress-label">
            {stats.checked}/{stats.total}
          </span>
        </div>
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

      <ul className="shopping-list">
        {entries.map(({ card, entry, price }) => (
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
                {entry.qty > 1 && <span className="shopping-item__qty">×{entry.qty}</span>}
                {price != null && (
                  <span className="shopping-item__price">
                    {(price * entry.qty).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: prices[card.code]?.currency ?? 'EUR',
                    })}
                  </span>
                )}
              </span>
            </div>
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

      {entries.length === 0 && hideChecked && stats.checked === stats.total && (
        <p className="shopping-panel__all-done">Tout est coché ! Retire les cartes achetées ou décoche pour continuer.</p>
      )}
    </div>
  );
}
