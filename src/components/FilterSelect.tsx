import { useEffect, useId, useRef, useState } from 'react';
import './FilterSelect.css';

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterSelect({ label, value, options, onChange, className = '' }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? label;

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
      className={`filter-select ${open ? 'filter-select--open' : ''} ${className}`.trim()}
    >
      <button
        type="button"
        className="filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="filter-select__label">{label}</span>
        <span className="filter-select__value">{displayLabel}</span>
        <span className="filter-select__chevron" aria-hidden />
      </button>

      {open && (
        <ul id={listId} className="filter-select__menu" role="listbox" aria-label={label}>
          {options.map((opt) => (
            <li key={opt.value || '__all'} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={`filter-select__option ${value === opt.value ? 'filter-select__option--active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
