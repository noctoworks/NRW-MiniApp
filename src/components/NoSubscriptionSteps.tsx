interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Выберите тариф',
    description: 'Активируйте бесплатный период или оформите подписку, чтобы открыть все возможности VPN.',
  },
  {
    number: 2,
    title: 'Подключение',
    description: 'Отсканируйте QR-код или скачайте приложение, чтобы начать пользоваться VPN.',
  },
];

export default function NoSubscriptionSteps() {
  return (
    <div className="flex flex-col gap-4">
      {STEPS.map((step) => (
        <div key={step.number} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
            {step.number}
          </span>
          <div>
            <div className="font-semibold text-white">{step.title}</div>
            <div className="text-sm text-[hsl(var(--subtitle-foreground))]">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
