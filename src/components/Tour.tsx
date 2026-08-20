import type { CSSProperties } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { hapticImpact, hapticSelection } from '../lib/haptics';

export interface TourStep {
  /** id реального DOM-элемента, который нужно подсветить — см. атрибуты
   * id="tour-..." на Dashboard.tsx/TopBar.tsx. Если элемента нет в DOM на
   * момент показа (например нет подписки у совсем нового юзера — не
   * успела выдаться) — шаг просто пропускается, тур не падает. */
  targetId: string;
  title: string;
  description: string;
}

interface TourProps {
  steps: TourStep[];
  onFinish: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 12;

export default function Tour({ steps, onFinish }: TourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[index];

  const measure = (): boolean => {
    const el = step ? document.getElementById(step.targetId) : null;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    return true;
  };

  // Замер после каждой смены шага — пропускаем шаги, чей элемент не
  // смонтирован (условный рендер на Dashboard: подписки/устройств/баннера
  // рефералки может не быть у части пользователей).
  useLayoutEffect(() => {
    if (!step) {
      onFinish();
      return;
    }
    if (!measure()) {
      setIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step]);

  useEffect(() => {
    const handler = () => measure();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!step || !rect) return null;

  const isLast = index === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      hapticImpact('light');
      onFinish();
    } else {
      hapticSelection();
      setIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    hapticImpact('light');
    onFinish();
  };

  const spotlightStyle: CSSProperties = {
    position: 'fixed',
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
    borderRadius: 16,
    boxShadow: '0 0 0 9999px rgba(9, 13, 19, 0.82)',
    outline: '2px solid hsl(var(--primary))',
    pointerEvents: 'none',
    transition: 'top 0.22s ease, left 0.22s ease, width 0.22s ease, height 0.22s ease',
    zIndex: 60,
  };

  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - (rect.top + rect.height);
  const preferBelow = spaceBelow > 180 || rect.top < 180;

  const tooltipStyle: CSSProperties = {
    position: 'fixed',
    left: 16,
    right: 16,
    zIndex: 61,
    ...(preferBelow
      ? { top: Math.min(rect.top + rect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP, viewportHeight - 200) }
      : { bottom: viewportHeight - rect.top + SPOTLIGHT_PADDING + TOOLTIP_GAP }),
  };

  return (
    <>
      {/* Блокирует тапы по остальному интерфейсу, пока идёт тур — сама
       * подсветка (spotlightStyle) декоративная (pointer-events: none). */}
      <div className="fixed inset-0" style={{ zIndex: 59 }} />
      <div style={spotlightStyle} />
      <div className="card flex flex-col gap-3" style={tooltipStyle}>
        <div>
          <div className="font-semibold text-white">{step.title}</div>
          <p className="mt-1 text-sm text-[hsl(var(--subtitle-foreground))]">{step.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.targetId}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-[hsl(var(--primary))]' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleSkip} className="text-sm text-[hsl(var(--subtitle-foreground))]">
              Пропустить
            </button>
            <button type="button" onClick={handleNext} className="btn-primary !min-h-0 !w-auto !px-4 !py-2 !text-sm">
              {isLast ? 'Понятно' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
