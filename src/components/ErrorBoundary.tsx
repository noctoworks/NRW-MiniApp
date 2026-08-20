import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Без этого любой необработанный краш в рендере/эффекте молча гасит React-
 * дерево в пустой белый экран — ни строки, ни намёка, что пошло не так (см.
 * диалог: "белый экран, ничего не понимаю"). React 18 без границы ошибок
 * анмаунтит всё дерево целиком на первом же необработанном исключении — теперь
 * хотя бы видно, что именно упало, вместо гадания по переписке с пользователем. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            background: '#19242e',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Что-то пошло не так</p>
          <p style={{ opacity: 0.7, fontSize: 14, maxWidth: 320, margin: 0 }}>{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: '#3da8f5',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
            }}
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
