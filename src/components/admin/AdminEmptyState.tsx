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
