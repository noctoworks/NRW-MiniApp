import { useQuery } from '@tanstack/react-query';
import { Title } from '@telegram-apps/telegram-ui';
import { getCohorts, getLtv } from '../../api/admin';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';
import CohortTable from '../../components/admin/CohortTable';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';

export default function AdminLtv() {
  const { data: ltv, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'ltv'], queryFn: getLtv });
  const { data: cohorts } = useQuery({ queryKey: ['admin', 'cohorts'], queryFn: getCohorts });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !ltv) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Title level="2" weight="2">LTV и когорты</Title>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="ARPU (все юзеры)" value={formatRub(ltv.arpu_kopeks)} accent />
        <KpiTile label="LTV плативших" value={formatRub(ltv.avg_ltv_paying_kopeks)} />
        <KpiTile label="Медианный LTV" value={formatRub(ltv.median_ltv_kopeks)} />
        <KpiTile label="Плативших юзеров" value={String(ltv.paying_users_count)} />
      </div>

      <div>
        <div className="section-title">Топ-плательщики</div>
        <div className="card !p-0">
          {ltv.top_payers.length === 0 ? (
            <AdminEmptyState text="Пока нет плативших пользователей" />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {ltv.top_payers.map((payer, i) => (
                <div key={payer.user_id} className="flex items-center justify-between text-sm">
                  <span>
                    {i + 1}. {payer.full_name || (payer.username ? `@${payer.username}` : `id${payer.telegram_id}`)}
                  </span>
                  <span className="font-semibold text-white">{formatRub(payer.total_kopeks)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {cohorts && <CohortTable data={cohorts} />}
    </div>
  );
}
