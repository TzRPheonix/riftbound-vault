import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Collection, DomainId, PriceMap, ShoppingList } from './types';
import { CardLightbox } from './components/CardLightbox';
import { CardTile } from './components/CardTile';
import { CollectionStats } from './components/CollectionStats';
import { DeckPanel } from './components/DeckPanel';
import { MetaDeckPanel } from './components/MetaDeckPanel';
import { ShoppingListPanel } from './components/ShoppingListPanel';
import { Toolbar } from './components/Toolbar';
import { META_DECKS } from './data/meta-decks';
import { buildCardMap, calcMetaDeckResult } from './lib/meta-deck';
import {
  buildVariantMap,
  computeFilterRelevance,
  describeActiveFilters,
  filterCards,
  filterCompletion,
  hasActiveCardFilters,
  isFoilTrackable,
  isLandscapeCard,
  ownedCount,
  scopedFilterPool,
  uniqueRarities,
  uniqueSacrificeValues,
  uniqueSets,
  uniqueStatValues,
  type TypeFilterId,
} from './lib/cards';
import { suggestDecks } from './lib/deck';
import {
  downloadJson,
  exportCollectionJson,
  importCollectionJson,
  loadCollection,
  loadFoils,
  loadShoppingList,
  saveCollection,
  saveFoils,
  saveShoppingList,
} from './lib/storage';
import './App.css';

type Tab = 'collection' | 'decks' | 'meta' | 'shopping';

const QUICK_ADD_KEY = 'riftbound-vault-quick-add';

