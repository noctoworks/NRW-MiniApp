import { useQuery } from '@tanstack/react-query';
import { Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { getCohorts, getLtv } from '../../api/admin';
import CohortTable from '../../components/admin/CohortTable';
import KpiTile from '../../components/admin/KpiTile';
import { formatRub } from '../../lib/format';

export default function AdminLtv() {
  const { data: ltv, isLoading } = useQuery({ queryKey: ['admin', 'ltv'], queryFn: getLtv });
  const { data: cohorts } = useQuery({ queryKey: ['admin', 'cohorts'], queryFn: getCohorts });

  if (isLoading || !ltv) {
    return <div className="text-sm text-muted">Загрузка…</div>;
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

      <Section header="Топ-плательщики">
        {ltv.top_payers.map((payer, i) => (
          <Cell key={payer.user_id} after={<span className="font-semibold">{formatRub(payer.total_kopeks)}</span>}>
            {i + 1}. {payer.username ? `@${payer.username}` : `id${payer.telegram_id}`}
          </Cell>
        ))}
      </Section>

      {cohorts && <CohortTable data={cohorts} />}
    </div>
  );
}
