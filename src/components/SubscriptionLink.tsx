import { Modal, Placeholder } from '@telegram-apps/telegram-ui';
import { Check, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { copyToClipboard } from '../lib/clipboard';

interface SubscriptionLinkProps {
  url: string;
}

export default function SubscriptionLink({ url }: SubscriptionLinkProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* Ссылка и обе иконки — на одной общей подложке-«инпуте» внутри карточки;
       * текст справа затухает маской, а не обрезается многоточием. */}
      <div className="field flex items-center gap-2">
        <span
          className="block min-w-0 flex-1 truncate text-sm"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
          }}
        >
          {url}
        </span>
        <button
          type="button"
          aria-label="QR-код"
          onClick={() => setShowQr(true)}
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

      <Modal open={showQr} onOpenChange={setShowQr}>
        <Placeholder>
          <div className="rounded-2xl bg-white p-5">
            <QRCodeSVG value={url} size={220} />
          </div>
        </Placeholder>
      </Modal>
    </>
  );
}
