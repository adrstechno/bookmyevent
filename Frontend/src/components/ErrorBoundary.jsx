import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to GoEventify</h1>
            <p className="text-gray-600 mb-6">
              We're experiencing a temporary issue loading this component. 
              Please refresh the page or try again later.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#3c6e71] text-white rounded-lg hover:bg-[#284b63] transition-colors"
            >
              Refresh Page
            </button>
            {this.props.showError && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Technical Details</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;