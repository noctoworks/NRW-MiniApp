import { useQuery } from '@tanstack/react-query';
import { Subheadline } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router';
import { getOverview } from '../../api/admin';
import KpiTile from '../../components/admin/KpiTile';
import { formatRub } from '../../lib/format';

export default function AdminMobileSummary() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview });

  return (
    <div className="min-h-screen px-4 pb-8 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="text-sm text-muted">
          ← Назад
        </button>
        <Subheadline weight="2">Админка</Subheadline>
        <span className="w-10" />
      </div>

      {isLoading || !data ? (
        <div className="text-center text-sm text-muted">Загрузка…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <KpiTile label="Доход сегодня" value={formatRub(data.revenue_today_kopeks)} accent />
          <KpiTile label="Доход за 7 дн" value={formatRub(data.revenue_7d_kopeks)} />
          <KpiTile label="Активные подписки" value={String(data.active_subscriptions)} />
          <KpiTile label="Новые за 7 дн" value={String(data.new_users_7d)} />
          <KpiTile label="Конверсия" value={`${data.conversion_percent}%`} />
          <KpiTile label="Средний чек" value={formatRub(data.avg_check_kopeks)} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Полная аналитика и управление пользователями — откройте Mini App на широком экране
        (Telegram Desktop/Web).
      </p>
    </div>
  );
}
