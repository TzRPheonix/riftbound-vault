import './CollectionStats.css';

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
  collectionValue: number;
  setStats: SetStat[];
}

export function CollectionStats({
  totalOwned,
  uniqueOwned,
  collectionValue,
  setStats,
}: CollectionStatsProps) {
  const valueStr = collectionValue > 0
    ? collectionValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
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
