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

interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramBottomButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
}

type TelegramWebAppEvent =
  | 'themeChanged'
  | 'fullscreenChanged'
  | 'fullscreenFailed'
  | 'safeAreaChanged'
  | 'contentSafeAreaChanged'
  | 'viewportChanged'
  | 'homeScreenAdded'
  | 'homeScreenChecked';

/** Bot API 6.9+ — облачное key-value хранилище, привязанное к аккаунту
 * Telegram (а не к конкретному телефону/браузеру, как localStorage). Лимиты:
 * 1024 ключа, ключ до 128 симв., значение до 4096 симв. */
interface TelegramCloudStorage {
  setItem: (key: string, value: string, callback?: (error: string | null, stored?: boolean) => void) => void;
  getItem: (key: string, callback: (error: string | null, value?: string) => void) => void;
  getItems: (keys: string[], callback: (error: string | null, values?: Record<string, string>) => void) => void;
  removeItem: (key: string, callback?: (error: string | null, removed?: boolean) => void) => void;
  removeItems: (keys: string[], callback?: (error: string | null, removed?: boolean) => void) => void;
  getKeys: (callback: (error: string | null, keys?: string[]) => void) => void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser };
  ready: () => void;
  expand: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  /** Открывает t.me-ссылку (в т.ч. t.me/share/url?...) нативным диалогом
   * пересылки Telegram — сам Mini App не закрывается. */
  openTelegramLink: (url: string) => void;
  /** Bot API 7.8+ — открывает нативный редактор Stories с этим фоном.
   * media_url — ОБЯЗАТЕЛЬНО https, картинка/видео (не SVG). widget_link —
   * кликабельный стикер-ссылка поверх Stories (видно не во всех клиентах —
   * см. Bot API changelog, но text уже виден везде). Может отсутствовать в
   * старых клиентах — вызывать через опциональную цепочку. */
  shareToStory?: (
    mediaUrl: string,
    params?: { text?: string; widget_link?: { url: string; name?: string } },
  ) => void;
  /** 'android' | 'ios' | 'macos' | 'tdesktop' | 'weba' | 'webk' | 'unigram' | 'unknown' — см. Bot API. */
  platform: string;
  /** Bot API 8.0+ — настоящий fullscreen (edge-to-edge, без "плавающей" шапки
   * Telegram над контентом). Может отсутствовать в старых клиентах — вызывать
   * только через опциональную цепочку. */
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  isFullscreen?: boolean;
  /** Bot API 7.7+ — отключает жест "смахнуть вниз, чтобы закрыть", который
   * иначе конфликтует со скроллом контента у самого верха экрана. */
  disableVerticalSwipes?: () => void;
  /** Bot API 8.0+ — физическая чёлка/статус-бар устройства. Telegram сам
   * прописывает те же числа в CSS-переменные --tg-safe-area-inset-* на
   * <html> (см. globals.css) — JS-свойство нужно, только если верстать
   * отступы из React, а не через CSS var(). */
  safeAreaInset?: TelegramSafeAreaInset;
  /** Bot API 8.0+ — доп. отступ под СОБСТВЕННЫЕ элементы управления Telegram
   * (плавающая шапка/кнопка сворачивания в fullscreen), поверх safeAreaInset.
   * CSS-переменные --tg-content-safe-area-inset-*. */
  contentSafeAreaInset?: TelegramSafeAreaInset;
  /** 'bg_color' | 'secondary_bg_color' — принимает и ключевые слова темы
   * Telegram, и произвольный #RRGGBB. */
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  /** Bot API 6.1+ — вибро-отклик, см. lib/haptics.ts. */
  HapticFeedback?: TelegramHapticFeedback;
  /** Bot API 6.2+ — нативные попапы вместо window.confirm/alert, см. lib/nativeDialogs.ts. */
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showPopup?: (
    params: {
      title?: string;
      message: string;
      buttons?: { id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }[];
    },
    callback?: (buttonId: string) => void,
  ) => void;
  /** Bot API 6.2+ — диалог "точно закрыть Mini App?" при попытке закрытия
   * (свайпом/системной кнопкой назад) — см. hooks/useTelegramClosingConfirmation.ts. */
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  MainButton: TelegramBottomButton;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  BackButton: TelegramWebAppBackButton;
  onEvent: (eventType: TelegramWebAppEvent, callback: () => void) => void;
  offEvent: (eventType: TelegramWebAppEvent, callback: () => void) => void;
  CloudStorage?: TelegramCloudStorage;
  /** Bot API 8.0+ — статус: 'unsupported' (старый клиент/десктоп),
   * 'unknown' (можно предложить), 'added', 'missed' (юзер уже отклонял). */
  checkHomeScreenStatus?: (
    callback: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void,
  ) => void;
  /** Bot API 8.0+ — открывает системный диалог "Добавить на гл. экран".
   * Результат синхронно не возвращается — слушать событие 'homeScreenAdded'. */
  addToHomeScreen?: () => void;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
