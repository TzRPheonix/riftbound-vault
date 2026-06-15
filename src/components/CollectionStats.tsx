import './CollectionStats.css';

export interface SetStat {
  id: string;
  name: string;
  total: number;
  ownedUnique: number;
  pct: number;
}

export interface FilterCompletionStat {
  label: string;
  owned: number;
  total: number;
  pct: number;
}

interface CollectionStatsProps {
  totalOwned: number;
  uniqueOwned: number;
  collectionValue: number;
  setStats: SetStat[];
  filterCompletion?: FilterCompletionStat | null;
}

export function CollectionStats({
  totalOwned,
  uniqueOwned,
  collectionValue,
  setStats,
  filterCompletion,
}: CollectionStatsProps) {
  const valueStr = collectionValue > 0
    ? collectionValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
    : '—';

  return (
    <div className="cstats">
      <div className="cstats__left">
        <div className="cstats__counters">
          <div className="cstats__counter">
            <span className="cstats__counter-value">{uniqueOwned}</span>
            <span className="cstats__counter-label">Uniques</span>
          </div>
          <div className="cstats__counter">
            <span className="cstats__counter-value">{totalOwned}</span>
            <span className="cstats__counter-label">Total</span>
          </div>
          <div className="cstats__counter">
            <span className="cstats__counter-value cstats__counter-value--price">{valueStr}</span>
            <span className="cstats__counter-label">Valeur est.</span>
          </div>
        </div>
        {filterCompletion && (
          <div className="cstats__filter">
            <span className="cstats__filter-label">Filtre actif</span>
            <p className="cstats__filter-name" title={filterCompletion.label}>
              {filterCompletion.label}
            </p>
            <div className="cstats__filter-row">
              <div className="cstats__filter-bar">
                <div
                  className="cstats__filter-fill"
                  style={{ width: `${Math.min(100, filterCompletion.pct)}%` }}
                />
              </div>
              <span className="cstats__filter-count">
                {filterCompletion.owned} / {filterCompletion.total}
              </span>
              <span
                className={`cstats__filter-pct ${filterCompletion.pct >= 100 ? 'cstats__filter-pct--complete' : ''}`}
              >
                {filterCompletion.pct.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
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
