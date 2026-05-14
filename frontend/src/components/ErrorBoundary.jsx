import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-8 bg-red-900/10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-red-400" size={24} />
                <h3 className="text-lg font-bold text-red-400">Terjadi Kesalahan</h3>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Ada masalah saat menampilkan konten. Silakan refresh halaman.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors"
              >
                Refresh Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
