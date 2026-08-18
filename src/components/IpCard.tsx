import { useQuery, useQueryClient } from '@tanstack/react-query';
import { countryCodeToFlag, getGeoIp } from '../lib/geoip';

export default function IpCard() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ['geoip'],
    queryFn: () => getGeoIp(),
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl bg-surface px-4 py-3">
      <span className="text-xs text-muted">Ваш IP</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          {data ? `${data.countryCode} ${countryCodeToFlag(data.countryCode)}`.trim() : '—'}
        </span>
        <span className="truncate text-sm font-medium">{data?.ip ?? '…'}</span>
        <button
          type="button"
          aria-label="Обновить IP"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['geoip'] })}
          className={`ml-auto text-muted transition-transform ${isFetching ? 'animate-spin' : ''}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
