import { FilterChecklist, type FilterChecklistOption } from './FilterChecklist';
import {
  DOMAIN_COLORS,
  RARITY_LABELS,
  TYPE_FILTER_OPTIONS,
  type FilterRelevance,
  type TypeFilterId,
} from '../lib/cards';
import type { DomainId } from '../types';
import './Toolbar.css';

const DOMAIN_OPTIONS: FilterChecklistOption[] = (
  ['fury', 'calm', 'mind', 'body', 'chaos', 'order'] as DomainId[]
).map((id) => ({
  value: id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
  swatch: DOMAIN_COLORS[id],
}));

const SORT_OPTIONS: FilterChecklistOption[] = [
  { value: 'price-asc', label: 'Prix ↑' },
  { value: 'price-desc', label: 'Prix ↓' },
];

function statOptions(noneLabel: string, values: number[]): FilterChecklistOption[] {
  const opts: FilterChecklistOption[] = [{ value: 'none', label: noneLabel }];
  for (const n of values) opts.push({ value: String(n), label: String(n) });
  return opts;
}

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  setFilters: string[];
  onSetFiltersChange: (v: string[]) => void;
  domainFilters: DomainId[];
  onDomainFiltersChange: (v: DomainId[]) => void;
  typeFilters: TypeFilterId[];
  onTypeFiltersChange: (v: TypeFilterId[]) => void;
  rarityFilters: string[];
  onRarityFiltersChange: (v: string[]) => void;
  rarities: string[];
  energyFilters: string[];
  onEnergyFiltersChange: (v: string[]) => void;
  mightFilters: string[];
  onMightFiltersChange: (v: string[]) => void;
  energyValues: number[];
  mightValues: number[];
  sacrificeFilters: string[];
  onSacrificeFiltersChange: (v: string[]) => void;
  sacrificeValues: number[];
  relevance: FilterRelevance;
  ownedOnly: boolean;
  onOwnedOnlyChange: (v: boolean) => void;
  foilOnly: boolean;
  onFoilOnlyChange: (v: boolean) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  quickAdd: boolean;
  onQuickAddChange: (v: boolean) => void;
  sets: { id: string; name: string }[];
}

export function Toolbar({
  search,
  onSearchChange,
  setFilters,
  onSetFiltersChange,
  domainFilters,
  onDomainFiltersChange,
  typeFilters,
  onTypeFiltersChange,
  rarityFilters,
  onRarityFiltersChange,
  rarities,
  energyFilters,
  onEnergyFiltersChange,
  mightFilters,
  onMightFiltersChange,
  energyValues,
  mightValues,
  sacrificeFilters,
  onSacrificeFiltersChange,
  sacrificeValues,
  relevance,
  ownedOnly,
  onOwnedOnlyChange,
  foilOnly,
  onFoilOnlyChange,
  sortBy,
  onSortChange,
  quickAdd,
  onQuickAddChange,
  sets,
}: ToolbarProps) {
  const setOptions: FilterChecklistOption[] = sets.map((s) => ({
    value: s.id,
    label: `${s.id} · ${s.name}`,
  }));

  const rarityOptions: FilterChecklistOption[] = rarities.map((r) => ({
    value: r,
    label: RARITY_LABELS[r] ?? r,
  }));

  const hasStatFilters = relevance.energy || relevance.might || relevance.sacrifice;

  return (
    <div className="toolbar">
      <div className="toolbar__search-wrap">
        <input
          type="search"
          className="toolbar__search"
          placeholder="Nom ou code (OGN-042, ogn042, ogn 42)…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="toolbar__filters">
        <div className="toolbar__group">
          <span className="toolbar__group-label">Carte</span>
          <div className="toolbar__group-row">
            <FilterChecklist
              label="Sets"
              values={setFilters}
              options={setOptions}
              onChange={onSetFiltersChange}
              emptyLabel="Tous les sets"
              countNoun="sets"
            />
            <FilterChecklist
              label="Types"
              values={typeFilters}
              options={TYPE_FILTER_OPTIONS}
              onChange={onTypeFiltersChange}
              emptyLabel="Tous les types"
              countNoun="types"
            />
            {relevance.domain && (
              <FilterChecklist
                label="Domaines"
                values={domainFilters}
                options={DOMAIN_OPTIONS}
                onChange={(v) => onDomainFiltersChange(v as DomainId[])}
                emptyLabel="Tous les domaines"
                countNoun="domaines"
              />
            )}
            {relevance.rarity && (
              <FilterChecklist
                label="Raretés"
                values={rarityFilters}
                options={rarityOptions}
                onChange={onRarityFiltersChange}
                emptyLabel="Toutes les raretés"
                countNoun="raretés"
              />
            )}
          </div>
        </div>

        {hasStatFilters && (
          <div className="toolbar__group">
            <span className="toolbar__group-label">Stats</span>
            <div className="toolbar__group-row">
              {relevance.energy && (
                <FilterChecklist
                  label="Coût runes"
                  values={energyFilters}
                  options={statOptions('Sans coût', energyValues)}
                  onChange={onEnergyFiltersChange}
                  emptyLabel="Tous les coûts"
                  countNoun="coûts"
                />
              )}
              {relevance.might && (
                <FilterChecklist
                  label="Might"
                  values={mightFilters}
                  options={statOptions('Sans Might', mightValues)}
                  onChange={onMightFiltersChange}
                  emptyLabel="Tous les Might"
                  countNoun="valeurs"
                />
              )}
              {relevance.sacrifice && (
                <FilterChecklist
                  label="Runes sacr."
                  values={sacrificeFilters}
                  options={statOptions('Aucune', sacrificeValues)}
                  onChange={onSacrificeFiltersChange}
                  emptyLabel="Toutes"
                  countNoun="valeurs"
                />
              )}
            </div>
          </div>
        )}

        <div className="toolbar__group">
          <span className="toolbar__group-label">Affichage</span>
          <div className="toolbar__group-row">
            <FilterChecklist
              label="Trier par"
              values={sortBy ? [sortBy] : []}
              options={SORT_OPTIONS}
              onChange={(v) => onSortChange(v[0] ?? '')}
              emptyLabel="Par défaut"
              mode="single"
            />

            <div className="toolbar__toggles">
              <label className="toolbar__toggle" title="Un clic sur une carte l'ajoute à la collection">
                <input
                  type="checkbox"
                  checked={quickAdd}
                  onChange={(e) => onQuickAddChange(e.target.checked)}
                />
                <span>Ajout rapide</span>
              </label>
              <label className="toolbar__toggle">
                <input
                  type="checkbox"
                  checked={ownedOnly}
                  onChange={(e) => onOwnedOnlyChange(e.target.checked)}
                />
                <span>Possédées</span>
              </label>
              {relevance.foilToggle && (
                <label className="toolbar__toggle">
                  <input
                    type="checkbox"
                    checked={foilOnly}
                    onChange={(e) => onFoilOnlyChange(e.target.checked)}
                  />
                  <span>Foil ✦</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
