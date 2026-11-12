// App.tsx — tiny error boundary wrapper used around routed content.
import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center p-6 text-center">
          <div>
            <h1 className="font-display text-xl text-navy-900">ಏನೋ ತಪ್ಪಾಗಿದೆ</h1>
            <p className="mt-2 text-sm text-slate2">
              Something went wrong. Please reload the page.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
