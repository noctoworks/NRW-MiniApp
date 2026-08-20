import { Check, CloudDownload, Download, Settings, type LucideIcon } from 'lucide-react';

/** Remnawave Subpage Builder присылает svgIconKey/svgIconColor из СВОЕЙ иконочной
 * библиотеки (у нас её нет) — здесь только то немногое подмножество, что реально
 * встречается в конфиге живой панели (проверено вживую, см. диалог): DownloadIcon,
 * CloudDownload, Gear, Check. Неизвестный ключ — нейтральная иконка-заглушка,
 * не ошибка (админ может завести в панели что угодно). */
const ICON_BY_KEY: Record<string, LucideIcon> = {
  DownloadIcon: Download,
  CloudDownload: CloudDownload,
  Gear: Settings,
  Check: Check,
};

/** Цвета — из палитры Remnawave (cyan/violet/red/teal), но собственные hex,
 * подобранные под нашу тёмную тему, а не 1-в-1 скопированные у панели. */
const COLOR_BY_KEY: Record<string, string> = {
  cyan: '#22c5f5',
  violet: '#8b5cf6',
  red: '#ff5b5b',
  teal: '#2dd4bf',
};

const FALLBACK_COLOR = '#7c8ba1';

export function resolveBlockIcon(iconKey: string): LucideIcon {
  return ICON_BY_KEY[iconKey] ?? Settings;
}

export function resolveBlockColor(iconColor: string): string {
  return COLOR_BY_KEY[iconColor] ?? FALLBACK_COLOR;
}
