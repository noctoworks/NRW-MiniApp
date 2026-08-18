interface PowerButtonProps {
  connected: boolean;
  onClick: () => void;
}

export default function PowerButton({ connected, onClick }: PowerButtonProps) {
  return (
    <div className="dot-map-bg relative flex h-64 items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        className="relative flex h-36 w-36 items-center justify-center rounded-full bg-power-gradient shadow-glow transition-transform active:scale-95"
      >
        <span className="absolute inset-0 rounded-full ring-4 ring-white/10" />
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 2v8" />
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        </svg>
      </button>
      {!connected && (
        <span className="absolute bottom-2 text-xs text-muted">Нажмите, чтобы подключиться</span>
      )}
    </div>
  );
}
