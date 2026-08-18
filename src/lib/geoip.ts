export interface GeoIpResult {
  ip: string;
  countryCode: string;
}

/** ipapi.co — публичный, поддерживает CORS, без ключа для низкого трафика.
 * Реальный внешний lookup (см. диалог) — не связан с нашим бэкендом. */
async function fetchGeoIp(): Promise<GeoIpResult> {
  const response = await fetch('https://ipapi.co/json/');
  if (!response.ok) throw new Error(`ipapi.co: HTTP ${response.status}`);
  const data = await response.json();
  return { ip: data.ip as string, countryCode: (data.country_code as string) ?? '' };
}

let cached: Promise<GeoIpResult> | null = null;

export function getGeoIp(forceRefresh = false): Promise<GeoIpResult> {
  if (forceRefresh || !cached) {
    cached = fetchGeoIp();
  }
  return cached;
}
