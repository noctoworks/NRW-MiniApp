import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { getGeoIp } from '../lib/geoip';

export default function IpCard() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ['geoip'],
    // forceRefresh: true — эта queryFn перезапускается только через явный
    // invalidateQueries по клику на кнопку ниже (staleTime: Infinity блокирует
    // любой другой рефетч), так что "обновить" всегда должно означать
    // настоящий новый запрос, а не отдать старый закэшированный промис (см. ревью).
    queryFn: () => getGeoIp(true),
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <div className="card !py-2.5 !pr-3 !pl-4 flex flex-1 flex-col gap-0.5 !rounded-2xl">
      <span className="text-xs text-[hsl(var(--subtitle-foreground))]">Ваш IP</span>
      <button
        type="button"
        aria-label="Обновить IP"
        onClick={() => queryClient.invalidateQueries({ queryKey: ['geoip'] })}
        className="flex w-full items-center gap-1.5"
      >
        {data && (
          <img
            src={`https://flagcdn.com/16x12/${data.countryCode.toLowerCase()}.png`}
            alt={data.countryCode}
            width={16}
            height={12}
            className="shrink-0 rounded-[2px]"
          />
        )}
        <span className="truncate text-sm font-semibold">{data?.ip ?? '…'}</span>
        <RefreshCw
          size={15}
          strokeWidth={2.2}
          className={`ml-auto shrink-0 text-[hsl(var(--subtitle-foreground))] transition-transform ${isFetching ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
}
