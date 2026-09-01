import {
  ChartLine,
  ChartMixed,
  Comments,
  CreditCard,
  Flag,
  Globe,
  House,
  Persons,
  Pulse,
  Server,
  Tags,
  TagRuble,
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
}

// Новая IA (см. диалог 2026-09-01, "прям много чего переработать") — четыре
// группы + "Обзор" сверху вне групп. Кампании/Обращения/Промогруппы/LTV не
// было в исходном мокапе пользователя, но это реальные существующие
// разделы — распределены по ближайшей по смыслу группе, а не выброшены.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { id: 'product', title: 'Продукт' },
  { id: 'infra', title: 'Инфраструктура' },
  { id: 'finance', title: 'Финансы' },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'overview', to: '/admin', label: 'Обзор', end: true, icon: House },

  { id: 'users', to: '/admin/users', label: 'Пользователи', icon: Persons, groupId: 'product' },
  { id: 'subscriptions', to: '/admin/subscriptions', label: 'Подписки', icon: CreditCard, groupId: 'product' },
  { id: 'promo-codes', to: '/admin/promo-codes', label: 'Промокоды', icon: TagRuble, groupId: 'product' },
  { id: 'promo-groups', to: '/admin/promo-groups', label: 'Промогруппы', icon: Tags, groupId: 'product' },
  { id: 'campaigns', to: '/admin/campaigns', label: 'Кампании', icon: Flag, groupId: 'product' },
  { id: 'support', to: '/admin/support', label: 'Обращения', icon: Comments, groupId: 'product' },

  { id: 'nodes', to: '/admin/nodes', label: 'Ноды', icon: Server, groupId: 'infra' },
  { id: 'regions', to: '/admin/regions', label: 'Регионы', icon: Globe, groupId: 'infra' },
  { id: 'traffic', to: '/admin/traffic', label: 'Трафик', icon: ChartLine, groupId: 'infra' },
  { id: 'monitoring', to: '/admin/monitoring', label: 'Мониторинг', icon: Pulse, groupId: 'infra' },

  { id: 'transactions', to: '/admin/transactions', label: 'Транзакции', icon: Wallet, groupId: 'finance' },
  { id: 'analytics', to: '/admin/analytics', label: 'Аналитика', icon: ChartMixed, groupId: 'finance' },
];
