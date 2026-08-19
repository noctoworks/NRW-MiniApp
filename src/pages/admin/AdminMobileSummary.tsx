import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getOverview } from '../../api/admin';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';

export default function AdminMobileSummary() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview });

  return (
    <div className="page">
      <div className="page-header">
        <button type="button" onClick={() => navigate('/')} aria-label="Назад" className="icon-button justify-self-start">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <span className="page-header-title">Админка</span>
        <span />
      </div>

      {isLoading || !data ? (
        <Loader inline />
      ) : (
        <div className="animate-fade-in grid grid-cols-2 gap-3">
          <KpiTile label="Доход сегодня" value={formatRub(data.revenue_today_kopeks)} accent />
          <KpiTile label="Доход за 7 дн" value={formatRub(data.revenue_7d_kopeks)} />
          <KpiTile label="Активные подписки" value={String(data.active_subscriptions)} />
          <KpiTile label="Новые за 7 дн" value={String(data.new_users_7d)} />
          <KpiTile label="Конверсия" value={`${data.conversion_percent}%`} />
          <KpiTile label="Средний чек" value={formatRub(data.avg_check_kopeks)} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[hsl(var(--subtitle-foreground))]">
        Полная аналитика и управление пользователями — откройте Mini App на широком экране
        (Telegram Desktop/Web).
      </p>
    </div>
  );
}
