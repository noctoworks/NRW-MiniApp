import { Cell, IconButton, Modal, Placeholder } from '@telegram-apps/telegram-ui';
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
      <Cell
        className="rounded-2xl bg-surface"
        after={
          <div className="flex items-center gap-1">
            <IconButton mode="plain" size="s" aria-label="QR-код" onClick={() => setShowQr(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
              </svg>
            </IconButton>
            <IconButton mode="plain" size="s" aria-label="Копировать" onClick={handleCopy}>
              {copied ? (
                <span className="text-xs font-medium text-success">✓</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </IconButton>
          </div>
        }
      >
        <span className="block max-w-[180px] truncate">{url}</span>
      </Cell>

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
