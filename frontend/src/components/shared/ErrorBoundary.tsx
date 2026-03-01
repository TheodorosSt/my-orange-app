/* ===================================
   ORANGE — Error Boundary
   Graceful crash recovery.
   =================================== */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('🟠 ORANGE Error Boundary:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full bg-orange-bg-primary p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-orange-text-primary mb-2">
              Κάτι πήγε στραβά
            </h3>
            <p className="text-sm text-orange-text-muted mb-6 leading-relaxed">
              Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400/60 bg-red-500/5 rounded-lg p-3 mb-4 overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-bg-tertiary border border-orange-border rounded-lg text-sm text-orange-text-secondary hover:border-orange-border-gold transition-all"
            >
              <RefreshCw size={14} />
              Δοκιμάστε ξανά
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}