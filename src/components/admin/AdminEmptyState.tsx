interface AdminEmptyStateProps {
  text: string;
}

/** Общий пустой стейт для списков в админке (транзакции/кампании/промогруппы/
 * рефереры) — раньше был голый серый текст в Cell, вынесено в общий компонент. */
export default function AdminEmptyState({ text }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <span className="text-sm text-muted">{text}</span>
    </div>
  );
}

interface AdminErrorStateProps {
  text?: string;
  onRetry: () => void;
}

/** Общий стейт ошибки запроса — раньше почти все экраны админки проверяли
 * только isLoading, и при сетевом сбое зависали на "Загрузка…" навсегда
 * (см. диалог "давай поправим админку" / аудит состояний). Простой текст +
 * одно явное действие "Повторить" — по практике самый дешёвый и заметный
 * способ починить "сырое" ощущение от инструмента. */
export function AdminErrorState({ text = 'Не удалось загрузить данные.', onRetry }: AdminErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <span className="text-sm text-[hsl(var(--destructive))]">{text}</span>
      <button type="button" onClick={onRetry} className="text-sm font-semibold text-[hsl(var(--primary))]">
        Повторить
      </button>
    </div>
  );
}