function loadQuickAdd(): boolean {
  try {
    return localStorage.getItem(QUICK_ADD_KEY) === '1';
  } catch {
    return false;
  }
}

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection>(() => loadCollection());
  const [tab, setTab] = useState<Tab>('collection');
  const [search, setSearch] = useState('');
  const [setFilters, setSetFilters] = useState<string[]>([]);
  const [domainFilters, setDomainFilters] = useState<DomainId[]>([]);
  const [typeFilters, setTypeFilters] = useState<TypeFilterId[]>([]);
  const [rarityFilters, setRarityFilters] = useState<string[]>([]);
  const [energyFilters, setEnergyFilters] = useState<string[]>([]);
  const [mightFilters, setMightFilters] = useState<string[]>([]);
  const [sacrificeFilters, setSacrificeFilters] = useState<string[]>([]);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [notOwnedOnly, setNotOwnedOnly] = useState(false);
  const [foilOnly, setFoilOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [quickAdd, setQuickAdd] = useState(() => loadQuickAdd());
  const [foilCollection, setFoilCollection] = useState<Collection>(() => loadFoils());
  const [shoppingList, setShoppingList] = useState<ShoppingList>(() => loadShoppingList());
  const [zoomCardId, setZoomCardId] = useState<string | null>(null);
  const [selectedLegendId, setSelectedLegendId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/cards.json`).then((r) => r.json()) as Promise<Card[]>,
      fetch(`${base}data/prices.json`).then((r) => r.json()).catch(() => ({})) as Promise<PriceMap>,
    ]).then(([cardData, priceData]) => {
      setCards(cardData);
      setPrices(priceData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  useEffect(() => {
    saveFoils(foilCollection);
  }, [foilCollection]);

  useEffect(() => {
    saveShoppingList(shoppingList);
  }, [shoppingList]);


  useEffect(() => {
    localStorage.setItem(QUICK_ADD_KEY, quickAdd ? '1' : '0');
  }, [quickAdd]);

  const updateQty = useCallback((cardId: string, delta: number) => {
    setCollection((prev) => {
      const next = { ...prev };
      const current = next[cardId] ?? 0;
      const value = Math.max(0, current + delta);
      if (value === 0) delete next[cardId];
      else next[cardId] = value;
      return next;
    });
  }, []);

  const updateFoil = useCallback((cardId: string, delta: number) => {
    setFoilCollection((prev) => {
      const next = { ...prev };
      const current = next[cardId] ?? 0;
      const value = Math.max(0, current + delta);
      if (value === 0) delete next[cardId];
      else next[cardId] = value;
      return next;
    });
  }, []);

  const addToShopping = useCallback((items: { cardId: string; qty: number }[]) => {
    setShoppingList((prev) => {
      const next = { ...prev };
      for (const { cardId, qty } of items) {
        if (qty <= 0) continue;
        const existing = next[cardId];
        if (existing) {
          next[cardId] = { checked: existing.checked, qty: existing.qty + qty };
        } else {
          next[cardId] = { checked: false, qty };
        }
      }
      return next;
    });
  }, []);

  const toggleShoppingListItem = useCallback((cardId: string) => {
    setShoppingList((prev) => {
      if (prev[cardId]) {
        const next = { ...prev };
        delete next[cardId];
        return next;
      }
      return { ...prev, [cardId]: { checked: false, qty: 1 } };
    });
  }, []);

  const toggleShoppingChecked = useCallback((cardId: string) => {
    setShoppingList((prev) => {
      const entry = prev[cardId];
      if (!entry) return prev;
      return { ...prev, [cardId]: { ...entry, checked: !entry.checked } };
    });
  }, []);

  const removeFromShopping = useCallback((cardId: string) => {
    setShoppingList((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  }, []);

  const clearCheckedShopping = useCallback(() => {
    setShoppingList((prev) => {
      const next = { ...prev };
      for (const [id, entry] of Object.entries(next)) {
        if (entry.checked) delete next[id];
      }
      return next;
    });
  }, []);

  const clearShoppingList = useCallback(() => {
    if (confirm('Vider toute la liste d\'achats ?')) {
      setShoppingList({});
    }
  }, []);

  const updateShoppingQty = useCallback((cardId: string, delta: number) => {
    setShoppingList((prev) => {
      const entry = prev[cardId];
      if (!entry) {
        if (delta <= 0) return prev;
        return { ...prev, [cardId]: { checked: false, qty: delta } };
      }
      const value = entry.qty + delta;
      if (value <= 0) {
        const next = { ...prev };
        delete next[cardId];
        return next;
      }
      return { ...prev, [cardId]: { ...entry, qty: value } };
    });
  }, []);

  const effectiveCollection = useMemo<Collection>(() => {
    const merged: Collection = { ...collection };
    for (const [id, qty] of Object.entries(foilCollection)) {
      if (qty > 0) merged[id] = (merged[id] ?? 0) + qty;
    }
    return merged;
  }, [collection, foilCollection]);

  const addFilteredNotOwnedToShopping = useCallback(() => {
    const items = filtered
      .filter((c) => ownedCount(effectiveCollection, c.id) === 0)
      .map((c) => ({ cardId: c.id, qty: 1 }));
    addToShopping(items);
  }, [filtered, effectiveCollection, addToShopping]);

  const filteredNotOwnedCount = useMemo(
    () => filtered.filter((c) => ownedCount(effectiveCollection, c.id) === 0).length,
    [filtered, effectiveCollection],
  );

  const shoppingCount = useMemo(
    () => Object.values(shoppingList).filter((e) => !e.checked).length,
    [shoppingList],
  );

  const filterPool = useMemo(
    () => scopedFilterPool(cards, setFilters, typeFilters),
    [cards, setFilters, typeFilters],
  );

  const filterRelevance = useMemo(
    () => computeFilterRelevance(filterPool, typeFilters),
    [filterPool, typeFilters],
  );

  const sets = useMemo(() => uniqueSets(cards), [cards]);
  const rarities = useMemo(() => uniqueRarities(filterPool), [filterPool]);
  const energyValues = useMemo(() => uniqueStatValues(filterPool, 'energy'), [filterPool]);
  const mightValues = useMemo(() => uniqueStatValues(filterPool, 'might'), [filterPool]);
  const sacrificeValues = useMemo(() => uniqueSacrificeValues(filterPool), [filterPool]);

  const cardFilters = useMemo(
    () => ({
      search,
      sets: setFilters,
      domains: domainFilters,
      types: typeFilters,
      rarities: rarityFilters,
      energyFilters,
      mightFilters,
      sacrificeFilters,
    }),
    [
      search,
      setFilters,
      domainFilters,
      typeFilters,
      rarityFilters,
      energyFilters,
      mightFilters,
      sacrificeFilters,
    ],
  );

  useEffect(() => {
    if (!filterRelevance.domain && domainFilters.length) setDomainFilters([]);
    if (!filterRelevance.rarity && rarityFilters.length) setRarityFilters([]);
    if (!filterRelevance.energy && energyFilters.length) setEnergyFilters([]);
    if (!filterRelevance.might && mightFilters.length) setMightFilters([]);
    if (!filterRelevance.sacrifice && sacrificeFilters.length) setSacrificeFilters([]);
    if (!filterRelevance.foilToggle && foilOnly) setFoilOnly(false);
  }, [
    filterRelevance,
    domainFilters.length,
    rarityFilters.length,
    energyFilters.length,
    mightFilters.length,
    sacrificeFilters.length,
    foilOnly,
  ]);

  const activeFilterCompletion = useMemo(() => {
    if (!hasActiveCardFilters(cardFilters)) return null;
    const stats = filterCompletion(cards, cardFilters, effectiveCollection);
    return {
      label: describeActiveFilters(cardFilters),
      ...stats,
    };
  }, [cards, cardFilters, effectiveCollection]);

  const filtered = useMemo(() => {
    const base = filterCards(cards, {
      ...cardFilters,
      ownedOnly,
      notOwnedOnly,
      collection: effectiveCollection,
    });
    let result = foilOnly ? base.filter((c) => (foilCollection[c.id] ?? 0) > 0) : base;
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => {
        const pa = prices[a.code]?.lowest ?? Infinity;
        const pb = prices[b.code]?.lowest ?? Infinity;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => {
        const pa = prices[a.code]?.lowest ?? -Infinity;
        const pb = prices[b.code]?.lowest ?? -Infinity;
        return pb - pa;
      });
    }
    return result;
  }, [
    cards,
    cardFilters,
    ownedOnly,
    notOwnedOnly,
    foilOnly,
    sortBy,
    effectiveCollection,
    foilCollection,
    prices,
  ]);

  const zoomIndex = useMemo(() => {
    if (!zoomCardId) return -1;
    return filtered.findIndex((c) => c.id === zoomCardId);
  }, [filtered, zoomCardId]);

  useEffect(() => {
    if (zoomCardId && zoomIndex === -1) setZoomCardId(null);
  }, [zoomCardId, zoomIndex]);

  const goZoomPrev = useCallback(() => {
    if (zoomIndex > 0) setZoomCardId(filtered[zoomIndex - 1].id);
  }, [filtered, zoomIndex]);

  const goZoomNext = useCallback(() => {
    if (zoomIndex >= 0 && zoomIndex < filtered.length - 1) {
      setZoomCardId(filtered[zoomIndex + 1].id);
    }
  }, [filtered, zoomIndex]);

  const zoomCard = useMemo(
    () => (zoomIndex >= 0 ? filtered[zoomIndex] : null),
    [filtered, zoomIndex],
  );

  const gridMode = useMemo(() => {
    if (typeFilters.length === 1 && typeFilters[0] === 'battlefield') return 'battlefields';
    if (filtered.some(isLandscapeCard)) return 'mixed';
    return 'default';
  }, [typeFilters, filtered]);

  const suggestions = useMemo(
    () => suggestDecks(cards, effectiveCollection),
    [cards, effectiveCollection],
  );

  const cardMap = useMemo(() => buildCardMap(cards), [cards]);
  const variantMap = useMemo(() => buildVariantMap(cards), [cards]);

  const metaResults = useMemo(
    () => META_DECKS.map((d) => calcMetaDeckResult(d, cardMap, effectiveCollection, variantMap)),
    [cardMap, effectiveCollection, variantMap],
  );

  useEffect(() => {
    if (suggestions.length > 0 && !selectedLegendId) {
      setSelectedLegendId(suggestions[0].legend.id);
    }
  }, [suggestions, selectedLegendId]);

  const { totalOwned, uniqueOwned, collectionValue } = useMemo(() => {
    let total = 0;
    let unique = 0;
    let value = 0;
    for (const card of cards) {
      const qty = effectiveCollection[card.id] ?? 0;
      if (qty > 0) {
        unique += 1;
        total += qty;
        value += qty * (prices[card.code]?.lowest ?? 0);
      }
    }
    return { totalOwned: total, uniqueOwned: unique, collectionValue: value };
  }, [effectiveCollection, cards, prices]);


  const setStats = useMemo(() =>
    sets.map((s) => {
      const setCards = cards.filter((c) => c.set === s.id);
      const total = setCards.length;
      const ownedUnique = setCards.filter((c) => ownedCount(effectiveCollection, c.id) > 0).length;
      const pct = total > 0 ? (ownedUnique / total) * 100 : 0;
      return { id: s.id, name: s.name, total, ownedUnique, pct };
    }),
    [sets, cards, effectiveCollection],
  );

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`riftbound-collection-${stamp}.json`, exportCollectionJson(collection));
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importCollectionJson(String(reader.result));
        setCollection(imported);
      } catch {
        alert('Invalid JSON file. Expected { "collection": { "card-id": 2 } }');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Clear your entire collection from this browser?')) {
      setCollection({});
      setSelectedLegendId(null);
    }
  };

  const renderToolbar = (mode: 'collection' | 'shopping') => (
    <Toolbar
      mode={mode}
      search={search}
      onSearchChange={setSearch}
      setFilters={setFilters}
      onSetFiltersChange={setSetFilters}
      domainFilters={domainFilters}
      onDomainFiltersChange={setDomainFilters}
      typeFilters={typeFilters}
      onTypeFiltersChange={setTypeFilters}
      rarityFilters={rarityFilters}
      onRarityFiltersChange={setRarityFilters}
      rarities={rarities}
      energyFilters={energyFilters}
      onEnergyFiltersChange={setEnergyFilters}
      mightFilters={mightFilters}
      onMightFiltersChange={setMightFilters}
      energyValues={energyValues}
      mightValues={mightValues}
      sacrificeFilters={sacrificeFilters}
      onSacrificeFiltersChange={setSacrificeFilters}
      sacrificeValues={sacrificeValues}
      relevance={filterRelevance}
      ownedOnly={ownedOnly}
      onOwnedOnlyChange={(v) => {
        setOwnedOnly(v);
        if (v) setNotOwnedOnly(false);
      }}
      notOwnedOnly={notOwnedOnly}
      onNotOwnedOnlyChange={(v) => {
        setNotOwnedOnly(v);
        if (v) setOwnedOnly(false);
      }}
      foilOnly={foilOnly}
      onFoilOnlyChange={setFoilOnly}
      sortBy={sortBy}
      onSortChange={setSortBy}
      quickAdd={quickAdd}
      onQuickAddChange={setQuickAdd}
      sets={sets}
    />
  );

  if (loading) {
    return (
      <div className="app app--loading">
        <div className="loader" />
        <p>Loading card gallery…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Riftbound Vault</h1>
          <p>Collection & deck builder</p>
        </div>
        <nav className="app-header__actions">
          <button type="button" className="btn btn--ghost" onClick={handleExport}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = '';
            }}
          />
          <button type="button" className="btn btn--danger" onClick={handleClear}>
            Clear
          </button>
        </nav>
      </header>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'collection' ? 'tab--active' : ''}`}
          onClick={() => setTab('collection')}
        >
          Collection
        </button>
        <button
          type="button"
          className={`tab ${tab === 'decks' ? 'tab--active' : ''}`}
          onClick={() => setTab('decks')}
        >
          Possibilités de deck
          {suggestions.length > 0 && (
            <span className="tab__badge">{suggestions.length}</span>
          )}
        </button>
        <button
          type="button"
          className={`tab ${tab === 'meta' ? 'tab--active' : ''}`}
          onClick={() => setTab('meta')}
        >
          Meta Decks
          <span className="tab__badge">{META_DECKS.length}</span>
        </button>
        <button
          type="button"
          className={`tab ${tab === 'shopping' ? 'tab--active' : ''}`}
          onClick={() => setTab('shopping')}
        >
          Liste d&apos;achats
          {shoppingCount > 0 && (
            <span className="tab__badge">{shoppingCount}</span>
          )}
        </button>
      </div>

      <main className="app-main">
        {tab === 'collection' ? (
          <>
            {renderToolbar('collection')}
            <CollectionStats
              totalOwned={totalOwned}
              uniqueOwned={uniqueOwned}
              collectionValue={collectionValue}
              setStats={setStats}
              filterCompletion={activeFilterCompletion}
            />
            <p className="results-count">
              {filtered.length} cartes ·{' '}
              {quickAdd
                ? 'clique sur une carte pour +1 exemplaire'
                : 'clique sur une carte pour agrandir · survol pour + / −'}
            </p>
            <div
              className={`card-grid${gridMode === 'battlefields' ? ' card-grid--battlefields' : gridMode === 'mixed' ? ' card-grid--mixed' : ''}`}
            >
              {filtered.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  owned={ownedCount(collection, card.id)}
                  foil={foilCollection[card.id] ?? 0}
                  price={prices[card.code]}
                  onChange={(d) => updateQty(card.id, d)}
                  onFoilChange={isFoilTrackable(card) ? (d) => updateFoil(card.id, d) : undefined}
                  quickAdd={quickAdd}
                  onOpen={() => setZoomCardId(card.id)}
                  inShoppingList={!!shoppingList[card.id]}
                  onToggleShopping={() => toggleShoppingListItem(card.id)}
                />
              ))}
            </div>
          </>
        ) : tab === 'decks' ? (
          <DeckPanel
            suggestions={suggestions}
            collection={collection}
            selectedLegendId={selectedLegendId}
            onSelectLegend={setSelectedLegendId}
            onCollectionChange={updateQty}
          />
        ) : tab === 'meta' ? (
          <MetaDeckPanel
            results={metaResults}
            collection={collection}
            onCollectionChange={updateQty}
            onAddMissingToShopping={(items) => addToShopping(items)}
          />
        ) : (
          <>
            {renderToolbar('shopping')}
            <ShoppingListPanel
              cardMap={cardMap}
              shoppingList={shoppingList}
              collection={effectiveCollection}
              prices={prices}
              cardFilters={cardFilters}
              ownedOnly={ownedOnly}
              notOwnedOnly={notOwnedOnly}
              sortBy={sortBy}
              filteredNotOwnedCount={filteredNotOwnedCount}
              onToggleChecked={toggleShoppingChecked}
              onQtyChange={updateShoppingQty}
              onRemove={removeFromShopping}
              onClearChecked={clearCheckedShopping}
              onClearAll={clearShoppingList}
              onAddFilteredNotOwned={addFilteredNotOwnedToShopping}
            />
            <div className="shopping-browse">
              <p className="results-count">
                {filtered.length} cartes ·{' '}
                {quickAdd
                  ? 'clique sur une carte pour l\'ajouter à la liste'
                  : 'survol pour + / − exemplaires · clique pour agrandir'}
              </p>
              <div
                className={`card-grid${gridMode === 'battlefields' ? ' card-grid--battlefields' : gridMode === 'mixed' ? ' card-grid--mixed' : ''}`}
              >
                {filtered.map((card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    owned={ownedCount(collection, card.id)}
                    price={prices[card.code]}
                    onChange={(d) => updateShoppingQty(card.id, d)}
                    quickAdd={quickAdd}
                    onOpen={() => setZoomCardId(card.id)}
                    listMode="shopping"
                    shoppingQty={shoppingList[card.id]?.qty ?? 0}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Card images from Riot&apos;s official gallery CDN. Not affiliated with Riot Games.
          Data sourced from community card databases; rules: 40 main / 12 runes / 3 battlefields.
        </p>
        <p>
          <a
            href="https://riftbound.leagueoflegends.com/en-us/card-gallery/"
            target="_blank"
            rel="noreferrer"
          >
            Official card gallery
          </a>
        </p>
      </footer>

      <CardLightbox
        card={zoomCard}
        owned={zoomCard ? ownedCount(collection, zoomCard.id) : 0}
        index={zoomIndex}
        total={filtered.length}
        hasPrev={zoomIndex > 0}
        hasNext={zoomIndex >= 0 && zoomIndex < filtered.length - 1}
        onPrev={goZoomPrev}
        onNext={goZoomNext}
        onClose={() => setZoomCardId(null)}
        onChange={(d) => {
          if (zoomCard) updateQty(zoomCard.id, d);
        }}
      />
    </div>
  );
}

export default App;
