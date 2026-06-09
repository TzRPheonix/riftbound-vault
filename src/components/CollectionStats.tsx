import './CollectionStats.css';

export type StatMode = 'total' | 'unique' | 'fullset' | 'filtered';

export interface SetStat {
  id: string;
  name: string;
  total: number;
  ownedUnique: number;
  pct: number;
}

interface CollectionStatsProps {
  totalOwned: number;
  uniqueOwned: number;
  fullsetOwned: number;
  filteredOwned: number;
  setStats: SetStat[];
  mode: StatMode;
  onModeChange: (m: StatMode) => void;
}

const MODES: { key: StatMode; label: string; title: string }[] = [
  { key: 'fullset', label: 'Full-set', title: 'Copies jouables (max 3 par carte)' },
  { key: 'unique', label: 'Uniques', title: 'Cartes distinctes possédées' },
  { key: 'total', label: 'Total', title: 'Toutes les copies possédées' },
  { key: 'filtered', label: 'Filtrés', title: 'Total selon les filtres actifs' },
];

export function CollectionStats({
  totalOwned,
  uniqueOwned,
  fullsetOwned,
  filteredOwned,
  setStats,
  mode,
  onModeChange,
}: CollectionStatsProps) {
  const displayValue =
    mode === 'unique' ? uniqueOwned
    : mode === 'fullset' ? fullsetOwned
    : mode === 'filtered' ? filteredOwned
    : totalOwned;

  return (
    <div className="cstats">
      <div className="cstats__left">
        <div className="cstats__counters">
          <div className="cstats__counter">
            <span className="cstats__counter-value">{displayValue}</span>
            <span className="cstats__counter-label">
              {mode === 'unique' ? 'Uniques' : mode === 'fullset' ? 'Full-set' : mode === 'filtered' ? 'Filtrés' : 'Total'}
            </span>
          </div>
          <div className="cstats__counter">
            <span className="cstats__counter-value">{uniqueOwned}</span>
            <span className="cstats__counter-label">Uniques</span>
          </div>
          <div className="cstats__counter">
            <span className="cstats__counter-value">{totalOwned}</span>
            <span className="cstats__counter-label">Total copies</span>
          </div>
        </div>
        <div className="cstats__modes">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`cstats__mode-btn ${mode === m.key ? 'cstats__mode-btn--active' : ''}`}
              title={m.title}
              onClick={() => onModeChange(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cstats__sets">
        <span className="cstats__sets-title">SETS</span>
        {setStats.map((s) => (
          <div key={s.id} className="cstats__set-row">
            <span className="cstats__set-name">{s.id} – {s.name}</span>
            <div className="cstats__set-bar">
              <div className="cstats__set-fill" style={{ width: `${s.pct}%` }} />
            </div>
            <span className="cstats__set-count">{s.ownedUnique} / {s.total}</span>
            <span className={`cstats__set-pct ${s.pct >= 100 ? 'cstats__set-pct--complete' : ''}`}>
              {s.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
