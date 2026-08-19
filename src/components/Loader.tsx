interface LoaderProps {
  /** Текст под спиннером — только там, где ожидание требует пояснения. */
  label?: string;
  /** Загрузка части экрана (внутри уже отрисованной страницы), а не всего экрана. */
  inline?: boolean;
}

/** Единое состояние загрузки для всех экранов (главный, оплата, админка). */
export default function Loader({ label, inline }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${inline ? 'py-12' : 'min-h-screen'}`}>
      <span className="spinner" role="status" aria-label="Загрузка" />
      {label && <span className="text-sm text-[hsl(var(--subtitle-foreground))]">{label}</span>}
    </div>
  );
}
