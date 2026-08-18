import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { getDashboard } from '../../api/cabinet';

export default function AdminGuard({ children }: { children: ReactNode }) {
  // Тот же queryKey, что у Dashboard — повторный поход в сеть не нужен,
  // React Query отдаст закэшированный ответ.
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) return null;
  if (!data?.is_admin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
