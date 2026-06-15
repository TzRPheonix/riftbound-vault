import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './FilterChecklist.css';

export interface FilterChecklistOption {
  value: string;
  label: string;
  /** Optional color swatch (e.g. domain). */
  swatch?: string;
}

interface FilterChecklistProps {
  label: string;
  values: string[];
  options: readonly FilterChecklistOption[];
  onChange: (values: string[]) => void;
  emptyLabel?: string;
  countNoun?: string;
  mode?: 'multi' | 'single';
  className?: string;
}

export function FilterChecklist({
  label,
  values,
  options,
  onChange,
  emptyLabel = 'Tous',
  countNoun = 'sélections',
  mode = 'multi',
  className = '',
}: FilterChecklistProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isActive = values.length > 0;

  const displayLabel = useMemo(() => {
    if (values.length === 0) return emptyLabel;
    if (mode === 'single' || values.length === 1) {
      return options.find((o) => o.value === values[0])?.label ?? values[0];
    }
    if (values.length === options.length) return `Tous · ${label}`;
    return `${values.length} ${countNoun}`;
  }, [values, options, emptyLabel, countNoun, mode, label]);

  const toggle = (value: string) => {
    if (mode === 'single') {
      onChange(values.includes(value) ? [] : [value]);
      setOpen(false);
      return;
    }
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
      className={[
        'filter-checklist',
        open ? 'filter-checklist--open' : '',
        isActive ? 'filter-checklist--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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
        {isActive && mode === 'multi' && values.length > 1 && (
          <span className="filter-checklist__badge">{values.length}</span>
        )}
        <span className="filter-checklist__chevron" aria-hidden />
      </button>

      {open && (
        <div
          id={listId}
          className="filter-checklist__menu"
          role="listbox"
          aria-label={label}
          aria-multiselectable={mode === 'multi'}
        >
          <div className="filter-checklist__menu-header">
            <span className="filter-checklist__menu-title">{label}</span>
            <button
              type="button"
              className="filter-checklist__clear"
              onClick={() => {
                onChange([]);
                if (mode === 'single') setOpen(false);
              }}
              disabled={values.length === 0}
            >
              Réinitialiser
            </button>
          </div>
          <div className="filter-checklist__options">
            {options.map((opt) => {
              const checked = values.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`filter-checklist__item ${checked ? 'filter-checklist__item--checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="filter-checklist__input"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                  />
                  <span className="filter-checklist__box" aria-hidden />
                  {opt.swatch && (
                    <span
                      className="filter-checklist__swatch"
                      style={{ background: opt.swatch }}
                      aria-hidden
                    />
                  )}
                  <span className="filter-checklist__item-label">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
