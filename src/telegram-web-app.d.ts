interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  section_bg_color?: string;
  [key: string]: string | undefined;
}

interface TelegramWebAppBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser };
  ready: () => void;
  expand: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  BackButton: TelegramWebAppBackButton;
  onEvent: (eventType: 'themeChanged', callback: () => void) => void;
  offEvent: (eventType: 'themeChanged', callback: () => void) => void;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
