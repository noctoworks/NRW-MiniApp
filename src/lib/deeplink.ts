/** Список VPN-клиентов из макета. Реальная url_scheme подтверждена вживую
 * только для Happ (используется ботом уже сейчас, happ://add/<url>) — для
 * остальных приложений схему никто не проверял, deep-link для них не строим,
 * чтобы не давать пользователю нерабочую кнопку (см. диалог/план). */
export interface VpnApp {
  id: string;
  name: string;
  /** null = схема не подтверждена, кнопка подключения предлагает copy вместо deep-link */
  urlScheme: string | null;
}

export const VPN_APPS: VpnApp[] = [
  { id: 'happ', name: 'Happ', urlScheme: 'happ://add/' },
  { id: 'koala-clash', name: 'Koala Clash', urlScheme: null },
  { id: 'shadowrocket', name: 'Shadowrocket', urlScheme: null },
  { id: 'streisand', name: 'Streisand', urlScheme: null },
  { id: 'v2box', name: 'V2Box', urlScheme: null },
  { id: 'karing', name: 'Karing', urlScheme: null },
  { id: 'sing-box', name: 'Sing-box', urlScheme: null },
];

export function buildDeepLink(app: VpnApp, subscriptionUrl: string): string | null {
  if (!app.urlScheme) return null;
  return `${app.urlScheme}${subscriptionUrl}`;
}
