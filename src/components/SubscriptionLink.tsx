import { Check, Copy, QrCode, X } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../lib/clipboard';
import { hapticImpact, hapticNotification } from '../lib/haptics';

interface SubscriptionLinkProps {
  url: string;
}

const QR_SIZE = 220;

export default function SubscriptionLink({ url }: SubscriptionLinkProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const handleCopy = async () => {
    await copyToClipboard(url);
    hapticNotification('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (!showQr) return;

    if (!qrInstanceRef.current) {
      // Стиль как в самом Telegram (инвайт-ссылки чатов/каналов): точки
      // вместо квадратов, скруглённые "глаза" по углам.
      qrInstanceRef.current = new QRCodeStyling({
        width: QR_SIZE,
        height: QR_SIZE,
        data: url,
        margin: 0,
        type: 'svg',
        dotsOptions: { type: 'dots', color: '#000000' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
        cornersDotOptions: { type: 'dot', color: '#000000' },
        backgroundOptions: { color: 'transparent' },
        qrOptions: { errorCorrectionLevel: 'M' },
      });
    } else {
      qrInstanceRef.current.update({ data: url });
    }

    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
      qrInstanceRef.current.append(qrContainerRef.current);
    }
  }, [showQr, url]);

  const handleOpen = () => {
    hapticImpact('light');
    setShowQr(true);
  };

  const handleClose = () => {
    hapticImpact('light');
    setShowQr(false);
  };

  return (
    <>
      {/* Ссылка и обе иконки — на одной общей подложке-«инпуте» внутри карточки;
       * текст справа затухает маской, а не обрезается многоточием. */}
      <div className="field relative flex items-center gap-2">
        {copied && (
          // Микро-всплывашка над полем — подтверждение копирования, видно
          // независимо от того, ткнули по тексту ссылки или по иконке справа.
          <div className="animate-fade-in pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))] shadow-lg">
            Скопировано
            <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[hsl(var(--primary))]" />
          </div>
        )}
        {/* Сам текст ссылки — тоже кнопка копирования, не только иконка справа
         * (см. диалог: "чтобы человек нажимал на ссылку — она тоже копировалась") —
         * та же логика, что и у кнопки-иконки, просто больший тап-таргет. */}
        <button
          type="button"
          aria-label="Копировать ссылку"
          onClick={handleCopy}
          className="block min-w-0 flex-1 truncate text-left text-sm"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
          }}
        >
          {url}
        </button>
        <button
          type="button"
          aria-label="QR-код"
          onClick={handleOpen}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--subtitle-foreground))] active:bg-white/10"
        >
          <QrCode size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Копировать"
          onClick={handleCopy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--subtitle-foreground))] active:bg-white/10"
        >
          {copied ? <Check size={20} strokeWidth={2} className="text-[hsl(var(--primary))]" /> : <Copy size={20} strokeWidth={2} />}
        </button>
      </div>

      {showQr && (
        // Центрированный оверлей вместо шторки снизу — код виден целиком
        // сразу, без выезжания и перекрытия клавиатурой/жестом.
        <div
          className="animate-fade-in fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: 70, background: 'rgba(9, 13, 19, 0.82)' }}
          onClick={handleClose}
        >
          <div
            className="card relative flex flex-col items-center gap-4 !p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Закрыть"
              onClick={handleClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--subtitle-foreground))] active:bg-white/10"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <div className="rounded-2xl bg-white p-4" style={{ width: QR_SIZE + 32, height: QR_SIZE + 32 }}>
              <div ref={qrContainerRef} style={{ width: QR_SIZE, height: QR_SIZE }} />
            </div>
            <span className="max-w-[26ch] text-center text-sm text-[hsl(var(--subtitle-foreground))]">
              Отсканируйте камерой, чтобы открыть ссылку на другом устройстве
            </span>
          </div>
        </div>
      )}
    </>
  );
}
