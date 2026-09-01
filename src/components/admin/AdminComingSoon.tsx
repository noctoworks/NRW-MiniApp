import type { IconData } from '@gravity-ui/uikit';
import { Card, Icon, Text } from '@gravity-ui/uikit';

interface AdminComingSoonProps {
  icon: IconData;
  title: string;
  description: string;
}

/** Заглушка для разделов новой IA (см. диалог 2026-09-01, "прям много чего
 * переработать"), под которые ещё нет данных на бэкенде — Ноды/Регионы/
 * Трафик/Мониторинг (нет вызова к Remnawave), Промокоды/Платежи/Подписки/
 * Устройства (нет cross-user CRUD/листинга), Логи/Администраторы/Настройки
 * (нет самой модели/системы). Раздел виден в сайдбаре сразу (вся IA), но
 * открывает эту заглушку вместо 404 — так очевиднее, что фича на подходе,
 * а не потеряна. */
export default function AdminComingSoon({ icon, title, description }: AdminComingSoonProps) {
  return (
    <div className="flex flex-col gap-4">
      <Text variant="header-1">{title}</Text>
      <Card view="filled" className="flex flex-col items-center gap-3 p-10 text-center">
        <Icon data={icon} size={32} className="opacity-50" />
        <Text variant="body-1" color="secondary">
          {description}
        </Text>
        <Text variant="caption-2" color="secondary">
          Скоро появится
        </Text>
      </Card>
    </div>
  );
}
