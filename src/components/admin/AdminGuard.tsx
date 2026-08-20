import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { getDashboard } from '../../api/cabinet';

export default function AdminGuard({ children }: { children: ReactNode }) {
  // Тот же queryKey, что у Dashboard — повторный поход в сеть не нужен,
  // React Query отдаст закэшированный ответ.
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) return null;
  if (isError) {
    // Не редиректим на сбое сети — иначе админа с нестабильным интернетом
    // молча выкидывает из /admin, как будто у него нет прав, см. ревью.
    return (
      <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
        Не удалось проверить права доступа. Попробуйте открыть раздел ещё раз чуть позже.
      </p>
    );
  }
  if (!data?.is_admin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
