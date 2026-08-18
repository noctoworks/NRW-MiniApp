import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { getGeoIp } from '../lib/geoip';

export default function IpCard() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ['geoip'],
    queryFn: () => getGeoIp(),
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <div className="card !py-2.5 !pr-3 !pl-4 flex flex-1 flex-col gap-1 !rounded-2xl">
      <span className="text-xs text-[hsl(var(--subtitle-foreground))]">Ваш IP</span>
      <div className="flex items-center gap-1.5">
        {data && (
          <img
            src={`https://flagcdn.com/16x12/${data.countryCode.toLowerCase()}.png`}
            alt={data.countryCode}
            width={16}
            height={12}
            className="rounded-[2px]"
          />
        )}
        <span className="truncate text-sm font-semibold">{data?.ip ?? '…'}</span>
        <button
          type="button"
          aria-label="Обновить IP"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['geoip'] })}
          className={`ml-auto text-[hsl(var(--subtitle-foreground))] transition-transform ${isFetching ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
