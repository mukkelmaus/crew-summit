
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { AppError, ErrorType } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error | AppError) => void;
}

interface State {
  hasError: boolean;
  error: Error | AppError | null;
  errorInfo: ErrorInfo | null;
}

class ApiErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error | AppError): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error | AppError, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Uncaught API error:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error);
    }
    
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Use our error display component
      return (
        <div className="p-4 flex items-center justify-center min-h-[200px]">
          <ErrorDisplay 
            error={this.state.error || "An unexpected error occurred"}
            retry={this.handleRetry}
            showDetails={true}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;
