import {
  ChartColumn,
  ChartLine,
  ChartLineArrowUp,
  Comments,
  CreditCard,
  Flag,
  Gear,
  Globe,
  House,
  Link as LinkIcon,
  Persons,
  Pulse,
  Server,
  ShieldKeyhole,
  Smartphone,
  Tags,
  TagRuble,
  Terminal,
  Wallet,
} from '@gravity-ui/icons';
import type { IconData } from '@gravity-ui/uikit';

export interface AdminNavGroup {
  id: string;
  title: string;
}

export interface AdminNavItem {
  id: string;
  to: string;
  label: string;
  end?: boolean;
  icon: IconData;
  /** Undefined — верхний пункт вне групп ("Обзор"). */
  groupId?: string;
  /** Заглушка вместо реальной страницы — см. AdminComingSoon. */
  comingSoon?: string;
}

// Новая IA (см. диалог 2026-09-01, "прям много чего переработать") — четыре
// группы + "Обзор" сверху вне групп. Кампании/Обращения/Промогруппы/LTV не
// было в исходном мокапе пользователя, но это реальные существующие
// разделы — распределены по ближайшей по смыслу группе, а не выброшены.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { id: 'product', title: 'Продукт' },
  { id: 'infra', title: 'Инфраструктура' },
  { id: 'finance', title: 'Финансы' },
  { id: 'system', title: 'Система' },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'overview', to: '/admin', label: 'Обзор', end: true, icon: House },

  { id: 'users', to: '/admin/users', label: 'Пользователи', icon: Persons, groupId: 'product' },
  {
    id: 'subscriptions',
    to: '/admin/subscriptions',
    label: 'Подписки',
    icon: CreditCard,
    groupId: 'product',
    comingSoon: 'Общий список подписок по всем пользователям — сейчас доступно только внутри карточки пользователя.',
  },
  {
    id: 'devices',
    to: '/admin/devices',
    label: 'Устройства',
    icon: Smartphone,
    groupId: 'product',
    comingSoon: 'Общий список устройств по всем пользователям — сейчас доступно только внутри карточки пользователя, панель Remnawave не отдаёт это одним запросом.',
  },
  {
    id: 'promo-codes',
    to: '/admin/promo-codes',
    label: 'Промокоды',
    icon: TagRuble,
    groupId: 'product',
    comingSoon: 'Разовые промокоды — модель в базе уже есть, активация работает в чат-боте, но нет управления из веб-админки.',
  },
  { id: 'promo-groups', to: '/admin/promo-groups', label: 'Промогруппы', icon: Tags, groupId: 'product' },
  { id: 'referrals', to: '/admin/referrals', label: 'Рефералы', icon: LinkIcon, groupId: 'product' },
  { id: 'campaigns', to: '/admin/campaigns', label: 'Кампании', icon: Flag, groupId: 'product' },
  { id: 'support', to: '/admin/support', label: 'Обращения', icon: Comments, groupId: 'product' },

  { id: 'nodes', to: '/admin/nodes', label: 'Ноды', icon: Server, groupId: 'infra' },
  {
    id: 'regions',
    to: '/admin/regions',
    label: 'Регионы',
    icon: Globe,
    groupId: 'infra',
    comingSoon: 'Разбивка по странам/регионам — поле у сквадов в базе есть, но панель пока не заполняет его реальным значением.',
  },
  {
    id: 'traffic',
    to: '/admin/traffic',
    label: 'Трафик',
    icon: ChartLine,
    groupId: 'infra',
    comingSoon: 'Трафик по нодам/регионам во времени — суммарный трафик уже есть на «Обзоре», разбивка ждёт раздела «Ноды».',
  },
  {
    id: 'monitoring',
    to: '/admin/monitoring',
    label: 'Мониторинг',
    icon: Pulse,
    groupId: 'infra',
    comingSoon: 'Живые метрики нод (CPU/память/аптайм) — зависит от того, что именно отдаёт API Remnawave, ещё не проверяли.',
  },

  {
    id: 'payments',
    to: '/admin/payments',
    label: 'Платежи',
    icon: Wallet,
    groupId: 'finance',
    comingSoon: 'Общий список всех платежей — сейчас доступно только внутри карточки пользователя (вкладка «Транзакции»).',
  },
  { id: 'growth', to: '/admin/growth', label: 'Доход', icon: ChartLineArrowUp, groupId: 'finance' },
  { id: 'ltv', to: '/admin/ltv', label: 'LTV и когорты', icon: ChartColumn, groupId: 'finance' },

  {
    id: 'logs',
    to: '/admin/logs',
    label: 'Логи',
    icon: Terminal,
    groupId: 'system',
    comingSoon: 'Журнал действий админов и системных событий — сейчас есть только docker logs на сервере.',
  },
  {
    id: 'administrators',
    to: '/admin/administrators',
    label: 'Администраторы',
    icon: ShieldKeyhole,
    groupId: 'system',
    comingSoon: 'Список админов сейчас — просто ADMIN_TELEGRAM_IDS в .env бота, нет модели/CRUD в базе.',
  },
  {
    id: 'settings',
    to: '/admin/settings',
    label: 'Настройки',
    icon: Gear,
    groupId: 'system',
    comingSoon: 'В базе есть таблица под key/value настройки, но её ещё нигде не использует ни бот, ни админка.',
  },
];
