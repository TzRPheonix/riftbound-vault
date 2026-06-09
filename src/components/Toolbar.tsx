import { FilterSelect, type FilterSelectOption } from './FilterSelect';
import { RARITY_LABELS } from '../lib/cards';
import './Toolbar.css';

const DOMAIN_OPTIONS: FilterSelectOption[] = [
  { value: '', label: 'Tous les domaines' },
  { value: 'fury', label: 'Fury' },
  { value: 'calm', label: 'Calm' },
  { value: 'mind', label: 'Mind' },
  { value: 'body', label: 'Body' },
  { value: 'chaos', label: 'Chaos' },
  { value: 'order', label: 'Order' },
];

const TYPE_OPTIONS: FilterSelectOption[] = [
  { value: '', label: 'Tous les types' },
  { value: 'legend', label: 'Legend' },
  { value: 'unit', label: 'Unit' },
  { value: 'spell', label: 'Spell' },
  { value: 'gear', label: 'Gear' },
  { value: 'rune', label: 'Rune' },
  { value: 'battlefield', label: 'Battlefield' },
];

function statOptions(label: string, noneLabel: string, values: number[]): FilterSelectOption[] {
  return [
    { value: '', label },
    { value: 'none', label: noneLabel },
    ...values.map((n) => ({ value: String(n), label: String(n) })),
  ];
}

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  setFilter: string;
  onSetChange: (v: string) => void;
  domainFilter: string;
  onDomainChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  rarityFilter: string;
  onRarityChange: (v: string) => void;
  rarities: string[];
  energyFilter: string;
  onEnergyChange: (v: string) => void;
  mightFilter: string;
  onMightChange: (v: string) => void;
  energyValues: number[];
  mightValues: number[];
  sacrificeFilter: string;
  onSacrificeChange: (v: string) => void;
  sacrificeValues: number[];
  ownedOnly: boolean;
  onOwnedOnlyChange: (v: boolean) => void;
  quickAdd: boolean;
  onQuickAddChange: (v: boolean) => void;
  sets: { id: string; name: string }[];
}

export function Toolbar({
  search,
  onSearchChange,
  setFilter,
  onSetChange,
  domainFilter,
  onDomainChange,
  typeFilter,
  onTypeChange,
  rarityFilter,
  onRarityChange,
  rarities,
  energyFilter,
  onEnergyChange,
  mightFilter,
  onMightChange,
  energyValues,
  mightValues,
  sacrificeFilter,
  onSacrificeChange,
  sacrificeValues,
  ownedOnly,
  onOwnedOnlyChange,
  quickAdd,
  onQuickAddChange,
  sets,
}: ToolbarProps) {
  const setOptions: FilterSelectOption[] = [
    { value: '', label: 'Tous les sets' },
    ...sets.map((s) => ({ value: s.id, label: s.name })),
  ];

  const rarityOptions: FilterSelectOption[] = [
    { value: '', label: 'Toutes les raretés' },
    ...rarities.map((r) => ({ value: r, label: RARITY_LABELS[r] ?? r })),
  ];

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
        <FilterSelect label="Set" value={setFilter} options={setOptions} onChange={onSetChange} />
        <FilterSelect
          label="Domaine"
          value={domainFilter}
          options={DOMAIN_OPTIONS}
          onChange={onDomainChange}
        />
        <FilterSelect label="Type" value={typeFilter} options={TYPE_OPTIONS} onChange={onTypeChange} />
        <FilterSelect
          label="Rareté"
          value={rarityFilter}
          options={rarityOptions}
          onChange={onRarityChange}
        />
        <FilterSelect
          label="Coût runes"
          value={energyFilter}
          options={statOptions('Tous', 'Sans coût', energyValues)}
          onChange={onEnergyChange}
        />
        <FilterSelect
          label="Might"
          value={mightFilter}
          options={statOptions('Tous', 'Sans Might', mightValues)}
          onChange={onMightChange}
        />
        <FilterSelect
          label="Runes sacr."
          value={sacrificeFilter}
          options={statOptions('Toutes', 'Aucune', sacrificeValues)}
          onChange={onSacrificeChange}
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
        </div>
      </div>

    </div>
  );
}
