import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Card } from '../types';
import { isLandscapeCard } from '../lib/cards';
import './CardLightbox.css';

interface CardLightboxProps {
  card: Card | null;
  owned: number;
  index: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onChange: (delta: number) => void;
}

const MAX_TILT = 14;

export function CardLightbox({
  card,
  owned,
  index,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onChange,
}: CardLightboxProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });

  useEffect(() => {
    if (!card) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [card, onClose, hasPrev, hasNext, onPrev, onNext]);

  useEffect(() => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  }, [card?.id]);

  if (!card) return null;

  const landscape = isLandscapeCard(card);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: px * MAX_TILT,
      y: -py * MAX_TILT,
      shineX: (px + 0.5) * 100,
      shineY: (py + 0.5) * 100,
    });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  return (
    <div className="card-lightbox" role="dialog" aria-modal="true" aria-label={card.name}>
      <button type="button" className="card-lightbox__backdrop" onClick={onClose} aria-label="Fermer" />

      {hasPrev && (
        <button
          type="button"
          className="card-lightbox__nav card-lightbox__nav--prev"
          onClick={onPrev}
          aria-label="Carte précédente"
        >
          ‹
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="card-lightbox__nav card-lightbox__nav--next"
          onClick={onNext}
          aria-label="Carte suivante"
        >
          ›
        </button>
      )}

      <div className="card-lightbox__panel">
        <div
          ref={tiltRef}
          className="card-lightbox__tilt"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={
            {
              '--tilt-x': `${tilt.x}deg`,
              '--tilt-y': `${tilt.y}deg`,
              '--shine-x': `${tilt.shineX}%`,
              '--shine-y': `${tilt.shineY}%`,
            } as CSSProperties
          }
        >
          <div
            className={`card-lightbox__frame ${landscape ? 'card-lightbox__frame--landscape' : 'card-lightbox__frame--portrait'}`}
          >
            <img className="card-lightbox__image" src={card.image} alt={card.name} />
            <div className="card-lightbox__shine" aria-hidden />
          </div>
        </div>
        <div className="card-lightbox__meta">
          <p className="card-lightbox__position">
            {index + 1} / {total}
          </p>
          <h2 className="card-lightbox__name">{card.name}</h2>
          <p className="card-lightbox__code">{card.code}</p>
          <div className="card-lightbox__controls">
            <button type="button" className="qty-btn" onClick={() => onChange(-1)} disabled={owned <= 0}>
              −
            </button>
            <span className="card-lightbox__owned">
              {owned} exemplaire{owned !== 1 ? 's' : ''}
            </span>
            <button type="button" className="qty-btn" onClick={() => onChange(1)}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
