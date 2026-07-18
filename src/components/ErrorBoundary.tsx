import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackText?: string;
  onSwitchTo2D?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Unknown error occurred' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans z-[9999] relative">
          <div className="bg-slate-900/90 border border-slate-700/80 p-8 rounded-3xl max-w-md shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-3xl mb-1">
              🗺️
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {this.props.fallbackText || '3D Globe Mode Notice'}
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your current browser or graphics driver had trouble rendering the 3D WebGL sphere. Don't worry — you can instantly switch to the interactive 2D Map view with full navigation and location sync!
            </p>
            
            {this.props.onSwitchTo2D && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '' });
                  this.props.onSwitchTo2D?.();
                }}
                className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <span>Switch to 2D Map Engine</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="text-slate-400 hover:text-white text-xs underline mt-1 transition-colors"
            >
              Try Reloading Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
