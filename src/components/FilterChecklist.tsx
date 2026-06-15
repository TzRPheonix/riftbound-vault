import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './FilterChecklist.css';

export interface FilterChecklistOption {
  value: string;
  label: string;
}

interface FilterChecklistProps {
  label: string;
  values: string[];
  options: readonly FilterChecklistOption[];
  onChange: (values: string[]) => void;
  emptyLabel?: string;
  className?: string;
}

export function FilterChecklist({
  label,
  values,
  options,
  onChange,
  emptyLabel = 'Tous',
  className = '',
}: FilterChecklistProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const displayLabel = useMemo(() => {
    if (values.length === 0) return emptyLabel;
    if (values.length === 1) {
      return options.find((o) => o.value === values[0])?.label ?? values[0];
    }
    if (values.length === options.length) return 'Tous les types';
    return `${values.length} types`;
  }, [values, options, emptyLabel]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`filter-checklist ${open ? 'filter-checklist--open' : ''} ${className}`.trim()}
    >
      <button
        type="button"
        className="filter-checklist__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="filter-checklist__label">{label}</span>
        <span className="filter-checklist__value">{displayLabel}</span>
        <span className="filter-checklist__chevron" aria-hidden />
      </button>

      {open && (
        <div id={listId} className="filter-checklist__menu" role="listbox" aria-label={label} aria-multiselectable>
          <button
            type="button"
            className="filter-checklist__clear"
            onClick={() => onChange([])}
            disabled={values.length === 0}
          >
            Tout afficher
          </button>
          {options.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <label key={opt.value} className={`filter-checklist__item ${checked ? 'filter-checklist__item--checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
