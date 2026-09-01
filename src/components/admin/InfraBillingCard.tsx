import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getInfraBilling } from '../../api/admin';
import { formatDate } from '../../lib/format';

function formatAmount(value: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);
}

/** Расходы на инфраструктуру — реальная фича Remnawave (Providers/Billing
 * Nodes/History, диалог 2026-09-01: пользователь поправил "у Remnawave есть
 * Cost"), не выдумка. Стоимость привязана к провайдеру-хостеру, не к ноде
 * напрямую, и валюты в API нет вообще — что админ ввёл в Remnawave, то и
 * показываем, без ₽/$ (см. get_infra_billing в базовом клиенте). */
export default function InfraBillingCard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'infra-billing'], queryFn: getInfraBilling });

  return (
    <Card view="outlined" className="flex flex-col">
      <div className="p-4 pb-2">
        <Text variant="subheader-1" className="block">
          Расходы на инфраструктуру
        </Text>
        <Text variant="caption-2" color="secondary">
          Из Remnawave (Providers/Billing Nodes). Без единиц валюты — сколько ввели в панели, столько и здесь.
        </Text>
      </div>

      {isLoading ? (
        <Text variant="body-1" color="secondary" className="block px-4 pb-4">
          Загрузка…
        </Text>
      ) : !data || data.nodes.length === 0 ? (
        <Text variant="body-2" color="secondary" className="block px-4 pb-4">
          Ни одна нода не привязана к биллингу — настройте Providers и Billing Nodes в самой панели
          Remnawave (Infra Billing), тогда данные появятся здесь.
        </Text>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3">
            <div>
              <Text variant="caption-2" color="secondary" className="block">
                Всего потрачено
              </Text>
              <Text variant="body-1" className="font-semibold">
                {formatAmount(data.total_spent)}
              </Text>
            </div>
            <div>
              <Text variant="caption-2" color="secondary" className="block">
                В этом месяце
              </Text>
              <Text variant="body-1" className="font-semibold">
                {formatAmount(data.current_month_payments)}
              </Text>
            </div>
            <div>
              <Text variant="caption-2" color="secondary" className="block">
                Скоро платёж
              </Text>
              <Text variant="body-1" className="font-semibold">
                {data.upcoming_nodes_count}
              </Text>
            </div>
          </div>

          {data.nodes.map((node) => (
            <div
              key={node.node_uuid ?? node.node_name}
              className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-2.5"
            >
              <div className="flex flex-col">
                <Text variant="body-1">{node.node_name}</Text>
                <Text variant="caption-2" color="secondary">
                  {node.provider_name}
                </Text>
              </div>
              <Text variant="body-2" color="secondary">
                {node.next_billing_at ? `след. платёж ${formatDate(node.next_billing_at)}` : '—'}
              </Text>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}
