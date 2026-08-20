import { useEffect } from 'react';
import { applyTelegramTheme } from '../lib/theme';

/** Оформление фиксированное (см. lib/theme.ts) — реагировать на themeChanged
 * незачем, применяем один раз при монтировании. */
export function useTelegramTheme(): void {
  useEffect(() => {
    applyTelegramTheme();
  }, []);
}
