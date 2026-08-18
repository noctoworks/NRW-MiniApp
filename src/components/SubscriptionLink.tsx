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
      <div className="config-cell">
        <span className="block flex-1 truncate text-sm">{url}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="QR-код"
            onClick={() => setShowQr(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--subtitle-foreground))] active:bg-white/5"
          >
            <QrCode size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Копировать"
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--subtitle-foreground))] active:bg-white/5"
          >
            {copied ? <Check size={18} strokeWidth={2} className="text-[hsl(var(--primary))]" /> : <Copy size={18} strokeWidth={2} />}
          </button>
        </div>
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
