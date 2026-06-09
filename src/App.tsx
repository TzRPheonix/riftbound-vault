import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Collection, DomainId } from './types';
import { CardLightbox } from './components/CardLightbox';
import { CardTile } from './components/CardTile';
import { DeckPanel } from './components/DeckPanel';
import { Toolbar } from './components/Toolbar';
import {
  filterCards,
  isLandscapeCard,
  ownedCount,
  uniqueRarities,
  uniqueSacrificeValues,
  uniqueSets,
  uniqueStatValues,
} from './lib/cards';
import { suggestDecks } from './lib/deck';
import {
  downloadJson,
  exportCollectionJson,
  importCollectionJson,
  loadCollection,
  saveCollection,
} from './lib/storage';
import './App.css';

type Tab = 'collection' | 'decks';

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
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection>(() => loadCollection());
  const [tab, setTab] = useState<Tab>('collection');
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [energyFilter, setEnergyFilter] = useState('');
  const [mightFilter, setMightFilter] = useState('');
  const [sacrificeFilter, setSacrificeFilter] = useState('');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [quickAdd, setQuickAdd] = useState(() => loadQuickAdd());
  const [zoomCardId, setZoomCardId] = useState<string | null>(null);
  const [selectedLegendId, setSelectedLegendId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    fetch(`${base}data/cards.json`)
      .then((r) => r.json())
      .then((data: Card[]) => {
        setCards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

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

  const sets = useMemo(() => uniqueSets(cards), [cards]);
  const rarities = useMemo(() => uniqueRarities(cards), [cards]);
  const energyValues = useMemo(() => uniqueStatValues(cards, 'energy'), [cards]);
  const mightValues = useMemo(() => uniqueStatValues(cards, 'might'), [cards]);
  const sacrificeValues = useMemo(() => uniqueSacrificeValues(cards), [cards]);

  const filtered = useMemo(
    () =>
      filterCards(cards, {
        search,
        set: setFilter,
        domain: domainFilter as DomainId | '',
        type: typeFilter,
        rarityFilter,
        energyFilter,
        mightFilter,
        sacrificeFilter,
        ownedOnly,
        collection,
      }),
    [
      cards,
      search,
      setFilter,
      domainFilter,
      typeFilter,
      rarityFilter,
      energyFilter,
      mightFilter,
      sacrificeFilter,
      ownedOnly,
      collection,
    ],
  );

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
    if (typeFilter === 'battlefield') return 'battlefields';
    if (filtered.some(isLandscapeCard)) return 'mixed';
    return 'default';
  }, [typeFilter, filtered]);

  const suggestions = useMemo(
    () => suggestDecks(cards, collection),
    [cards, collection],
  );

  useEffect(() => {
    if (suggestions.length > 0 && !selectedLegendId) {
      setSelectedLegendId(suggestions[0].legend.id);
    }
  }, [suggestions, selectedLegendId]);

  const { totalOwned, uniqueOwned } = useMemo(() => {
    let total = 0;
    let unique = 0;
    for (const qty of Object.values(collection)) {
      if (qty > 0) {
        unique += 1;
        total += qty;
      }
    }
    return { totalOwned: total, uniqueOwned: unique };
  }, [collection]);

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
          Deck possibilities
          {suggestions.length > 0 && (
            <span className="tab__badge">{suggestions.length}</span>
          )}
        </button>
      </div>

      <main className="app-main">
        {tab === 'collection' ? (
          <>
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              setFilter={setFilter}
              onSetChange={setSetFilter}
              domainFilter={domainFilter}
              onDomainChange={setDomainFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              rarityFilter={rarityFilter}
              onRarityChange={setRarityFilter}
              rarities={rarities}
              energyFilter={energyFilter}
              onEnergyChange={setEnergyFilter}
              mightFilter={mightFilter}
              onMightChange={setMightFilter}
              energyValues={energyValues}
              mightValues={mightValues}
              sacrificeFilter={sacrificeFilter}
              onSacrificeChange={setSacrificeFilter}
              sacrificeValues={sacrificeValues}
              ownedOnly={ownedOnly}
              onOwnedOnlyChange={setOwnedOnly}
              quickAdd={quickAdd}
              onQuickAddChange={setQuickAdd}
              sets={sets}
              totalOwned={totalOwned}
              uniqueOwned={uniqueOwned}
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
                  onChange={(d) => updateQty(card.id, d)}
                  quickAdd={quickAdd}
                  onOpen={() => setZoomCardId(card.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <DeckPanel
            suggestions={suggestions}
            collection={collection}
            selectedLegendId={selectedLegendId}
            onSelectLegend={setSelectedLegendId}
            onCollectionChange={updateQty}
          />
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
