import { hapticImpact } from '../lib/haptics';

interface PowerButtonProps {
  connected: boolean;
  onClick: () => void;
}

export default function PowerButton({ connected, onClick }: PowerButtonProps) {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden">
      {/* Настоящая точечная карта мира (как в референсе) — ассет лежит локально
       * в public/, без обращения к стороннему хосту в рантайме. */}
      <img src="/map.svg" alt="" aria-hidden className="power-map" />

      <button
        type="button"
        onClick={() => {
          hapticImpact('medium');
          onClick();
        }}
        className="power-button"
        data-connected={connected ? 'true' : 'false'}
        aria-label={connected ? 'Отключить VPN' : 'Подключить VPN'}
      >
        <span className="power-button-halo" />
        <span className="power-button-disc">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 2v8" />
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          </svg>
        </span>
      </button>
    </div>
  );
}
